# app.py
from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load model bundle
import os
model_path = os.path.join(os.path.dirname(__file__), 'model', 'crop_recommender.pkl')
bundle = joblib.load(model_path)
model = bundle['model']
label_encoders = bundle.get('label_encoders', {})
crop_data = bundle['crop_data'].copy()
npk_max_sum = bundle.get('npk_max_sum', 1.0)

# helper to encode safely (if unseen, add and transform)
def safe_encode(colname, value):
    le = label_encoders.get(colname)
    if le is None:
        return 0
    val = str(value).lower().strip()
    # try direct match (we stored classes maybe lowercase?)
    classes = list(le.classes_)
    if val in classes:
        return int(le.transform([val])[0])
    # unseen: append to classes (keeps shape for transform)
    classes.append(val)
    le.classes_ = np.array(classes)
    return int(le.transform([val])[0])

@app.route('/')
def index():
    return jsonify({"status": "success", "message": "API is working!"})

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        # read user form
        district = request.form.get('district', '').strip().lower()
        taluq = request.form.get('taluq', '').strip().lower()
        soil = request.form.get('soil_type', '').strip().lower()
        season = request.form.get('season', '').strip().lower()
        # normalize season similar to train
        if season.startswith('k'): season_norm = 'kharif'
        elif season.startswith('r'): season_norm = 'rabi'
        elif season.startswith('a'): season_norm = 'annual'
        elif '/' in season: season_norm = 'both'
        else: season_norm = 'unknown'

        # user soil test values
        try:
            user_N = float(request.form.get('n') or 0)
            user_P = float(request.form.get('p') or 0)
            user_K = float(request.form.get('k') or 0)
            user_ph = float(request.form.get('ph') or np.nan)
        except:
            user_N = user_P = user_K = 0
            user_ph = np.nan

        # encode categorical features using saved encoders
        dist_enc = safe_encode('district', district)
        taluk_enc = safe_encode('taluq', taluq)
        season_enc = safe_encode('season', season_norm)
        # For soil we may not have an encoder; we will use soil_match later

        # Prepare temp_diff/rain_diff placeholders = 0 (since model expects these numeric features).
        # A better approach would be to fetch the region row and compute temp_diff/rain_diff accurately.
        # We'll try to fetch region row from region_cleaned to compute temp/rain diffs if available.
        region_df = pd.read_csv("data/cleaned/region_cleaned.csv")
        # look up matching region row for season
        region_row = region_df[
            (region_df['district'].astype(str).str.lower().str.strip() == district) &
            (region_df['taluq'].astype(str).str.lower().str.strip() == taluq)
        ]
        if not region_row.empty:
            region_row = region_row.iloc[0]
            # choose temp according to season
            if season_norm == 'rabi':
                region_temp = region_row.get('avg_temp_rabi', np.nan)
            elif season_norm == 'kharif':
                region_temp = region_row.get('avg_temp_kharif', np.nan)
            else:
                region_temp = np.nanmean([region_row.get('avg_temp_rabi', np.nan), region_row.get('avg_temp_kharif', np.nan)])
            rainfall_scaled = float(region_row.get('avg_rainfall', 0)) / 10.0
        else:
            region_temp = np.nan
            rainfall_scaled = np.nan

        # For each crop, compute features expected by model and get probability
        candidates = []
        for _, crop in crop_data.iterrows():
            # compute temp_diff and rain_diff relative to crop optimal
            temp_mean = crop.get('temp_mean', np.nan)
            humidity_mean = crop.get('humidity_mean', np.nan)

            temp_diff = abs(region_temp - temp_mean) if not pd.isna(region_temp) and not pd.isna(temp_mean) else 0.0
            rain_diff = abs(rainfall_scaled - humidity_mean) if not pd.isna(rainfall_scaled) and not pd.isna(humidity_mean) else 0.0

            # soil match between user's selected soil and crop main soil
            soil_crop = str(crop.get('main_soiltype','')).strip().lower()
            soil_match = 1 if soil_crop and (soil in soil_crop) else 0

            # crop nutrient/pH features
            crop_N = float(crop.get('N', 0))
            crop_P = float(crop.get('P', 0))
            crop_K = float(crop.get('K', 0))
            crop_ph = float(crop.get('ph_mean', np.nan))

            # Build feature vector matching training order:
            x_row = [
                dist_enc,
                taluk_enc,
                season_enc,
                temp_diff,
                rain_diff,
                soil_match,
                crop_N,
                crop_P,
                crop_K,
                crop_ph if not pd.isna(crop_ph) else 0.0
            ]
            x_df = pd.DataFrame([x_row], columns=['district','taluq','season','temp_diff','rain_diff','soil_match','crop_N','crop_P','crop_K','crop_ph'])
            prob = model.predict_proba(x_df)[0][1]  # probability of being suitable

            # compute NPK/ph similarity score to user input (lower is better)
            npk_diff_sum = abs(crop_N - user_N) + abs(crop_P - user_P) + abs(crop_K - user_K)
            npk_norm = npk_diff_sum / max(npk_max_sum, 1.0)  # normalized 0..1 (0 best)
            ph_diff = abs(crop_ph - user_ph) if not pd.isna(crop_ph) and not pd.isna(user_ph) else 0.0
            ph_norm = ph_diff / 14.0  # normalize by pH range

            # combine model prob and user npk/ph similarity
            alpha = 0.6  # weight for ML model probability
            beta = 0.4   # weight for user NPK/ph similarity (lower is better)
            final_score = alpha * prob + beta * (1 - (npk_norm + ph_norm)/2.0)  # higher is better

            candidates.append({
                'crop': crop['crop'],
                'prob': float(prob),
                'npk_norm': float(npk_norm),
                'ph_norm': float(ph_norm),
                'final_score': float(final_score),
                'yield_qtl_per_acre': crop.get('yield_qtl_per_acre'),
                'price_per_qtl_rs': crop.get('price_per_qtl_rs')
            })

        # sort by final_score descending
        recommended = sorted(candidates, key=lambda x: x['final_score'], reverse=True)[:5]

        # Get top 2 recommendations
        if recommended:
            def create_crop_response(crop, is_primary=True):
                def get_profit_category(yield_qtl, price):
                    if not yield_qtl or not price:
                        return "Unknown"
                    profit = yield_qtl * price
                    if profit > 100000: return "Very High 🔥"
                    elif profit > 75000: return "High ⬆️"
                    elif profit > 50000: return "Medium ➡️"
                    else: return "Moderate ⬇️"

                def get_sustainability_score(crop_data):
                    score = 0
                    if crop_data['prob'] > 0.7: score += 4
                    if crop_data['npk_norm'] < 0.5: score += 3
                    if crop_data['ph_norm'] < 0.3: score += 3
                    return min(score, 10)

                return {
                    'crop_name': f"{crop['crop']} 🌱",
                    'yield_data': f"{int(crop.get('yield_qtl_per_acre', 0))} quintals/acre",
                    'market_price': f"₹{int(crop.get('price_per_qtl_rs', 0)):,}/qtl",
                    'profit_margin': get_profit_category(
                        crop.get('yield_qtl_per_acre'), 
                        crop.get('price_per_qtl_rs')
                    ),
                    'sustainability': f"{get_sustainability_score(crop)}/10"
                }

            # Create response with primary and alternative crop
            response = {
                'location': f"{request.form.get('district', '').title()}, {request.form.get('taluq', '').title()}",
                **create_crop_response(recommended[0], True)
            }
            
            # Add alternative crop if available
            if len(recommended) > 1:
                response['alternative_crop'] = create_crop_response(recommended[1], False)

            response = jsonify(response)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({
                'error': 'No suitable crops found',
                'location': f"No recommendations for {request.form.get('district', '').title()}, {request.form.get('taluq', '').title()}"
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 404

    except Exception as e:
        print(f"Error processing recommendation: {str(e)}")
        response = jsonify({
            'error': str(e),
            'location': 'Error processing request'
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

if __name__ == '__main__':
    app.run(debug=True)

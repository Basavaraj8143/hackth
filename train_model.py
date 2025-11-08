# ============================
# File: train_model.py
# ============================

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# === 1. Load cleaned data ===
CROP_CSV = "data/cleaned/crop_cleaned.csv"
REGION_CSV = "data/cleaned/region_cleaned.csv"
OUT_MODEL = "model/crop_recommender.pkl"

crop_df = pd.read_csv(CROP_CSV)
region_df = pd.read_csv(REGION_CSV)

print(f"Loaded crop dataset: {crop_df.shape}")
print(f"Loaded region dataset: {region_df.shape}")

# === 2. Clean invalid / missing values ===
for col in ['N', 'P', 'K']:
    if col not in crop_df.columns:
        crop_df[col] = 0

for col in ['ph_lo', 'ph_mean', 'ph_hi']:
    if col not in crop_df.columns:
        crop_df[col] = np.nan

# Fix invalid values
crop_df['ph_mean'] = pd.to_numeric(crop_df['ph_mean'], errors='coerce').clip(lower=0, upper=14)
crop_df['humidity_mean'] = pd.to_numeric(crop_df.get('humidity_mean', pd.Series([np.nan]*len(crop_df))), errors='coerce').clip(lower=0, upper=100)
crop_df['temp_mean'] = pd.to_numeric(crop_df.get('temp_mean', pd.Series([np.nan]*len(crop_df))), errors='coerce').clip(lower=0, upper=60)

crop_df['N'] = pd.to_numeric(crop_df['N'], errors='coerce').fillna(0)
crop_df['P'] = pd.to_numeric(crop_df['P'], errors='coerce').fillna(0)
crop_df['K'] = pd.to_numeric(crop_df['K'], errors='coerce').fillna(0)
crop_df['ph_mean'] = crop_df['ph_mean'].fillna(crop_df['ph_mean'].median())

# === 3. Combine datasets (region × crop cartesian join) ===
region_df['key'] = 1
crop_df['key'] = 1
combined = pd.merge(region_df, crop_df, on='key').drop('key', axis=1)
combined.columns = combined.columns.str.replace('_x', '_region', regex=False)
combined.columns = combined.columns.str.replace('_y', '_crop', regex=False)

print("Combined dataset shape:", combined.shape)

# === 4. Normalize season values ===
def normalize_season(val):
    val = str(val).lower().strip()
    if val.startswith("k"): return "kharif"
    elif val.startswith("r"): return "rabi"
    elif val.startswith("a"): return "annual"
    elif "/" in val: return "both"
    else: return "unknown"

combined['season'] = combined['season'].apply(normalize_season)

# === 5. Compute derived features ===
def compute_features(row):
    # Convert rainfall (mm) to approx humidity-like percentage
    rainfall_scaled = row['avg_rainfall'] / 10.0 if not pd.isna(row['avg_rainfall']) else np.nan

    # Region temperature by season
    if row['season'] == 'rabi':
        region_temp = row['avg_temp_rabi']
    elif row['season'] == 'kharif':
        region_temp = row['avg_temp_kharif']
    else:
        region_temp = np.nanmean([row['avg_temp_rabi'], row['avg_temp_kharif']])

    temp_diff = abs(region_temp - row['temp_mean'])
    rain_diff = abs(rainfall_scaled - row['humidity_mean'])

    # Soil matching
    soil_crop = str(row.get('main_soiltype_crop', row.get('main_soiltype', ''))).strip().lower()
    soil_region = str(row.get('main_soiltype_region', row.get('main_soiltype', ''))).strip().lower()
    soil_match = 1 if soil_crop and soil_crop in soil_region else 0

    # Add crop NPK + pH features
    crop_N = float(row.get('N', 0))
    crop_P = float(row.get('P', 0))
    crop_K = float(row.get('K', 0))
    crop_ph = float(row.get('ph_mean', 7.0))

    return pd.Series({
        'temp_diff': temp_diff,
        'rain_diff': rain_diff,
        'soil_match': soil_match,
        'crop_N': crop_N,
        'crop_P': crop_P,
        'crop_K': crop_K,
        'crop_ph': crop_ph
    })

features_df = combined.apply(compute_features, axis=1)
combined = pd.concat([combined, features_df], axis=1)

# === 6. Generate heuristic labels ===
def heuristic_label(row):
    temp_ok = row['temp_diff'] <= 10
    rain_ok = row['rain_diff'] <= 40
    soil_ok = row['soil_match'] == 1
    return 1 if (temp_ok and rain_ok and soil_ok) else 0

combined['suitable'] = combined.apply(heuristic_label, axis=1)
print("Positive (suitable) samples:", combined['suitable'].sum())
print("Negative (not suitable) samples:", len(combined) - combined['suitable'].sum())

# === 7. Encode categorical features ===
label_encoders = {}
for col in ['district', 'taluq', 'season', 'main_soiltype']:
    if col in combined.columns:
        le = LabelEncoder()
        combined[col] = le.fit_transform(combined[col].astype(str))
        label_encoders[col] = le

# === 8. Train model ===
combined = combined.fillna(0)
X = combined[['district', 'taluq', 'season', 'temp_diff', 'rain_diff', 'soil_match', 'crop_N', 'crop_P', 'crop_K', 'crop_ph']]
y = combined['suitable']

if y.sum() == 0:
    print("\n⚠️ Warning: No positive samples found. Try relaxing thresholds.\n")
else:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)
    acc = model.score(X_test, y_test)
    print(f"Model accuracy: {acc:.3f}")

    # === 9. Save model ===
    os.makedirs('model', exist_ok=True)
    joblib.dump({
        'model': model,
        'label_encoders': label_encoders,
        'crop_data': crop_df,
        'npk_max_sum': max((crop_df['N'].max() + crop_df['P'].max() + crop_df['K'].max()), 1.0)
    }, OUT_MODEL)

    print("\n✅ Model saved successfully as model/crop_recommender.pkl")

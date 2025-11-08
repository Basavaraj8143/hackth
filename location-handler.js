// District to Taluk mapping with all possible variations of district names
const TALUKS_BY_DISTRICT = {
  // Bagalkot variations
  "Bagalkot": ["Jamkhandi", "Bilagi", "Hungund", "Mudhol", "Badami", "Bagalkot", "Ilkal", "Rabakavi-Banahatti"],
  "Bagalkot District": ["Jamkhandi", "Bilagi", "Hungund", "Mudhol", "Badami", "Bagalkot", "Ilkal", "Rabakavi-Banahatti"],
  
  // Belagavi variations
  "Belagavi": ["Belagavi", "Athani", "Bailhongal", "Chikodi", "Gokak", "Hukkeri", "Raybag", "Ramdurg", "Saundatti", "Khanapur", "Nippani"],
  "Belgaum": ["Belagavi", "Athani", "Bailhongal", "Chikodi", "Gokak", "Hukkeri", "Raybag", "Ramdurg", "Saundatti", "Khanapur", "Nippani"],
  "Belagavi (Belgaum)": ["Belagavi", "Athani", "Bailhongal", "Chikodi", "Gokak", "Hukkeri", "Raybag", "Ramdurg", "Saundatti", "Khanapur", "Nippani"],
  
  // Other districts
  "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad"],
  
  // Vijayapura variations
  "Vijayapura": ["Vijayapura", "Basavana Bagewadi", "Indi", "Sindagi", "Muddebihal"],
  "Bijapur": ["Vijayapura", "Basavana Bagewadi", "Indi", "Sindagi", "Muddebihal"],
  "Vijayapura (Bijapur)": ["Vijayapura", "Basavana Bagewadi", "Indi", "Sindagi", "Muddebihal"],
  
  "Dharwad": ["Dharwad", "Hubballi (Urban/Rural)", "Kalghatgi", "Kundgol", "Navalgund", "Annigeri"],
  "Gadag": ["Gadag", "Ron", "Nargund", "Shirhatti", "Mundargi"],
  
  // Kalaburagi variations
  "Kalaburagi": ["Kalaburagi", "Chincholi", "Sedam", "Chittapur", "Afzalpur", "Jevargi"],
  "Gulbarga": ["Kalaburagi", "Chincholi", "Sedam", "Chittapur", "Afzalpur", "Jevargi"],
  "Kalaburagi (Gulbarga)": ["Kalaburagi", "Chincholi", "Sedam", "Chittapur", "Afzalpur", "Jevargi"],
  
  "Haveri": ["Haveri", "Byadagi", "Ranebennur", "Hirekerur", "Shiggaon", "Savanur", "Hangal"],
  "Koppal": ["Koppal", "Gangavathi", "Kushtagi", "Yelburga", "Karatagi"],
  "Raichur": ["Raichur", "Sindhanur", "Manvi", "Lingasugur", "Devadurga", "Maski"]
};

// Function to initialize district and taluk selectors
function initLocationSelectors() {
  const districtSelect = document.getElementById('district');
  const talukSelect = document.getElementById('taluk');
  
  if (!districtSelect || !talukSelect) {
    console.error('Could not find district or taluk select elements');
    return;
  }
  
  console.log('Initializing location selectors...');
  console.log('District select found:', districtSelect);
  console.log('Taluk select found:', talukSelect);
  
  // Function to populate taluks based on selected district
  function populateTaluks() {
    const selectedDistrict = districtSelect.value;
    console.log('District selected:', selectedDistrict);
    
    // Find matching district (case insensitive and ignoring extra spaces)
    const districtKey = Object.keys(TALUKS_BY_DISTRICT).find(
      key => key.toLowerCase().replace(/\s+/g, '') === selectedDistrict.toLowerCase().replace(/\s+/g, '')
    );
    
    const taluks = districtKey ? TALUKS_BY_DISTRICT[districtKey] : [];
    console.log('Matching taluks:', taluks);
    
    // Clear existing options except the first one
    talukSelect.innerHTML = '<option value="">Select Taluk</option>';
    
    // Add taluks for selected district
    taluks.forEach(taluk => {
      const option = document.createElement('option');
      option.value = taluk;
      option.textContent = taluk;
      talukSelect.appendChild(option);
    });
    
    // Enable/disable taluk select based on district selection
    talukSelect.disabled = taluks.length === 0;
    console.log('Taluk select populated with', taluks.length, 'options');
  }
  
  // Add event listener for district change
  districtSelect.addEventListener('change', populateTaluks);
  
  // Initialize taluks if district is already selected
  if (districtSelect.value) {
    populateTaluks();
  }
  
  console.log('Location selectors initialized');
}

// Function to initialize with retry
function initializeWithRetry(attempt = 0) {
  const maxAttempts = 5;
  const delay = 300; // 300ms between attempts
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initializeWithRetry());
    return;
  }
  
  const districtSelect = document.getElementById('district');
  const talukSelect = document.getElementById('taluk');
  
  if (districtSelect && talukSelect) {
    console.log('DOM fully loaded and elements found, initializing...');
    initLocationSelectors();
  } else if (attempt < maxAttempts) {
    console.log(`Elements not found, retrying... (${attempt + 1}/${maxAttempts})`);
    setTimeout(() => initializeWithRetry(attempt + 1), delay);
  } else {
    console.error('Failed to initialize location selectors after', maxAttempts, 'attempts');
  }
}

// Start initialization
console.log('Starting location handler initialization...');
initializeWithRetry();

// Also try initializing when window loads
window.addEventListener('load', initializeWithRetry);

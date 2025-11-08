// Shared language toggle and translation utility for standalone pages
(function () {
  const translations = {
    en: {
      'nav-home': 'Home',
      'nav-crop': 'Crop Recommendation',
      'nav-disease': 'Disease Detection',
      'nav-dashboard': 'Dashboard',
      'nav-soil': 'Soil Testing Kit',
      'nav-about': 'About',
      'nav-contact': 'Contact',
      'hero-title': 'Smart Farming Powered by AI',
      'hero-subtitle': 'Revolutionizing agriculture with intelligent crop recommendations and disease detection',
      'cta-button': 'Get Crop Advice 🌾',
      'features-title': 'Our AI-Powered Solutions',
      'features-subtitle': 'Empowering farmers with cutting-edge technology for better yields and sustainable farming',
      'crop-rec-title': 'AI Crop Recommendation',
      'disease-title': 'Plant Disease Detection',
      'dashboard-title': 'Agricultural Dashboard',
      'contact-title': 'Contact Us',
      'about-title': 'About AgriSense',
      'soil-hero-title': 'Affordable Soil Testing Kit',
      'soil-hero-subtitle': 'Know your soil better for smarter farming decisions',
      'soil-cta-button': 'Request Your Kit Now 📦',
      'soil-why-title': 'Why Soil Testing Matters?',
      'soil-whats-included': "What's Included in the Kit?",
      'soil-request-title': 'Request Your Soil Testing Kit',
      'soil-request-subtitle': "Fill out the form below and we'll deliver the kit to your doorstep within 3-5 business days"
    },
    hi: {
      'nav-home': 'होम',
      'nav-crop': 'फसल सिफारिश',
      'nav-disease': 'रोग निदान',
      'nav-dashboard': 'डैशबोर्ड',
      'nav-soil': 'मिट्टी परीक्षण किट',
      'nav-about': 'के बारे में',
      'nav-contact': 'संपर्क',
      'hero-title': 'एआई द्वारा संचालित स्मार्ट खेती',
      'hero-subtitle': 'बुद्धिमान फसल सिफारिशों और रोग निदान के साथ कृषि में क्रांति',
      'cta-button': 'फसल सलाह प्राप्त करें 🌾',
      'features-title': 'हमारे एआई-संचालित समाधान',
      'features-subtitle': 'बेहतर उत्पादन और टिकाऊ खेती के लिए अत्याधुनिक तकनीक से किसानों को सशक्त बनाना',
      'crop-rec-title': 'एआई फसल सिफारिश',
      'disease-title': 'पौध रोग पहचान',
      'dashboard-title': 'कृषि डैशबोर्ड',
      'contact-title': 'संपर्क करें',
      'about-title': 'एग्रीसेंस के बारे में',
      'soil-hero-title': 'किफायती मिट्टी परीक्षण किट',
      'soil-hero-subtitle': 'स्मार्ट खेती के फैसलों के लिए अपनी मिट्टी को बेहतर जानें',
      'soil-cta-button': 'अभी अपनी किट का अनुरोध करें 📦',
      'soil-why-title': 'मिट्टी परीक्षण क्यों महत्वपूर्ण है?',
      'soil-whats-included': 'किट में क्या शामिल है?',
      'soil-request-title': 'अपनी मिट्टी परीक्षण किट का अनुरोध करें',
      'soil-request-subtitle': 'नीचे दिया गया फॉर्म भरें और हम 3-5 व्यावसायिक दिनों में किट आपके दरवाजे तक पहुंचा देंगे'
    },
    kn: {
      'nav-home': 'ಮುಖ್ಯ',
      'nav-crop': 'ಬೆಳೆ ಶಿಫಾರಸು',
      'nav-disease': 'ರೋಗ ಪತ್ತೆ',
      'nav-dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'nav-soil': 'ಮಣ್ಣು ಪರೀಕ್ಷಾ ಕಿಟ್',
      'nav-about': 'ಬಗ್ಗೆ',
      'nav-contact': 'ಸಂಪರ್ಕ',
      'hero-title': 'AI ನಿಂದ ಚಾಲಿತ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ',
      'hero-subtitle': ' ಬೆಳೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು ರೋಗ ಪತ್ತೆಯೊಂದಿಗೆ ಕೃಷಿಯಲ್ಲಿ ಕ್ರಾಂತಿ',
      'cta-button': 'ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಿರಿ 🌾',
      'features-title': 'ನಮ್ಮ AI-ಚಾಲಿತ ಪರಿಹಾರಗಳು',
      'features-subtitle': 'ಉತ್ತಮ ಇಳುವರಿ ಮತ್ತು ಸುಸ್ಥಿರ ಕೃಷಿಗಾಗಿ ರೈತರನ್ನು ತಂತ್ರಜ್ಞಾನದಿಂದ ಸಬಲೀಕರಿಸುವುದು',
      'crop-rec-title': 'AI ಬೆಳೆ ಶಿಫಾರಸು',
      'disease-title': 'ಸಸ್ಯ ರೋಗ ಪತ್ತೆ',
      'dashboard-title': 'ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'contact-title': 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'about-title': 'ಆಗ್ರಿಸೆನ್ಸ್ ಬಗ್ಗೆ',
      'soil-hero-title': 'ಕೈಗೆಟಕುವ ದರದಲ್ಲಿ ಮಣ್ಣು ಪರೀಕ್ಷಾ ಕಿಟ್',
      'soil-hero-subtitle': 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ನಿರ್ಧಾರಗಳಿಗಾಗಿ ನಿಮ್ಮ ಮಣ್ಣನ್ನು ಚೆನ್ನಾಗಿ ತಿಳಿದುಕೊಳ್ಳಿ',
      'soil-cta-button': 'ಈಗಲೇ ನಿಮ್ಮ ಕಿಟ್ ಅನ್ನು ವಿನಂತಿಸಿ 📦',
      'soil-why-title': 'ಮಣ್ಣು ಪರೀಕ್ಷೆ ಏಕೆ ಮುಖ್ಯ?',
      'soil-whats-included': 'ಕಿಟ್‌ನಲ್ಲಿ ಏನಿದೆ?',
      'soil-request-title': 'ನಿಮ್ಮ ಮಣ್ಣು ಪರೀಕ್ಷಾ ಕಿಟ್ ಅನ್ನು ವಿನಂತಿಸಿ',
      'soil-request-subtitle': 'ಕೆಳಗಿನ ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ ಮತ್ತು ನಾವು 3-5 ವ್ಯಾಪಾರ ದಿನಗಳಲ್ಲಿ ಕಿಟ್ ಅನ್ನು ನಿಮ್ಮ ಮನೆ ಬಾಗಿಲಿಗೆ ತಲುಪಿಸುತ್ತೇವೆ'
    }
  };

  const storageKey = 'agrisense_lang';
  let currentLanguage = localStorage.getItem(storageKey) || 'en';

  function translatePage(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
  }

  function initLanguage() {
    const select = document.getElementById('languageSelect');
    if (select) {
      select.value = currentLanguage;
      select.addEventListener('change', function () {
        currentLanguage = this.value;
        localStorage.setItem(storageKey, currentLanguage);
        translatePage(currentLanguage);
      });
    }
    translatePage(currentLanguage);
  }

  document.addEventListener('DOMContentLoaded', initLanguage);
})();

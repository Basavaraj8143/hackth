// Chatbot Widget
(function() {
  // Create chatbot widget HTML
  const chatbotHTML = `
    <div id="chatbotWidget" class="fixed bottom-6 right-6 z-50">
      <!-- Chatbot Button -->
      <button id="chatbotToggle" class="bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 focus:outline-none">
        <img src="chatbotlogo.webp" alt="Chatbot" class="w-10 h-10 rounded-full" />
      </button>

      <!-- Chatbot Window -->
      <div id="chatbotWindow" class="hidden absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-green-500">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="chatbotlogo.webp" alt="AgriBot" class="w-10 h-10 rounded-full border-2 border-white" />
            <div>
              <h3 class="font-bold text-lg">AgriBot 🌾</h3>
              <p class="text-xs opacity-90">Your Farming Assistant</p>
            </div>
          </div>
          <button id="chatbotClose" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all">
            <span class="text-2xl leading-none">×</span>
          </button>
        </div>

        <!-- Chat Messages -->
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          <!-- Welcome Message -->
          <div class="flex items-start space-x-2">
            <img src="chatbotlogo.webp" alt="Bot" class="w-8 h-8 rounded-full mt-1" />
            <div class="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
              <p class="text-sm text-gray-800">Hello! 👋 I'm AgriBot, your farming assistant. How can I help you today?</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div id="quickActions" class="px-4 py-2 bg-white border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            <button class="quick-action-btn text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-all">
              🌾 Crop Advice
            </button>
            <button class="quick-action-btn text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-all">
              🦠 Disease Help
            </button>
            <button class="quick-action-btn text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-all">
              🧪 Soil Testing
            </button>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <input 
                type="text" 
                id="chatInput" 
                placeholder="Type or speak your message..." 
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button id="voiceInputBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <button id="chatSend" class="bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all">
              <span class="text-xl">➤</span>
            </button>
          </div>
          <div id="voiceStatus" class="mt-2 text-xs text-center text-gray-500 hidden"></div>
        </div>
        <style>
          .pulse-animation {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
      </div>
    </div>
  `;

  // Initialize chatbot when DOM is ready
  function initChatbot() {
    // Insert chatbot HTML into body
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Get elements
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const chatMessages = document.getElementById('chatMessages');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isListening = false;
    let finalTranscript = '';
    let timeoutId = null;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        isListening = true;
        finalTranscript = '';
        chatInput.value = '';
        voiceInputBtn.classList.add('text-red-500', 'pulse-animation');
        voiceStatus.textContent = 'Listening...';
        voiceStatus.classList.remove('hidden');
      };

      recognition.onend = () => {
        isListening = false;
        voiceInputBtn.classList.remove('text-red-500', 'pulse-animation');
        if (voiceStatus.textContent === 'Listening...') {
          voiceStatus.textContent = 'Click the mic to speak';
        }
        // Auto-send if there's a final transcript
        if (finalTranscript.trim()) {
          sendMessage(finalTranscript);
        }
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        // Process both interim and final results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            // Reset the input field with the final transcript
            chatInput.value = finalTranscript.trim();
            // Set a timeout to send the message if the user stops speaking
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              if (isListening) {
                recognition.stop();
              }
            }, 1500); // 1.5 seconds of silence to consider the message complete
          } else {
            interimTranscript = transcript;
            // Show interim results in real-time
            chatInput.value = finalTranscript + interimTranscript;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        voiceStatus.textContent = `Error: ${event.error}`;
        setTimeout(() => voiceStatus.classList.add('hidden'), 3000);
        voiceInputBtn.classList.remove('text-red-500', 'pulse-animation');
      };

      voiceInputBtn.addEventListener('click', () => {
        try {
          if (isListening) {
            recognition.stop();
          } else {
            recognition.start();
          }
        } catch (error) {
          console.error('Speech recognition error:', error);
          voiceStatus.textContent = 'Error accessing microphone. Please check permissions.';
          voiceStatus.classList.remove('hidden');
          setTimeout(() => voiceStatus.classList.add('hidden'), 3000);
        }
      });
    } else {
      // Hide voice button if not supported
      voiceInputBtn.style.display = 'none';
    }

    // Toggle chatbot window
    chatbotToggle.addEventListener('click', () => {
      chatbotWindow.classList.toggle('hidden');
      if (!chatbotWindow.classList.contains('hidden')) {
        chatInput.focus();
        // Show voice input instructions if supported
        if (recognition) {
          voiceStatus.textContent = 'Click the mic to speak';
          voiceStatus.classList.remove('hidden');
        }
      } else if (isListening && recognition) {
        recognition.stop();
      }
    });

    // Close chatbot
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.add('hidden');
    });

    // Send message function
    function sendMessage(message) {
      if (!message.trim()) return;

      // Add user message
      const userMessageHTML = `
        <div class="flex items-start space-x-2 justify-end">
          <div class="bg-green-600 text-white rounded-2xl rounded-tr-none p-3 shadow-sm max-w-[80%]">
            <p class="text-sm">${message}</p>
          </div>
        </div>
      `;
      chatMessages.insertAdjacentHTML('beforeend', userMessageHTML);

      // Clear input
      chatInput.value = '';

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate bot response
      setTimeout(() => {
        const botResponse = getBotResponse(message);
        const botMessageHTML = `
          <div class="flex items-start space-x-2">
            <img src="chatbotlogo.webp" alt="Bot" class="w-8 h-8 rounded-full mt-1" />
            <div class="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
              <p class="text-sm text-gray-800">${botResponse}</p>
            </div>
          </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', botMessageHTML);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }

    // Send button click
    chatSend.addEventListener('click', () => {
      sendMessage(chatInput.value);
    });

    // Enter key to send
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage(chatInput.value);
      }
    });

    // Quick action buttons
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sendMessage(btn.textContent.trim());
      });
    });

    // Simple bot responses
    function getBotResponse(message) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('crop') || lowerMessage.includes('🌾')) {
        return "I can help you with crop recommendations! Visit our Crop Recommendation page where you can input your soil parameters (N, P, K, pH, rainfall, temperature) and get AI-powered crop suggestions. 🌾";
      } else if (lowerMessage.includes('disease') || lowerMessage.includes('🦠')) {
        return "For plant disease detection, please visit our Disease Detection page. You can upload a photo of your plant, and our AI will identify any diseases and suggest treatments. 🔬";
      } else if (lowerMessage.includes('soil') || lowerMessage.includes('🧪')) {
        return "Our Soil Testing Kit is available for just ₹300! It includes NPK analysis, pH testing, and organic matter measurement. Visit the Soil Testing page to request your kit. 🧪";
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return "Our services are very affordable! Soil Testing Kit: ₹300, and all our AI tools are FREE to use. 💰";
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! 👋 How can I assist you with your farming needs today?";
      } else if (lowerMessage.includes('thank')) {
        return "You're welcome! Happy farming! 🌱 Feel free to ask if you need anything else.";
      } else {
        return "I'm here to help with crop recommendations, disease detection, and soil testing. What would you like to know more about? 🌾";
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();

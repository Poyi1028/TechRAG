// 科技趨勢偵測平台 - 互動功能

document.addEventListener('DOMContentLoaded', function() {
  console.log('TechTrend科技趨勢平台初始化中...');
  
  // 初始化動畫效果
  initAnimations();
  
  // 初始化趨勢卡片交互
  initTrendCards();
  
  // 初始化搜尋功能
  initSearch();
  
  // 初始化訂閱表單
  initSubscription();
  
  // 初始化聊天機器人功能
  initChatBot();
  
  // 模擬API資料載入
  simulateDataLoading();
});

// 初始化動畫效果
function initAnimations() {
  // 為特定元素添加進入動畫
  const animateElements = document.querySelectorAll('.glass-effect, h1, h2, .tech-circuit');
  
  animateElements.forEach((element, index) => {
    // 延遲入場，創造階梯式動畫效果
    setTimeout(() => {
      element.classList.add('animate-fadeIn');
    }, index * 100);
  });
  
  // 科技感閃光效果
  const glowElements = document.querySelectorAll('.bg-blue-500, .bg-gradient-to-r');
  glowElements.forEach(element => {
    element.classList.add('animate-glow');
  });
}

// 初始化趨勢卡片交互
function initTrendCards() {
  const trendCards = document.querySelectorAll('.glass-effect');
  
  trendCards.forEach(card => {
    // 添加懸停效果類
    card.classList.add('hover-card-effect');
    
    // 添加點擊事件
    card.addEventListener('click', function() {
      // 在實際應用中，這裡會導航到詳情頁面
      const title = this.querySelector('h3')?.textContent || '未知趨勢';
      console.log(`查看趨勢詳情: ${title}`);
      
      // 模擬點擊反饋
      this.style.transform = 'scale(0.98)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
  
  // 為"閱讀更多"按鈕添加事件
  const readMoreButtons = document.querySelectorAll('button.text-blue-400');
  readMoreButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // 防止觸發卡片點擊事件
      const card = this.closest('.glass-effect');
      const title = card.querySelector('h3')?.textContent || '未知趨勢';
      console.log(`閱讀更多: ${title}`);
      
      // 模擬操作 - 在實際應用中會導航到詳情頁
      alert(`即將閱讀: ${title}`);
    });
  });
}

// 初始化搜尋功能
function initSearch() {
  const searchInput = document.querySelector('input[placeholder="Search tech trends..."]');
  const searchButton = searchInput?.nextElementSibling;
  
  if (searchInput && searchButton) {
    // 點擊搜尋按鈕
    searchButton.addEventListener('click', function() {
      performSearch(searchInput.value);
    });
    
    // 按Enter鍵搜尋
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        performSearch(this.value);
      }
    });
  }
}

// 執行搜尋
function performSearch(query) {
  if (!query.trim()) {
    alert('請輸入搜尋關鍵詞');
    return;
  }
  
  console.log(`搜尋趨勢: ${query}`);
  
  // 模擬搜尋結果 - 在實際應用中會請求API
  const fakeResults = [
    '人工智能在' + query + '的應用',
    query + '相關的區塊鏈發展',
    '元宇宙中的' + query + '技術',
    query + '在量子計算領域的突破'
  ];
  
  alert(`找到 ${fakeResults.length} 個與 "${query}" 相關的趨勢`);
  
  // 在實際應用中，這裡會更新DOM顯示搜尋結果
}

// 初始化訂閱表單
function initSubscription() {
  const subscribeForm = document.querySelector('.glass-effect input[type="email"]')?.closest('div.flex');
  const subscribeButton = subscribeForm?.querySelector('button');
  const emailInput = subscribeForm?.querySelector('input[type="email"]');
  
  if (subscribeButton && emailInput) {
    subscribeButton.addEventListener('click', function() {
      handleSubscription(emailInput);
    });
    
    emailInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        handleSubscription(this);
      }
    });
  }
}

// 處理訂閱
function handleSubscription(emailInput) {
  const email = emailInput.value.trim();
  
  if (!email) {
    alert('請輸入您的電子郵件地址');
    return;
  }
  
  if (!isValidEmail(email)) {
    alert('請輸入有效的電子郵件地址');
    return;
  }
  
  console.log(`訂閱科技趨勢報告: ${email}`);
  
  // 模擬API請求
  setTimeout(() => {
    alert(`感謝訂閱！我們將定期發送科技趨勢報告到 ${email}`);
    emailInput.value = '';
  }, 500);
}

// 電子郵件格式驗證
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 初始化聊天機器人功能
function initChatBot() {
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatChevron = document.getElementById('chat-chevron');
  
  if (!chatToggle || !chatContainer || !chatMessages || !chatInput || !chatSend) return;
  
  // 切換聊天界面顯示
  chatToggle.addEventListener('click', function() {
    chatContainer.classList.toggle('hidden');
    chatChevron.classList.toggle('fa-chevron-down');
    chatChevron.classList.toggle('fa-chevron-up');
    
    if (!chatContainer.classList.contains('hidden')) {
      chatInput.focus();
    }
  });
  
  // 點擊發送按鈕發送消息
  chatSend.addEventListener('click', function() {
    sendChatMessage();
  });
  
  // 按Enter鍵發送消息
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  
  // 發送聊天消息函數
  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // 添加用戶消息到聊天界面
    addMessageToChat('user', message);
    
    // 清空輸入框
    chatInput.value = '';
    
    // 模擬機器人思考
    setTimeout(() => {
      // 生成機器人回應
      const botResponse = generateBotResponse(message);
      
      // 添加機器人回應到聊天界面
      addMessageToChat('bot', botResponse);
      
      // 滾動到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
  }
  
  // 添加消息到聊天界面函數
  function addMessageToChat(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex mb-3';
    
    if (sender === 'user') {
      messageDiv.innerHTML = `
        <div class="flex-1"></div>
        <div class="bg-indigo-900/40 rounded-lg p-3 max-w-[80%]">
          <p class="text-gray-200">${message}</p>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 mr-2 flex-shrink-0">
          <i class="fas fa-robot text-white text-xs"></i>
        </div>
        <div class="bg-dark/80 rounded-lg p-3 max-w-[80%]">
          <p class="text-gray-300">${message}</p>
        </div>
      `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // 生成機器人回應函數
  function generateBotResponse(userMessage) {
    // 轉為小寫便於匹配
    const message = userMessage.toLowerCase();
    
    // Simple response logic
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! How can I help you with tech trends today?";
    } else if (message.includes('ai') || message.includes('artificial intelligence')) {
      return "Artificial Intelligence is evolving rapidly. Recent trends show increased focus on generative AI, multimodal models, and AI ethics. Would you like to know more about a specific AI area?";
    } else if (message.includes('blockchain') || message.includes('crypto')) {
      return "Blockchain technology continues to advance beyond cryptocurrencies. Key trends include DeFi (Decentralized Finance), NFTs, and enterprise blockchain solutions. Any specific aspect interests you?";
    } else if (message.includes('quantum')) {
      return "Quantum computing is making significant strides. Recent breakthroughs include error correction improvements and the race to achieve quantum advantage in practical applications.";
    } else if (message.includes('trend') || message.includes('popular')) {
      return "Current popular tech trends include generative AI, quantum computing, extended reality (XR), sustainable tech, and edge computing. Which area would you like to explore?";
    } else if (message.includes('metaverse')) {
      return "The metaverse concept continues to evolve, with developments in virtual worlds, digital assets, and immersive experiences. Companies are exploring both consumer and enterprise applications.";
    } else if (message.includes('thanks') || message.includes('thank you')) {
      return "You're welcome! Feel free to ask if you have more questions about tech trends.";
    } else {
      return "That's an interesting topic. I'd be happy to explore more about " + userMessage + " and how it relates to emerging tech trends. Could you specify what aspect you're most interested in?";
    }
  }
}

// 模擬資料載入
function simulateDataLoading() {
  // 模擬圖表數據
  setTimeout(() => {
    console.log('數據儀表板已載入');
    
    // 在實際應用中，這裡會使用Chart.js或D3.js繪製圖表
    // 此處僅為模擬效果
    
    // 獲取圖表容器
    const chartContainers = document.querySelectorAll('.bg-gray-800.bg-opacity-50.h-64');
    
    if (chartContainers.length >= 2) {
      // 模擬第一個圖表載入完成
      chartContainers[0].innerHTML = `
        <div class="text-center">
          <div class="mb-2">科技趨勢分布圖</div>
          <div class="flex justify-around">
            <div class="text-center">
              <div style="width: 50px; height: 50px; background: rgba(59, 130, 246, 0.7); border-radius: 50%; margin: 0 auto;"></div>
              <div class="mt-2">AI (45%)</div>
            </div>
            <div class="text-center">
              <div style="width: 35px; height: 35px; background: rgba(16, 185, 129, 0.7); border-radius: 50%; margin: 0 auto;"></div>
              <div class="mt-2">區塊鏈 (30%)</div>
            </div>
            <div class="text-center">
              <div style="width: 25px; height: 25px; background: rgba(139, 92, 246, 0.7); border-radius: 50%; margin: 0 auto;"></div>
              <div class="mt-2">元宇宙 (25%)</div>
            </div>
          </div>
        </div>
      `;
      
      // 模擬第二個圖表載入完成
      chartContainers[1].innerHTML = `
        <div class="p-4">
          <div class="mb-4 text-center">趨勢成長曲線</div>
          <div class="relative h-32">
            <div class="absolute bottom-0 left-0 h-1 w-full bg-gray-700"></div>
            <div class="absolute left-0 bottom-0 h-full w-0.5 bg-gray-700"></div>
            
            <div class="absolute bottom-4 left-[10%] h-8 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[20%] h-12 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[30%] h-20 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[40%] h-16 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[50%] h-24 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[60%] h-28 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[70%] h-20 w-2 bg-blue-500 rounded-t"></div>
            <div class="absolute bottom-4 left-[80%] h-24 w-2 bg-blue-500 rounded-t"></div>
            
            <div class="absolute bottom-0 left-[10%] text-xs">Q1</div>
            <div class="absolute bottom-0 left-[30%] text-xs">Q2</div>
            <div class="absolute bottom-0 left-[50%] text-xs">Q3</div>
            <div class="absolute bottom-0 left-[70%] text-xs">Q4</div>
          </div>
        </div>
      `;
    }
  }, 1000);
  
  // 模擬載入更多按鈕功能
  const loadMoreBtn = document.querySelector('button.bg-blue-600.hover\\:bg-blue-700');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 載入中...';
      
      // 模擬網路請求延遲
      setTimeout(() => {
        // 恢復按鈕文本
        this.innerHTML = '載入更多趨勢';
        
        // 提示用戶
        alert('目前沒有更多趨勢可載入。請稍後再試。');
      }, 1500);
    });
  }
} 
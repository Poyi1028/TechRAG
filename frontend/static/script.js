// 科技趨勢偵測平台 - 互動功能

// API 基礎 URL
const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', function() {
  console.log('TechTrend platform initializing...');
  
  // 初始化動畫效果
  initAnimations();
  
  // 獲取第一頁文章並初始化趨勢卡片
  fetchArticles(1);
  
  // 初始化搜尋功能
  initSearch();
  
  // 初始化聊天機器人功能
  initChatBot();
  
  // 初始化載入更多按鈕
  initLoadMoreButton();

  // 初始化滾動動畫
  initScrollAnimations();
});

// 目前的頁碼
let currentPage = 1;
// 暫存文章數據
let articlesData = {};

// 從API獲取文章
function fetchArticles(page) {
  // 顯示載入狀態
  const trendsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
  if (page === 1) {
    trendsContainer.innerHTML = '<div class="col-span-3 text-center py-10"><i class="fas fa-spinner fa-spin text-3xl"></i></div>';
  }
  
  // 發送API請求
  fetch(`${API_BASE_URL}/api/articles?page=${page}&size=6`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (page === 1) {
        // 第一頁清空容器
        trendsContainer.innerHTML = '';
      }
      
      // 暫存文章數據
      data.data.forEach(article => {
        articlesData[article.uri] = article;
      });
      
      // 渲染文章卡片
      renderArticleCards(data.data, trendsContainer);
      
      // 更新當前頁碼
      currentPage = page;
      
      // 初始化文章模態視窗功能
      initArticleModals();
      
      // 初始化趨勢卡片交互
      initTrendCards();
      
      // 如果已經是最後一頁，禁用載入更多按鈕
      const loadMoreBtn = document.querySelector('#load-more-btn');
      if (data.pagination.page >= data.pagination.pages) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.classList.add('opacity-50');
      } else {
        loadMoreBtn.disabled = false;
        loadMoreBtn.classList.remove('opacity-50');
      }
    })
    .catch(error => {
      console.error('Failed to fetch articles:', error);
      trendsContainer.innerHTML = '<div class="col-span-3 text-center py-10 text-red-500">Failed to load articles. Please try again later.</div>';
    });
}

// 渲染文章卡片
function renderArticleCards(articles, container) {
  articles.forEach((article, index) => {
    // 計算幾天前
    const publishedDate = new Date(article.published_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeAgo = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // 處理無圖片情況
    const hasImage = article.image && article.image.trim() !== '';
    const imageStyle = hasImage 
      ? `background-color: #222; display: flex; align-items: center; justify-content: center;`
      : 'background-color: #222; display: flex; align-items: center; justify-content: center;';
    
    const placeholderIcon = '<div class="absolute inset-0 flex items-center justify-center image-placeholder"><i class="fas fa-image text-gray-600 text-6xl"></i><span class="absolute text-sm text-gray-500 mt-16">No image available</span></div>';
    
    const card = document.createElement('div');
    card.className = 'tech-card fade-in-section glass-effect-card';
    card.setAttribute('data-delay', (index * 100).toString());
    card.innerHTML = `
      <div class="card-inner-content">
        <div class="h-48 bg-cover bg-center relative" style="${imageStyle}" data-image-url="${hasImage ? article.image : ''}">
          ${placeholderIcon}
        </div>
        <div class="p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-lg data-tag">Artificial Intelligence</span>
            <span class="text-gray-400 text-sm">${timeAgo}</span>
          </div>
          <h3 class="text-xl font-bold mb-3 text-light">${article.title}</h3>
          <p class="text-gray-300 font-light text-truncate">${article.summary}</p>
          <div class="flex justify-end items-center">
            <button class="text-gray-400 hover:text-light flex items-center read-more-btn" data-article-id="${article.uri}">
              Read More
            </button>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(card);
    
    // 如果有圖片，嘗試加載並設置超時
    if (hasImage) {
      const imageContainer = card.querySelector('.h-48');
      const imageUrl = article.image;
      const placeholder = imageContainer.querySelector('.image-placeholder');
      
      // 隱藏占位符
      placeholder.style.opacity = '0';
      
      // 創建一個臨時圖片對象來嘗試加載
      const tempImg = new Image();
      let imageLoaded = false;
      
      // 圖片加載成功
      tempImg.onload = function() {
        imageContainer.style.backgroundImage = `url('${imageUrl}')`;
        placeholder.style.display = 'none';
        imageLoaded = true;
      };
      
      // 圖片加載失敗
      tempImg.onerror = function() {
        placeholder.style.opacity = '1';
      };
      
      // 設置加載超時
      setTimeout(() => {
        if (!imageLoaded) {
          placeholder.style.opacity = '1';
          tempImg.src = ''; // 取消加載
        }
      }, 5000); // 5秒後超時
      
      // 開始加載
      tempImg.src = imageUrl;
    }
  });
}

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
}

// 初始化趨勢卡片交互
function initTrendCards() {
  const trendCards = document.querySelectorAll('.tech-card');
  
  trendCards.forEach(card => {
    // 點擊卡片效果
    card.addEventListener('click', function(e) {
      // 不觸發卡片點擊事件，如果點擊的是閱讀更多按鈕
      if (e.target.closest('.read-more-btn')) {
        return;
      }
      
      const title = this.querySelector('h3')?.textContent || 'Unknown Trend';
      console.log(`Viewing trend details: ${title}`);
      
      // 獲取卡片內的閱讀更多按鈕
      const readMoreBtn = this.querySelector('.read-more-btn');
      
      // 如果找到按鈕，模擬點擊它以打開模態視窗
      if (readMoreBtn) {
        readMoreBtn.click();
      }
    });
  });
}

// 初始化文章模態視窗功能
function initArticleModals() {
  // 綁定閱讀更多按鈕
  document.querySelectorAll('.read-more-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // 防止觸發卡片點擊事件
      const articleId = this.getAttribute('data-article-id');
      const article = articlesData[articleId];
      
      if (!article) {
        console.error('Article data not found:', articleId);
        return;
      }
      
      // 計算幾天前
      const publishedDate = new Date(article.published_at);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate - publishedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const timeAgo = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      // 處理無圖片情況
      const hasImage = article.image && article.image.trim() !== '';
      const modalImg = document.getElementById('modal-img');
      
      // 重置模態窗口圖片容器
      modalImg.style.backgroundImage = 'none';
      modalImg.innerHTML = '<div class="flex items-center justify-center w-full h-full image-placeholder"><i class="fas fa-image text-gray-600 text-6xl"></i><span class="absolute text-sm text-gray-500 mt-16">No image available</span></div>';
      modalImg.style.backgroundColor = '#222';
      modalImg.classList.add('flex', 'items-center', 'justify-center');
      
      // 如果有圖片URL，嘗試加載
      if (hasImage) {
        const placeholder = modalImg.querySelector('.image-placeholder');
        placeholder.style.opacity = '0';
        
        // 創建臨時圖片對象
        const tempImg = new Image();
        let imageLoaded = false;
        
        // 圖片加載成功
        tempImg.onload = function() {
          modalImg.style.backgroundImage = `url('${article.image}')`;
          modalImg.innerHTML = '';
          modalImg.classList.remove('flex', 'items-center', 'justify-center');
          modalImg.style.backgroundColor = '';
          imageLoaded = true;
        };
        
        // 圖片加載失敗
        tempImg.onerror = function() {
          placeholder.style.opacity = '1';
        };
        
        // 設置加載超時
        setTimeout(() => {
          if (!imageLoaded) {
            placeholder.style.opacity = '1';
            tempImg.src = ''; // 取消加載
          }
        }, 5000); // 5秒後超時
        
        // 開始加載
        tempImg.src = article.image;
      }
      
      document.getElementById('modal-title').innerText = article.title;
      document.getElementById('modal-tag').innerText = 'Artificial Intelligence';
      document.getElementById('modal-date').innerText = timeAgo;
      
      // 設置文章內容和來源資訊
      const contentWithSource = `
        ${article.content}
        <div class="mt-8 pt-4 border-t border-gray-700">
          <h4 class="text-lg font-bold text-gray-300 mb-2">Source</h4>
          <p class="text-gray-400">${article.source_title}</p>
          <a href="${article.url}" target="_blank" class="text-blue-400 hover:text-blue-300 flex items-center mt-2">
            <span>View Original Article</span>
            <i class="fas fa-external-link-alt ml-2 text-xs"></i>
          </a>
        </div>
      `;
      document.getElementById('modal-content').innerHTML = contentWithSource;
      
      document.getElementById('article-modal').classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滾動
    });
  });
  
  // 綁定關閉按鈕
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      document.getElementById('article-modal').classList.remove('active');
      document.body.style.overflow = ''; // 恢復背景滾動
    });
    
    // 修復懸停判斷問題
    modalClose.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    
    modalClose.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  }
  
  // 點擊模態視窗外部關閉
  const articleModal = document.getElementById('article-modal');
  if (articleModal) {
    articleModal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// 初始化載入更多按鈕
function initLoadMoreButton() {
  const loadMoreBtn = document.querySelector('#load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      // 保存原始文本
      const originalText = this.innerHTML;
      
      // 顯示載入中狀態
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
      this.classList.add('opacity-75');
      this.disabled = true;
      
      // 加載下一頁文章
      fetchArticles(currentPage + 1);
      
      // 延遲恢復按鈕文本
      setTimeout(() => {
        this.innerHTML = originalText;
        this.classList.remove('opacity-75');
      }, 1000);
    });
  }
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
    alert('Please enter a search keyword');
    return;
  }
  
  console.log(`Searching for: ${query}`);
  
  // 模擬搜尋結果 - 在實際應用中會請求API
  const fakeResults = [
    'AI applications in ' + query,
    query + ' related blockchain developments',
    'Metaverse ' + query + ' technology',
    query + ' breakthroughs in quantum computing'
  ];
  
  alert(`Found ${fakeResults.length} trends related to "${query}"`);
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
  
  // 全局變數用於存儲聊天歷史和前一次查詢的文檔
  let chatHistory = "";
  let prevDocs = [];
  
  // 切換聊天界面顯示
  chatToggle.addEventListener('click', function() {
    chatContainer.classList.toggle('active');
    chatToggle.classList.toggle('active');
    
    if (chatContainer.classList.contains('active')) {
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
    
    // 顯示機器人思考中的狀態
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex mb-3 typing-indicator';
    typingDiv.innerHTML = `
      <div class="w-8 h-8 rounded-full flex items-center justify-center bg-rainbow-animated mr-2 flex-shrink-0">
        <i class="fas fa-robot text-white text-xs"></i>
      </div>
      <div class="bg-dark/80 rounded-lg p-3 max-w-[80%]">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 調用聊天API
    fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: message,
        history: chatHistory,
        previous_docs_for_followup: prevDocs
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('聊天請求失敗');
      }
      return response.json();
    })
    .then(data => {
      // 移除思考中的狀態
      const typingIndicator = document.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
      
      // 添加機器人回應到聊天界面
      addMessageToChat('bot', data.answer);
      
      // 滾動到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 更新聊天歷史
      chatHistory += `User: ${message}\nAssistant: ${data.answer}\n`;
      
      // 更新前一次查詢的文檔
      prevDocs = data.raw_docs || [];
      
      // 如果有來源，添加來源展示
      if (data.sources && data.sources.length > 0) {
        // 創建來源容器
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'flex mb-3';
        
        // 添加來源內容
        let sourcesHTML = `
          <div class="w-8 h-8 mr-2 flex-shrink-0"></div>
          <div class="bg-gray-800/50 rounded-lg p-3 max-w-[80%] text-xs">
            <p class="text-gray-400 mb-1">Source:</p>
        `;
        
        // 添加每個來源
        data.sources.forEach((source, index) => {
          if (index < 3) { // 最多顯示前3個來源
            sourcesHTML += `
              <a href="${source.article_url}" target="_blank" class="text-blue-400 hover:text-blue-300 block mb-1">
                ${index + 1}. ${source.article_title}
              </a>
            `;
          }
        });
        
        sourcesHTML += `</div>`;
        sourcesDiv.innerHTML = sourcesHTML;
        
        // 添加到聊天界面
        chatMessages.appendChild(sourcesDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    })
    .catch(error => {
      console.error('聊天請求失敗:', error);
      
      // 移除思考中的狀態
      const typingIndicator = document.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
      
      // 添加錯誤消息
      addMessageToChat('bot', '抱歉，我現在無法回應。請稍後再試。');
      
      // 滾動到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
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
        <div class="w-8 h-8 rounded-full flex items-center justify-center bg-rainbow-animated mr-2 flex-shrink-0">
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
}

// 初始化滾動動畫效果
function initScrollAnimations() {
  // 滾動淡入效果
  const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const delay = entry.target.dataset.delay || 0;
              setTimeout(() => {
                  entry.target.classList.add('animate-fadeIn');
              }, delay);
              observer.unobserve(entry.target);
          }
      });
  }, observerOptions);
  
  const fadeElements = document.querySelectorAll('.fade-in-section');
  fadeElements.forEach(el => {
      el.style.opacity = 0;
      observer.observe(el);
  });
  
  // 平滑滾動效果
  const smoothScrollLinks = document.querySelectorAll('.smooth-scroll');
  smoothScrollLinks.forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
              window.scrollTo({
                  top: targetElement.offsetTop - 80, // 減去導航欄高度
                  behavior: 'smooth'
              });
          }
      });
  });
}
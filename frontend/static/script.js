// 科技趨勢偵測平台 - 互動功能

// API 基礎 URL
const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {
  console.log('TechRAG News platform initializing...');
  
  // 初始化動畫效果
  initAnimations();
  
  // 獲取第一頁文章
  fetchArticles(1);
  
  // 初始化搜尋功能
  initSearch();
  
  // 初始化聊天機器人功能
  initChatBot();
  
  // 初始化載入更多按鈕
  initLoadMoreButton();

  // 初始化滾動動畫
  initScrollAnimations();
  
  // 初始化模態視窗
  initArticleModals();
});

// 目前的頁碼
let currentPage = 1;
// 暫存文章數據
let articlesData = {};

// 從API獲取文章
function fetchArticles(page) {
  // 顯示載入狀態
  const newsListContainer = document.querySelector('#news-list');
  const featuredContainer = document.querySelector('#featured-news');
  
  if (page === 1) {
    newsListContainer.innerHTML = '<div class="text-center py-16"><i class="fas fa-spinner fa-spin text-4xl text-gray-500"></i><p class="text-gray-400 mt-4">Loading latest news...</p></div>';
    if (featuredContainer) {
      featuredContainer.innerHTML = '<div class="col-span-2 text-center py-16"><i class="fas fa-spinner fa-spin text-4xl text-gray-500"></i></div>';
    }
  }
  
  // 發送API請求
  fetch(`${API_BASE_URL}/api/articles?page=${page}&size=8`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (page === 1) {
        // 第一頁清空容器
        newsListContainer.innerHTML = '';
        if (featuredContainer) {
          featuredContainer.innerHTML = '';
        }
      }
      
      // 暫存文章數據
      data.data.forEach(article => {
        articlesData[article.uri] = article;
      });
      
      // 如果是第一頁，渲染頭條新聞
      if (page === 1 && featuredContainer && data.data.length >= 2) {
        renderFeaturedNews(data.data.slice(0, 2), featuredContainer);
        renderNewsList(data.data.slice(2), newsListContainer);
      } else {
        renderNewsList(data.data, newsListContainer);
      }
      
      // 更新當前頁碼
      currentPage = page;
      
      // 初始化新聞交互功能
      initNewsInteractions();
      
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
      newsListContainer.innerHTML = '<div class="text-center py-16 text-red-500"><i class="fas fa-exclamation-circle text-4xl mb-4"></i><p>Failed to load articles. Please try again later.</p></div>';
    });
}

// 渲染頭條新聞
function renderFeaturedNews(articles, container) {
  articles.forEach((article, index) => {
    const publishedDate = new Date(article.published_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeAgo = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    const hasImage = article.image && article.image.trim() !== '';
    
    const featuredCard = document.createElement('div');
    featuredCard.className = 'featured-news-card fade-in-section';
    featuredCard.setAttribute('data-delay', (index * 100).toString());
    featuredCard.innerHTML = `
      <div class="featured-image" style="background-image: url('${hasImage ? article.image : ''}'); background-size: cover; background-position: center;">
        ${!hasImage ? '<div class="absolute inset-0 flex items-center justify-center"><i class="fas fa-image text-gray-600 text-4xl"></i></div>' : ''}
      </div>
      <div class="featured-content">
        <div class="news-meta">
          <span class="news-date">
            <i class="fas fa-clock mr-1"></i>
            ${timeAgo}
          </span>
        </div>
        <h3 class="featured-title">${article.title}</h3>
        <div class="news-footer">
          <span class="news-source">${article.source_title}</span>
          <span class="news-read-more" data-article-id="${article.uri}">
            Read More <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
    `;
    
    container.appendChild(featuredCard);
    
    // 處理圖片載入
    if (hasImage) {
      handleImageLoading(featuredCard.querySelector('.featured-image'), article.image);
    }
  });
}

// 渲染新聞列表
function renderNewsList(articles, container) {
  articles.forEach((article, index) => {
    const publishedDate = new Date(article.published_at);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - publishedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const timeAgo = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    // 生成簡短摘要（如果有內容的話）
    const excerpt = article.content ? 
      article.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : 
      'Click to read the full article and discover more insights about this technology news.';
    
    // 檢查是否有圖片
    const hasImage = article.image && article.image.trim() !== '';
    
    const newsCard = document.createElement('div');
    newsCard.className = 'news-article-card fade-in-section';
    newsCard.setAttribute('data-delay', (index * 50).toString());
    newsCard.innerHTML = `
      <div class="news-card-content">
        <div class="news-image-container">
          ${hasImage ? 
            `<div class="news-image" style="background-image: url('${article.image}'); background-size: cover; background-position: center;"></div>` :
            `<div class="news-image news-image-placeholder">
              <i class="fas fa-image"></i>
              <span>No image</span>
            </div>`
          }
        </div>
        <div class="news-text-content">
          <div class="news-meta">
            <span class="news-date">
              <i class="fas fa-clock mr-1"></i>
              ${timeAgo}
            </span>
            <span class="news-date">
              <i class="fas fa-user mr-1"></i>
              ${article.source_title}
            </span>
          </div>
          <h3 class="news-title">${article.title}</h3>
          <p class="news-excerpt">${excerpt}</p>
          <div class="news-footer">
            <span class="news-source">Source: ${article.source_title}</span>
            <span class="news-read-more" data-article-id="${article.uri}">
              Read Full Article <i class="fas fa-external-link-alt"></i>
            </span>
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(newsCard);
    
    // 處理圖片載入
    if (hasImage) {
      const imageElement = newsCard.querySelector('.news-image');
      handleImageLoading(imageElement, article.image);
    }
  });
}

// 處理圖片載入
function handleImageLoading(imageElement, imageUrl) {
  let imageLoaded = false;
  
  const img = new Image();
  
  // 設置5秒超時
  const timeout = setTimeout(() => {
    if (!imageLoaded) {
      // 為新聞卡片圖片設置佔位符
      imageElement.style.backgroundImage = 'none';
      imageElement.classList.add('news-image-placeholder');
      imageElement.innerHTML = '<i class="fas fa-image"></i><span>Image not available</span>';
    }
  }, 5000);
  
  img.onload = function() {
    imageLoaded = true;
    clearTimeout(timeout);
    imageElement.style.backgroundImage = `url('${imageUrl}')`;
    imageElement.classList.remove('news-image-placeholder');
    imageElement.innerHTML = '';
  };
  
  img.onerror = function() {
    imageLoaded = true;
    clearTimeout(timeout);
    imageElement.style.backgroundImage = 'none';
    imageElement.classList.add('news-image-placeholder');
    imageElement.innerHTML = '<i class="fas fa-image"></i><span>Image not available</span>';
  };
  
  img.src = imageUrl;
}

// 初始化新聞交互功能
function initNewsInteractions() {
  // 綁定新聞卡片點擊事件
  document.querySelectorAll('.news-article-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // 如果點擊的是Read More按鈕，不要重複觸發
      if (e.target.closest('.news-read-more')) return;
      
      const readMoreBtn = this.querySelector('.news-read-more');
      const articleId = readMoreBtn?.getAttribute('data-article-id');
      if (articleId) {
        openArticleModal(articleId);
      }
    });
  });
  
  // 綁定所有讀更多按鈕和頭條新聞卡片
  document.querySelectorAll('.news-read-more, .featured-news-card').forEach(element => {
    element.addEventListener('click', function(e) {
      e.stopPropagation();
      const articleId = this.getAttribute('data-article-id') || this.querySelector('[data-article-id]')?.getAttribute('data-article-id');
      if (articleId) {
        openArticleModal(articleId);
      }
    });
  });
}

// 打開文章模態視窗
function openArticleModal(articleId) {
  const article = articlesData[articleId];
  
  if (!article) {
    console.error('Article data not found:', articleId);
    return;
  }
  
  // 計算時間
  const publishedDate = new Date(article.published_at);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - publishedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const timeAgo = diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  // 處理圖片
  const hasImage = article.image && article.image.trim() !== '';
  const modalImg = document.getElementById('modal-img');
  
  // 重置模態窗口圖片容器
  modalImg.style.backgroundImage = 'none';
  modalImg.innerHTML = '<div class="flex items-center justify-center w-full h-full image-placeholder"><i class="fas fa-image text-gray-600 text-6xl"></i><span class="absolute text-sm text-gray-500 mt-16">No image available</span></div>';
  modalImg.style.backgroundColor = '#222';
  
  // 載入圖片
  if (hasImage) {
    let modalImageLoaded = false;
    
    // 設置5秒超時
    const modalTimeout = setTimeout(() => {
      if (!modalImageLoaded) {
        modalImg.innerHTML = '<div class="flex items-center justify-center w-full h-full"><i class="fas fa-image text-gray-600 text-6xl"></i><span class="absolute text-sm text-gray-500 mt-16">Image not available</span></div>';
        modalImg.style.backgroundImage = 'none';
      }
    }, 5000);
    
    const tempImg = new Image();
    tempImg.onload = function() {
      modalImageLoaded = true;
      clearTimeout(modalTimeout);
      modalImg.style.backgroundImage = `url('${article.image}')`;
      modalImg.innerHTML = '';
    };
    tempImg.onerror = function() {
      modalImageLoaded = true;
      clearTimeout(modalTimeout);
      modalImg.innerHTML = '<div class="flex items-center justify-center w-full h-full"><i class="fas fa-image text-gray-600 text-6xl"></i><span class="absolute text-sm text-gray-500 mt-16">Image not available</span></div>';
      modalImg.style.backgroundImage = 'none';
    };
    tempImg.src = article.image;
  }
  
  // 設置模態內容
  document.getElementById('modal-title').innerText = article.title;
  document.getElementById('modal-date').innerText = timeAgo;
  
  const contentWithSource = `
    ${article.content}
    <div class="article-source">
      <h4>Source Information</h4>
      <p><strong>Publisher:</strong> ${article.source_title}</p>
      <a href="${article.url}" target="_blank">
        <span>View Original Article</span>
        <i class="fas fa-external-link-alt"></i>
      </a>
    </div>
  `;
  document.getElementById('modal-content').innerHTML = contentWithSource;
  
  // 顯示模態
  document.getElementById('article-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
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
  let isTyping = false; // 添加打字狀態標記
  
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
    if (!isTyping) { // 只有在不打字時才能發送
      sendChatMessage();
    }
  });
  
  // 按Enter鍵發送消息
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !isTyping) { // 只有在不打字時才能發送
      sendChatMessage();
    }
  });
  
  // 發送聊天消息函數
  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message || isTyping) return; // 如果正在打字則不發送
    
    // 設置打字狀態
    isTyping = true;
    
    // 添加用戶消息到聊天界面
    addMessageToChat('user', message);
    
    // 清空輸入框並禁用
    chatInput.value = '';
    chatInput.disabled = true;
    chatSend.disabled = true;
    
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
      
      // 添加機器人回應到聊天界面（使用打字機效果）
      addMessageToChat('bot', data.answer, () => {
        // 打字完成後的回調
        isTyping = false;
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
        
        // 如果有來源，添加來源展示
        if (data.sources && data.sources.length > 0) {
          addSourcesInfo(data.sources);
        }
      });
      
      // 更新聊天歷史
      chatHistory += `User: ${message}\nAssistant: ${data.answer}\n`;
      
      // 更新前一次查詢的文檔
      prevDocs = data.raw_docs || [];
    })
    .catch(error => {
      console.error('聊天請求失敗:', error);
      
      // 移除思考中的狀態
      const typingIndicator = document.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
      
      // 添加錯誤消息
      addMessageToChat('bot', '抱歉，我現在無法回應。請稍後再試。', () => {
        isTyping = false;
        chatInput.disabled = false;
        chatSend.disabled = false;
        chatInput.focus();
      });
    });
  }
  
  // 添加消息到聊天界面函數
  function addMessageToChat(sender, message, callback) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex mb-3';
    
    if (sender === 'user') {
      messageDiv.innerHTML = `
        <div class="flex-1"></div>
        <div class="bg-indigo-900/40 rounded-lg p-3 max-w-[80%]">
          <p class="text-gray-200">${message}</p>
        </div>
      `;
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      if (callback) {
        callback();
      }
    } else {
      // 機器人消息使用打字機效果
      const uniqueId = 'typing-text-' + Date.now();
      messageDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center bg-rainbow-animated mr-2 flex-shrink-0">
          <i class="fas fa-robot text-white text-xs"></i>
        </div>
        <div class="bg-dark/80 rounded-lg p-3 max-w-[80%]">
          <p class="text-gray-300" id="${uniqueId}"></p>
        </div>
      `;
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 開始打字機效果
      const textElement = messageDiv.querySelector('#' + uniqueId);
      typeWriter(textElement, message, 0, () => {
        if (callback) {
          callback();
        }
      });
    }
  }
  
  // 打字機效果函數
  function typeWriter(element, text, index, callback) {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      
      // 滾動到底部
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // 更快的打字速度
      const speed = Math.random() * 20 + 10; // 10-30ms之間，比之前快很多
      
      setTimeout(() => {
        typeWriter(element, text, index + 1, callback);
      }, speed);
    } else {
      // 打字完成
      if (callback) {
        callback();
      }
    }
  }
  
  // 添加來源信息函數
  function addSourcesInfo(sources) {
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'flex mb-3';
    
    // 添加來源內容
    let sourcesHTML = `
      <div class="w-8 h-8 mr-2 flex-shrink-0"></div>
      <div class="bg-gray-800/50 rounded-lg p-3 max-w-[80%] text-xs">
        <p class="text-gray-400 mb-1">Source:</p>
    `;
    
    // 添加每個來源
    sources.forEach((source, index) => {
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

// 初始化模態視窗
function initArticleModals() {
  // 綁定關閉按鈕
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      document.getElementById('article-modal').classList.remove('active');
      document.body.style.overflow = '';
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
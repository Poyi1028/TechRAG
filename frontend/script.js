// 科技趨勢偵測平台 - 互動功能

document.addEventListener('DOMContentLoaded', function() {
  console.log('TechTrend科技趨勢平台初始化中...');
  
  // 初始化動畫效果
  initAnimations();
  
  // 初始化趨勢卡片交互
  initTrendCards();
  
  // 初始化搜尋功能
  initSearch();
  
  // 初始化聊天機器人功能
  initChatBot();
  
  // 初始化文章模態視窗功能
  initArticleModals();
  
  // 初始化載入更多按鈕
  initLoadMoreButton();

  // 初始化滾動動畫
  initScrollAnimations();
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
      
      const title = this.querySelector('h3')?.textContent || '未知趨勢';
      console.log(`查看趨勢詳情: ${title}`);
      
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
  // 文章內容數據
  const articles = {
    'article-1': {
      title: 'Generative AI Drives Content Creation Revolution',
      tag: 'Artificial Intelligence',
      date: '2 days ago',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YWklMjBmdXR1cmV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
      content: `The latest generative AI technologies are reshaping content creation processes, influencing every area from text to visual design. Businesses across industries are adopting these tools to streamline creative workflows and generate more personalized content at scale. 
      <br><br>
      Companies like OpenAI, Anthropic, and Stability AI continue to release increasingly powerful models that can generate human-quality text, create photorealistic images, and even produce original music compositions. This democratization of content creation is enabling smaller organizations to compete with larger entities by producing high-quality content without massive creative teams.
      <br><br>
      However, concerns about intellectual property rights, content authenticity, and creative job displacement remain. Regulatory frameworks are struggling to keep pace with the rapid development of these technologies. As these AI systems continue to evolve, the boundary between human and machine-generated content is becoming increasingly blurred, raising important questions about creativity, originality, and the future of creative professions.
      <br><br>
      Experts predict that the next generation of generative models will focus on multimodal capabilities, allowing for seamless integration across different content types and more sophisticated understanding of context and intent. The companies that successfully implement these technologies while addressing ethical considerations will likely gain significant competitive advantages in the digital content landscape.`
    },
    'article-2': {
      title: 'Metaverse Platforms Integrate Blockchain and NFT Technology',
      tag: 'Metaverse',
      date: '3 days ago',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWV0YXZlcnNlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
      content: `The metaverse is creating new digital asset ownership and social experiences through integration of blockchain and NFT technologies. Leading metaverse platforms are now implementing comprehensive blockchain solutions to enable true digital ownership, allowing users to buy, sell, and trade virtual assets with verifiable provenance.
      <br><br>
      Companies like Decentraland, The Sandbox, and Roblox are at the forefront of this integration, creating robust digital economies where users can monetize their creations and activities. These platforms are seeing significant investment from major brands eager to establish their presence in virtual worlds, with luxury fashion houses, entertainment companies, and even financial institutions purchasing virtual land and creating immersive brand experiences.
      <br><br>
      The technology stack supporting these metaverse platforms continues to evolve, with improvements in rendering capabilities, interoperability standards, and accessibility across devices. Additionally, advances in haptic feedback technology and VR headsets are enhancing the immersive quality of metaverse experiences, blurring the line between physical and digital realities.
      <br><br>
      This convergence of technologies is opening up new economic opportunities while establishing robust frameworks for digital identity and property rights in virtual worlds. As these platforms mature, they are likely to become significant channels for commerce, entertainment, education, and social interaction, fundamentally changing how people connect and conduct business in digital spaces.`
    },
    'article-3': {
      title: 'Quantum Computing Breakthrough: 100 Qubit Processing Achieved',
      tag: 'Quantum Computing',
      date: '4 days ago',
      image: 'https://images.unsplash.com/photo-1631776247334-82ae01bda4e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cXVhbnR1bSUyMGNvbXB1dGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
      content: `Scientists announce a major breakthrough in quantum computing, successfully achieving stable 100-qubit computational processing. This milestone represents a significant step toward quantum advantage, where quantum computers can solve problems that classical computers cannot practically address.
      <br><br>
      The research team, composed of experts from leading quantum computing companies and research institutions, has developed a novel approach to qubit connectivity that significantly reduces decoherence issues that have previously limited quantum computing capabilities. This innovation allows for more complex quantum algorithms to be executed reliably, opening doors to practical applications in optimization problems, secure communications, and advanced simulations.
      <br><br>
      Additionally, the team has also developed new error correction techniques that maintain coherence for longer periods, potentially accelerating the timeline for practical quantum applications in cryptography, material science, and pharmaceutical research. This breakthrough comes as investments in quantum computing continue to grow, with governments and private companies worldwide recognizing its strategic importance for future technological leadership.
      <br><br>
      Industry analysts predict that this achievement could accelerate the timeline for quantum advantage in specific domains by several years, prompting increased investment in quantum-ready algorithms and quantum-resistant cryptography. Companies in finance, logistics, and pharmaceuticals are already exploring how to leverage this computational power for competitive advantage once these systems become commercially available.`
    }
  };
  
  // 綁定閱讀更多按鈕
  document.querySelectorAll('.read-more-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); // 防止觸發卡片點擊事件
      const articleId = this.getAttribute('data-article-id');
      const article = articles[articleId];
      
      document.getElementById('modal-title').innerText = article.title;
      document.getElementById('modal-tag').innerText = article.tag;
      document.getElementById('modal-date').innerText = article.date;
      document.getElementById('modal-img').style.backgroundImage = `url('${article.image}')`;
      document.getElementById('modal-content').innerHTML = article.content;
      
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
  const loadMoreBtn = document.querySelector('button.bg-rainbow-animated');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      // 保存原始文本
      const originalText = this.innerHTML;
      
      // 顯示載入中狀態
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';
      this.classList.add('opacity-75');
      this.disabled = true;
      
      // 模擬網路請求延遲
      setTimeout(() => {
        // 恢復按鈕文本
        this.innerHTML = originalText;
        this.classList.remove('opacity-75');
        this.disabled = false;
        
        // 提示用戶
        alert('All trends have been loaded. Check back later for updates!');
      }, 1500);
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
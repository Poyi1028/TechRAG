*<h1 align="center"> 🚀 Tech RAG </h1>*

Leverage **Large Language Models (LLMs)** and **Retrieval-Augmented Generation (RAG)** techniques to build an intelligent platform that fetches and answers queries about the latest technology news.

---

![專案截圖](index.png)

---

## 📚 Tech Stack

- **Backend**:
  ![Go](https://img.shields.io/badge/Go-008ECF?style=for-the-badge&logo=go&logoColor=white)
  ![Gin](https://img.shields.io/badge/Gin-008ECF?style=for-the-badge&logo=Gin&logoColor=white)
- **RAG Engine**:
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
  ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
- **Database**:
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Qdrant](https://img.shields.io/badge/Qdrant-00b3b3?style=for-the-badge&logo=qdrant&logoColor=white)
- **Chatbot Model**:
  ![Llama3](https://img.shields.io/badge/Llama3-0052CC?style=for-the-badge&logo=meta&logoColor=white)
- **News Source**:
  ![Event Registry](https://img.shields.io/badge/Event%20Registry-FF5722?style=for-the-badge&logo=news&logoColor=white)

![核心功能](features.png)

---

## ⚙️ Installation and Setup

1. **Clone the Project**

```bash
git clone https://github.com/yourname/tech-trend-rag-starter.git
cd tech-trend-rag-starter
```

2. **Configure Environment Variables**

```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

3. **Launch Development Environment (Docker)**

```bash
docker-compose up --build
```

This will start:
- Go Gin Server (localhost:8080)
- Python FastAPI Server (localhost:8000)
- PostgreSQL (localhost:5432)
- Qdrant (localhost:6333)

---

## 🔥 Development Progress

- [x] Basic Go Gin API Setup
- [x] Basic Python FastAPI RAG Setup
- [x] News Fetcher (Event Registry Integration)
- [x] RAG Integration with Qdrant
- [ ] Frontend Integration
- [ ] Dockerization and Deployment
- [ ] Testing and Optimization

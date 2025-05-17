# 使用官方 Python 映像作為基礎映像
FROM python:3.11-slim

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴文件
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製源代碼
COPY . .

# 暴露端口
EXPOSE 8000

# 運行應用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 
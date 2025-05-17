# 使用官方 Go 映像作為基礎映像
FROM golang:1.24

# 設置工作目錄
WORKDIR /app

# 複製 go.mod 和 go.sum 文件
COPY go.mod go.sum ./

# 下載依賴
RUN go mod download

# 複製源代碼
COPY . .

# 編譯應用
RUN go build -o main .

# 暴露端口
EXPOSE 8080

# 運行應用
CMD ["./main"] 
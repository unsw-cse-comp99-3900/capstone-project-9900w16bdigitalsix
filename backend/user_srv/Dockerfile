# 使用官方的 Golang 运行时作为基础镜像
FROM golang:1.22.3-alpine AS builder

# 设置容器内的工作目录
WORKDIR /app

# 复制 go mod 和 sum 文件
COPY go.mod go.sum ./

# 下载所有依赖
RUN go mod download

# 复制项目源代码到工作目录
COPY . .

# 构建 Go 应用
RUN go build -o user_srv .

# 从头开始一个新的阶段
FROM alpine:latest

# 设置容器内的工作目录
WORKDIR /app

# 从前一个阶段复制预构建的二进制文件
COPY --from=builder /app/user_srv .
COPY --from=builder /app/config-production.yaml .

# 暴露端口 50051
EXPOSE 50051

# 运行可执行文件的命令
CMD ["./user_srv"]

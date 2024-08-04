# Use the official Golang runtime as a base image
FROM golang:1.22.3-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy project source code to the working directory
COPY . .

# Build the Go application
RUN go build -o web .

# Build the init_test script
RUN go build -o init_test ./test_init/test_init.go

# Start a new stage from scratch
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Copy pre-built binaries from the previous stage
COPY --from=builder /app/web .
COPY --from=builder /app/init_test .
COPY --from=builder /app/config-production.yaml .

# Expose port 8080
EXPOSE 8080

# Command to run the executable
CMD ["./web"]

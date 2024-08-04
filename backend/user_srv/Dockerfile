# Use the official Golang runtime as a parent image
FROM golang:1.22.3-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the project source code to the working directory
COPY . .

# Build the Go application
RUN go build -o user_srv .

# Start a new stage from scratch
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the pre-built binaries from the previous stage
COPY --from=builder /app/user_srv .
COPY --from=builder /app/config-production.yaml .

# Expose port 50051 to the outside world
EXPOSE 50051

# Command to run the user_srv executable
CMD ["./user_srv"]

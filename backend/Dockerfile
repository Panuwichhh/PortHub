# Build stage
# Use latest Go 1.x (avoids version chase with dependencies)
FROM golang:alpine AS builder

WORKDIR /app

COPY . .
RUN go mod download && CGO_ENABLED=0 GOOS=linux go build -o server .

# Run stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]

FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy
RUN go build -o meeting-assistant

FROM alpine:latest AS backend
WORKDIR /app
COPY --from=builder /app/meeting-assistant ./meeting-assistant
EXPOSE 8080
ENV GIN_MODE=release
CMD ["./meeting-assistant"]
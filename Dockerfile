FROM golang:1.25.5-alpine AS builder

WORKDIR /app 

COPY ./ /app

RUN go build -o PHP . && chmod +x PHP

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app /app

CMD ["./PHP"]
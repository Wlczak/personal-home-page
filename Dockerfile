FROM golang:1.26.1-alpine AS builder

WORKDIR /app

COPY ./ /app

RUN rm -fr node_modules

RUN go build -ldflags "-s -w" -o PHP . && chmod +x PHP

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app /app

CMD ["./PHP"]
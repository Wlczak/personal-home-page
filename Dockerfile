FROM node:22-alpine AS frontend
WORKDIR /app
RUN apk add --no-cache font-dejavu
COPY package*.json ./
RUN npm ci
COPY astro.config.mjs tsconfig.json ./
COPY src ./src
COPY assets ./assets
COPY public ./public
RUN npm run build

FROM golang:1.26.6-alpine AS backend
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY main.go ./
RUN CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o /server .

FROM alpine:3.23
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=backend /server ./personal-home-page
COPY --from=frontend /app/dist ./dist
USER app
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1:8080/api/health || exit 1
CMD ["./personal-home-page"]

.DEFAULT_GOAL := help
.PHONY: help install build run dev test check vet fmt docker-build up down logs

help:
	@printf '%s\n' \
	  'make install       Install dependencies (Node 22.12+)' \
	  'make dev           Run Astro and Go at localhost:4321' \
	  'make build         Build Astro and the Go executable' \
	  'make run           Build and serve production at localhost:8080' \
	  'make check         Check Astro types and Go code' \
	  'make test          Run Go, development, and browser tests' \
	  'make fmt           Format Go files' \
	  'make docker-build  Build the production Docker image' \
	  'make up / down     Start / stop Docker Compose' \
	  'make logs          Follow Docker Compose logs'

install:
	npm ci
	go mod download

build:
	npm run build
	go build -trimpath -ldflags "-s -w" -o personal-home-page .

run: build
	./personal-home-page

dev:
	npm run dev

check: vet
	npm run check

test:
	go test ./...
	npm run test:dev
	npm run test:e2e

vet:
	go vet ./...

fmt:
	go fmt ./...

docker-build:
	docker build -t wlczak/personal-home-page:latest .

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

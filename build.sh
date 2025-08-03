#!/usr/bin/env bash
docker run --rm \
    -v "$(pwd)":/usr/src/app \
    -w /usr/src/app \
    node:lts-alpine3.22 \
    sh -c "npm install --no-save && npm run build"

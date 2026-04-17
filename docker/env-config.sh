#!/bin/sh
set -eu

: "${API_URL:=http://localhost:8000}"

sed "s|__API_URL__|${API_URL}|g" \
  /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js

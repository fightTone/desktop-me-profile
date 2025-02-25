#!/bin/sh

# Create necessary directories
mkdir -p /usr/share/nginx/html/data

# Generate file list
node /app/generate-file-list.js

# Start nginx
nginx -g 'daemon off;'

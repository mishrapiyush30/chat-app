#!/bin/bash
set -e

# Replace environment variables in the index.html file
echo "Replacing environment variables in index.html"
envsubst '${VITE_SUPABASE_URL} ${VITE_SUPABASE_ANON_KEY}' < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html

echo "Starting nginx"
# Execute the command passed as arguments
exec "$@" 
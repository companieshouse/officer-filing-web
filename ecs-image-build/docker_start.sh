#!/bin/bash
# Start script for officer-filing-web
PORT=3000
export NODE_PORT=${PORT}
exec node -r ./otel.js /opt/bin/www.js -- ${PORT}
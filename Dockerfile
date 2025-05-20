# Stage 1: Build Go application
FROM golang:1.24-alpine AS builder-go

WORKDIR /app/server

# Install build tools if necessary (e.g., git for private modules)
# RUN apk add --no-cache git

# Copy Go module files
COPY server/go.mod server/go.sum ./
# Ensure go.mod and go.sum are at the root of the 'server' directory in your project
# If they are in a subdirectory of 'server', adjust the COPY path accordingly.
RUN go mod download && go mod verify

# Copy the entire server source code
# Ensure your .dockerignore file excludes unnecessary files/folders from 'server'
COPY server/. .

# Build the Go application
# CGO_ENABLED=0 for a static binary. GOOS=linux for cross-compilation if Docker host isn't Linux.
# Replace ./main.go if your main package entrypoint is different (e.g., ./cmd/wikigo/main.go)
RUN CGO_ENABLED=0 GOOS=linux go build -v -o /app/wikigo.exe -ldflags="-s -w" ./main.go

# Stage 2: Build React client
FROM node:24-alpine AS builder-client

WORKDIR /app/client

# Copy package.json and lock file
# Ensure these files are at the root of the 'client' directory
COPY client/package.json client/package-lock.json* ./
# If you use yarn, copy client/yarn.lock and adjust npm commands to yarn

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the entire client source code
# Ensure your .dockerignore file excludes unnecessary files/folders from 'client'
COPY client/. .

# Build the client application
RUN npm run build
# The output will be in /app/client/dist (standard for Vite)

# Stage 3: Final image
FROM alpine:latest

WORKDIR /app

# Copy the Go executable from the builder-go stage
COPY --from=builder-go /app/wikigo.exe .

# Copy server views (assuming the Go app looks for them in a 'views' directory relative to the executable)
COPY --from=builder-go /app/server/views ./views

# Copy server data (runtime data like SQLite DBs, keys, etc.)
# This copies the initial data. For persistent data in production, use Docker volumes.
COPY --from=builder-go /app/server/data ./data

# Copy client build artifacts from builder-client stage to the public directory
# (assuming the Go app serves static files from a 'public' directory relative to the executable)
COPY --from=builder-client /app/build/public ./public

# Expose the port the application runs on
EXPOSE 8080
# Change this if your Go application listens on a different port.

# Set the entrypoint for the container
ENTRYPOINT ["./wikigo.exe"]

# Optional: Add a healthcheck if your Go application supports a health endpoint
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD wget -q -O - http://localhost:8080/health || exit 1
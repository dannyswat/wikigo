# WikiGO

A lightweight, file-based wiki application written in Go with a React front-end. It supports markdown editing, page revisions, user authentication, and inline Excalidraw diagrams.

## Features

- **Page Management**: Create, read, update, and delete wiki pages.
- **Rich Text Editing**: Uses CKEditor for WYSIWYG content editing.
- **Revision History**: Track changes and revert to previous revisions.
- **User Authentication**: Secure login, password change, and optional account lockout.
- **Excalidraw Diagrams**: Draw and embed diagrams directly in pages.
- **File-Based Storage**: Uses a simple filedb for data storage—no external database required.
- **Docker Support**: Single-container deployment with static Go binary and built React assets.

---

## Quick Start (Docker)

An official Docker image is available on Docker Hub: `dannyswat/wikigo`

### 1. Run with Docker

```bash
# Pull the latest image
docker pull dannyswat/wikigo:latest

# Start container (maps port 8080)
docker run -d \
  --name wikigo \
  -p 8080:8080 \
  -v $(pwd)/server/data:/app/data \
  -v $(pwd)/server/media:/app/media \
  dannyswat/wikigo:latest
```

The application will be available at http://localhost:8080

### 2. Using Docker Compose

A `docker-compose.yml` is provided for convenience:

```bash
# From project root
docker-compose up -d --build
```

This will build (if needed) and start the `wikigo` service, mounting `server/data` and `server/media` for persistence.

---

## Custom Build

### Prerequisites

- Go 1.21+
- Node.js 14+ and npm/Yarn
- Git (if using Go modules from VCS)

### 1. Build and run manually

```bash
# From project root
# 1) Build server
cd server
go build -o wikigo.exe ./cmd/web/main.go

# 2) Build client
cd ../client
npm install
npm run build

# 3) Copy client assets into server/public
rm -rf ../server/public/*
cp -r dist/* ../server/public/

# 4) Run the server
cd ../server
./wikigo.exe
```

The server listens on port 8080 by default. Browse to http://localhost:8080

### 2. Windows Build (build.bat)

A simple `build.bat` script is provided:

```bat
cd %~dp0
rmdir /s /q build
mkdir build\data
copy release\* build
mkdir build\public
copy server\public\* build\public
cd server
go build -o ..\build\wikigo.exe
cd ..\client
npm install
npm run build
copy dist\* ..\build\public
```

Run `build.bat` and then launch `build\wikigo.exe`.

---

## Configuration

The application reads files from:

- **Data**: `server/data` (mounted in Docker or local folder)
- **Media**: `server/media` (for diagram JSON, SVG, and uploads)
- **Views**: `server/views` (HTML templates)
- **Public**: `server/public` (static assets from React build)

You can override default settings via environment variables:

- `APP_PORT`: HTTP port (default `8080`)
- `GIN_MODE`: `release` or `debug` (for logging)

---

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.

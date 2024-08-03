# Folder Structure (Go)

## Objectives
- Onion Architecture with Domain Driven Design
- Easy to maintain and extend

## File or Folder
- main.go
  - Setup environment
  - Call startup
- common
  - handlers
  - repositories
  - utils
- data
  - Application data
- media
  - Uploaded files
- users
  - repositories
  - domain
- pages
  - repositories
  - domain
- keymgmt
  - repositories
  - domain
- wiki (application)
  - repositories
    - filedb
  - handlers
    - users (One endpoint per file)
    - pages (..)
    - keymgmt (..)
    - auth (..)
  - startup.go
    - Create all the dependencies
    - Register all the middlewares and routes
    - Startup tasks
#!/bin/bash

# Script to create a new release tag and push to trigger the workflow

set -e

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.0"
    exit 1
fi

VERSION=$1

# Validate version format (should start with 'v')
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
    echo "Error: Version should follow semantic versioning format (e.g., v1.0.0, v1.2.3-beta)"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "Error: There are uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Check if tag already exists
if git tag -l | grep -q "^$VERSION$"; then
    echo "Error: Tag $VERSION already exists"
    exit 1
fi

echo "Creating and pushing tag: $VERSION"

# Create the tag
git tag -a "$VERSION" -m "Release $VERSION"

# Push the tag to origin
git push origin "$VERSION"

echo "✅ Tag $VERSION created and pushed successfully!"
echo "🚀 GitHub Actions workflow should now start building and pushing the Docker image."
echo "📦 Check the Actions tab at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"

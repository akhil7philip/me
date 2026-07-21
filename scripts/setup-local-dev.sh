#!/bin/bash

# This script installs the dependencies required for local canvas development
# and OG image generation

echo "Setting up local development environment for canvas..."

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Detected macOS"
    if command -v brew >/dev/null 2>&1; then
        echo "Installing canvas dependencies via Homebrew..."
        brew install pkg-config cairo pango libpng jpeg giflib librsvg
    else
        echo "Homebrew not found. Please install Homebrew first:"
        echo "https://brew.sh/"
        exit 1
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    echo "Detected Linux"
    if command -v apt-get >/dev/null 2>&1; then
        echo "Installing canvas dependencies via apt..."
        sudo apt-get update
        sudo apt-get install -y build-essential pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
    elif command -v yum >/dev/null 2>&1; then
        echo "Installing canvas dependencies via yum..."
        sudo yum install -y gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
    else
        echo "Unsupported Linux distribution. Please install the following packages manually:"
        echo "- build-essential"
        echo "- pkg-config"
        echo "- libcairo2-dev"
        echo "- libpango1.0-dev"
        echo "- libjpeg-dev"
        echo "- libgif-dev"
        echo "- librsvg2-dev"
        exit 1
    fi
else
    echo "Unsupported operating system: $OSTYPE"
    echo "Please install canvas dependencies manually."
    echo "See: https://github.com/Automattic/node-canvas#compiling"
    exit 1
fi

# Install canvas package specifically
echo "Installing canvas npm package..."
npm install canvas

echo "Local development environment set up successfully!"
echo ""
echo "You can now generate OG images with: npm run generate-og"
echo "For local development with OG images: npm run build:local"
echo "Before deploying, run: npm run prepare-deploy" 
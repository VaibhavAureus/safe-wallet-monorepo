#!/bin/bash
set -e

# Enable corepack (required for Yarn 4)
corepack enable

# Prepare and activate Yarn 4.6.0
corepack prepare yarn@4.6.0 --activate

# Make sure corepack's directory is first in PATH
COREPACK_DIR=$(dirname $(which corepack))
export PATH="$COREPACK_DIR:$PATH"

# Verify we're using Yarn 4 (should show 4.6.0)
echo "Using Yarn version:"
yarn --version

# Install dependencies
yarn install --immutable

# Build the web app
yarn workspace @safe-global/web build


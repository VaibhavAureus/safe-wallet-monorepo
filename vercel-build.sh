#!/bin/bash
set -e

# Enable corepack (required for Yarn 4)
corepack enable

# Prepare and activate Yarn 4.6.0
corepack prepare yarn@4.6.0 --activate

# Install dependencies
yarn install --immutable

# Build the web app
yarn workspace @safe-global/web build


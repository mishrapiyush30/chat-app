#!/bin/bash

# This script helps set up Docker Hub credentials as GitHub secrets
# You need to have the GitHub CLI (gh) installed and authenticated

echo "Setting up Docker Hub credentials for GitHub Actions"
echo "==================================================="
echo

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) is not installed. Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if logged in to GitHub
gh auth status || {
    echo "Please login to GitHub CLI first with: gh auth login"
    exit 1
}

echo "Please enter your Docker Hub username:"
read docker_username

echo "Please enter your Docker Hub access token (will not be displayed):"
read -s docker_token
echo

# Set the secrets
echo "Setting GitHub secrets..."
gh secret set DOCKER_HUB_USERNAME --body "$docker_username"
gh secret set DOCKER_HUB_ACCESS_TOKEN --body "$docker_token"

echo "Done! Secrets have been set."
echo "To enable Docker Hub publishing, uncomment the 'publish' job in .github/workflows/docker-ci.yml" 
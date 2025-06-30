# Deployment Guide

This document explains how to deploy your chat application to various cloud platforms.

## Deploying with Docker

### Docker Hub

To push your Docker image to Docker Hub:

1. Run the `setup-docker-hub.sh` script:
   ```bash
   ./setup-docker-hub.sh
   ```

2. Uncomment the `publish` job in `.github/workflows/docker-ci.yml`

3. Push to your GitHub repository:
   ```bash
   git add .
   git commit -m "Enable Docker Hub publishing"
   git push
   ```

Your Docker image will now be built and published to Docker Hub on each push to the main branch.

## Deploying to Render.com

Render.com offers easy deployment of Docker containers:

1. Create an account on [Render.com](https://render.com)

2. Create a new Web Service and choose "Deploy an existing image from a registry"

3. Connect to your Docker Hub repository

4. Set the following environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

5. Get your Service ID from the Render dashboard URL: `https://dashboard.render.com/web/srv-XXXXXXXXXXXX`

6. Create an API key at [https://render.com/docs/api-keys](https://render.com/docs/api-keys)

7. Add the following secrets to your GitHub repository:
   - `RENDER_SERVICE_ID`: The Service ID from step 5
   - `RENDER_API_KEY`: The API key from step 6

Now your application will be automatically deployed to Render.com on each successful build.

## Deploying to AWS Elastic Beanstalk

For AWS Elastic Beanstalk deployment:

1. Create an Elastic Beanstalk environment with Docker platform

2. Install the AWS CLI and configure your credentials:
   ```bash
   aws configure
   ```

3. Create an `.elasticbeanstalk/config.yml` file in your project:
   ```yaml
   branch-defaults:
     main:
       environment: your-environment-name
   global:
     application_name: your-application-name
     default_platform: Docker
     default_region: us-west-2
     profile: default
     sc: git
   ```

4. Add AWS deployment secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

5. Uncomment the AWS deployment job in your workflow file or create a new one

## Deploying to Heroku

For Heroku deployment:

1. Create an account on [Heroku](https://heroku.com)

2. Install the Heroku CLI:
   ```bash
   npm install -g heroku
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```

4. Add the following secrets to your GitHub repository:
   - `HEROKU_API_KEY`: Your Heroku API key
   - `HEROKU_APP_NAME`: Your Heroku app name
   - `HEROKU_EMAIL`: Your Heroku email

5. Create a GitHub Actions workflow for Heroku deployment (already provided in the comments of docker-ci.yml) 
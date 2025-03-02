# Akhil Philip.

## Development Workflow

This project uses a special workflow for OG image generation to avoid issues with the `canvas` dependency in production.

### Local Development

1. **Setup your local environment for OG image generation**:
   ```bash
   ./scripts/setup-local-dev.sh
   ```
   This script installs the necessary system dependencies for canvas.

2. **Generate OG Images locally**:
   ```bash
   npm run generate-og
   ```
   This will create OG images in the `public/images/og` directory.

3. **Development with hot-reload** (without OG image generation):
   ```bash
   npm run dev
   ```

4. **Build and test locally with OG images**:
   ```bash
   npm run build:local
   ```

### Deployment

1. **Before deploying, update OG images and commit them**:
   ```bash
   npm run prepare-deploy
   ```
   This will generate new OG images, commit them to git, and push them.

2. **Deploy to production**:
   ```bash
   ./deploy.sh
   ```
   The deployment script skips canvas installation and uses pre-generated OG images.

## Technology Stack

- Next.js 13.5
- React 18
- Tailwind CSS
- Supabase
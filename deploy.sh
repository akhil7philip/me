# #!/bin/bash

# Remove existing node_modules to ensure clean install
echo "Removing existing node_modules..."
rm -rf .next
rm -rf node_modules
rm package-lock.json
rm pnpm-lock.yaml
rm -rf ~/.npm/_cacache

# # Run cleanup script to free up disk space
# echo "Running cleanup script to free up disk space..."
# bash scripts/cleanup.sh

# # Update and upgrade system packages
# sudo apt update && sudo apt upgrade -y

# # Install required dependencies
# sudo apt install -y curl git build-essential nginx

# # Install Node.js using NVM
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# # Install specific Node.js version and pnpm
# nvm install 18.20.5
# nvm use 18.20.5
# npm install -g pnpm

# Verify Node.js and pnpm installation
node --version
pnpm --version

# Install PM2 process manager globally
echo "Installing PM2..."
pnpm install -g pm2

# Install dependencies with canvas marked as optional
echo "Installing dependencies (skipping canvas)..."
# Install dependencies but exclude canvas by marking it as optional in package.json
# The --omit=optional flag skips installing any dependencies listed under "optionalDependencies"
# In our package.json, canvas is listed under optionalDependencies, so it gets skipped
# pnpm install --omit=optional
pnpm install

# Build the Next.js application
echo "Building Next.js application..."
pnpm run build

# Start the application with PM2
echo "Starting application with PM2..."
pm2 stop "me" || true
pm2 delete "me" || true
pm2 start pnpm --name "me" -- start -- -p 3000

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Execute the command that PM2 outputs

# Create Nginx configuration for the Next.js app
sudo tee /etc/nginx/sites-available/me << EOF
server {
    listen 80;
    server_name localhost akhilphilip.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site configuration
sudo rm -f /etc/nginx/sites-enabled/me
sudo ln -s /etc/nginx/sites-available/me /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If the test is successful, restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Configure the firewall
sudo apt install -y ufw
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "Next.js application deployment complete!"
echo "Your application should be accessible at http://akhilphilip.com"
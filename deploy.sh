# #!/bin/bash

# # Update and upgrade system packages
# sudo apt update && sudo apt upgrade -y

# # Install required dependencies
# sudo apt install -y curl git build-essential nginx

# # Install Node.js using NVM
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# # Install Node.js LTS version
# nvm install --lts
# nvm use --lts

# # Verify Node.js and npm installation
# node --version
# npm --version

# # Install PM2 process manager globally
# npm install -g pm2

# Install dependencies
npm ci

# No longer need to install serve globally since we're using Next.js server
# Install serve globally
# npm install -g serve

# Build the Next.js application
npm run build

# Start the application with PM2
pm2 stop "me" || true
pm2 delete "me" || true
pm2 start npm --name "me" -- start -- -p 3000

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
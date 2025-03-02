#!/bin/bash

echo "Starting server cleanup to free up disk space..."

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear node-gyp cache
echo "Clearing node-gyp cache..."
rm -rf ~/.node-gyp ~/.cache/node-gyp

# Remove old node_modules (optional - use with caution)
# echo "Removing old node_modules..."
# rm -rf node_modules

# Clear temporary files
echo "Clearing temporary files..."
sudo rm -rf /tmp/*

# Remove old log files
echo "Removing old log files..."
sudo find /var/log -type f -name "*.gz" -delete
sudo find /var/log -type f -name "*.old" -delete
sudo find /var/log -type f -name "*.1" -delete
sudo find /var/log -type f -name "*.2" -delete
sudo find /var/log -type f -name "*.3" -delete

# Clean apt cache
echo "Cleaning apt cache..."
sudo apt clean
sudo apt autoremove -y

# # Remove old unused kernels (use with caution)
# echo "Removing old kernels..."
# sudo apt remove --purge $(dpkg -l 'linux-*' | sed '/^ii/!d;/'"$(uname -r | sed "s/\(.*\)-\([^0-9]\+\)/\1/")"'/d;s/^[^ ]* [^ ]* \([^ ]*\).*/\1/;/[0-9]/!d') -y

# Clear journal logs
echo "Clearing journal logs..."
sudo journalctl --vacuum-time=3d

# Display current disk usage
echo "Current disk usage:"
df -h

echo "Cleanup complete!" 
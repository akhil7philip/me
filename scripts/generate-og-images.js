// This script will generate PNG versions of your game images
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuration
const sourceDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/og');
const width = 1200;
const height = 630;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateOgImage(filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#1a1a1a'; // Dark background
  ctx.fillRect(0, 0, width, height);

  // Add game image
  try {
    const image = await loadImage(path.join(sourceDir, filename));
    
    // Calculate dimensions (maintain aspect ratio, fit in center)
    const scale = Math.min(width * 0.6 / image.width, height * 0.6 / image.height);
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (width - imgWidth) / 2;
    const imgY = (height - imgHeight) / 3;
    
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
    
    // Add game title
    const title = filename.replace(/\.(svg|png|jpg|jpeg)$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, width / 2, height * 0.7);
    
    // Add website URL
    ctx.font = '30px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('akhilphilip.com', width / 2, height * 0.8);
    
    // Save image
    const outputFilename = filename.replace(/\.(svg|png|jpg|jpeg)$/, '.png');
    const outputPath = path.join(outputDir, outputFilename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Generated ${outputPath}`);
  } catch (err) {
    console.error(`Error processing ${filename}:`, err);
  }
}

// Generate a blog cover image
async function generateBlogCoverImage() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#1a1a1a'; // Dark background
  ctx.fillRect(0, 0, width, height);
  
  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(30, 41, 59, 0.8)');   // slate-800 with opacity
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)');   // slate-900 with opacity
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add blog title
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Akhil Philip', width / 2, height * 0.4);
  
  // Add tagline
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#94a3b8';  // slate-400
  ctx.fillText('Read, Code, Love', width / 2, height * 0.55);
  
  // Add decorative elements
  ctx.beginPath();
  ctx.moveTo(width/2 - 200, height * 0.65);
  ctx.lineTo(width/2 + 200, height * 0.65);
  ctx.strokeStyle = '#64748b';  // slate-500
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add website URL
  ctx.font = '30px Arial';
  ctx.fillStyle = '#cbd5e1';  // slate-300
  ctx.fillText('akhilphilip.com', width / 2, height * 0.75);
  
  // Save image
  const outputPath = path.join(outputDir, 'blog-cover.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Generated ${outputPath}`);
}

// Generate article-specific OG images
async function generateArticleOgImages() {
  try {
    // Import article metadata (this assumes the articles metadata is accessible)
    const articlesMetadataPath = path.join(__dirname, '../data/articles/metadata.ts');
    
    // We can't directly require a TypeScript file, so we'll parse the specific images from the file
    if (fs.existsSync(articlesMetadataPath)) {
      const metadataContent = fs.readFileSync(articlesMetadataPath, 'utf8');
      const imageRegex = /image: "\/images\/([^"]+)"/g;
      let match;
      const articleImages = [];
      
      while ((match = imageRegex.exec(metadataContent)) !== null) {
        articleImages.push(match[1]);
      }
      
      // Process each article image
      for (const imgFilename of articleImages) {
        try {
          const imgPath = path.join(sourceDir, imgFilename);
          if (fs.existsSync(imgPath)) {
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');

            // Set background
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);
            
            // Add gradient overlay
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(30, 41, 59, 0.6)');
            gradient.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Add article image
            const image = await loadImage(imgPath);
            
            // Calculate dimensions to cover the canvas with the image
            const scale = Math.max(width / image.width, height / image.height);
            const imgWidth = image.width * scale;
            const imgHeight = image.height * scale;
            const imgX = (width - imgWidth) / 2;
            const imgY = (height - imgHeight) / 2;
            
            // Draw the image with overlay to darken it
            ctx.globalAlpha = 0.8;  // Set the transparency
            ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
            ctx.globalAlpha = 1.0;  // Reset transparency
            
            // Add overlay to ensure text readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, width, height);
            
            // Add article title placeholder (would be replaced by actual metadata in the app)
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(imgFilename.replace(/\.(png|jpg|jpeg)$/, ''), width / 2, height * 0.5);
            
            // Add website URL
            ctx.font = '30px Arial';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('akhilphilip.com', width / 2, height * 0.9);
            
            // Save image
            const outputFilename = path.basename(imgFilename, path.extname(imgFilename)) + '-og.png';
            const outputPath = path.join(outputDir, outputFilename);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, buffer);
            
            console.log(`Generated article OG image: ${outputPath}`);
          }
        } catch (err) {
          console.error(`Error processing article image ${imgFilename}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error generating article OG images:', err);
  }
}

// Process all SVG files
fs.readdir(sourceDir, async (err, files) => {
  if (err) {
    console.error('Error reading source directory:', err);
    return;
  }
  
  const gameImages = files.filter(file => file.match(/\.(svg|png|jpg|jpeg)$/) && !file.includes('consciousness') && !file.includes('faith'));
  
  for (const file of gameImages) {
    await generateOgImage(file);
  }
  
  // Also generate the blog cover image
  await generateBlogCoverImage();
  
  // Generate article-specific OG images
  await generateArticleOgImages();
  
  console.log('All images processed!');
}); 
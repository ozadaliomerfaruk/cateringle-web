#!/usr/bin/env node

/**
 * PWA Icon Generator
 * 
 * Requires: npm install sharp
 * Usage: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  console.log('Generating PWA icons...\n');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('✓ Generated: apple-touch-icon.png');

  // Generate favicon (32x32)
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
  console.log('✓ Generated: favicon-32x32.png');

  // Generate favicon (16x16)
  await sharp(inputSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-16x16.png'));
  console.log('✓ Generated: favicon-16x16.png');

  // Generate badge icon for notifications (72x72)
  await sharp(inputSvg)
    .resize(72, 72)
    .png()
    .toFile(path.join(outputDir, 'badge-72x72.png'));
  console.log('✓ Generated: badge-72x72.png');

  // Generate shortcut icons
  const searchIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="16" fill="#16a34a"/>
      <circle cx="42" cy="42" r="18" fill="none" stroke="white" stroke-width="4"/>
      <line x1="54" y1="54" x2="70" y2="70" stroke="white" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
  
  await sharp(Buffer.from(searchIcon))
    .resize(96, 96)
    .png()
    .toFile(path.join(outputDir, 'search-icon.png'));
  console.log('✓ Generated: search-icon.png');

  const leadsIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="16" fill="#16a34a"/>
      <rect x="24" y="28" width="48" height="40" rx="4" fill="none" stroke="white" stroke-width="3"/>
      <line x1="32" y1="40" x2="64" y2="40" stroke="white" stroke-width="3"/>
      <line x1="32" y1="50" x2="56" y2="50" stroke="white" stroke-width="3"/>
      <line x1="32" y1="60" x2="48" y2="60" stroke="white" stroke-width="3"/>
    </svg>
  `;
  
  await sharp(Buffer.from(leadsIcon))
    .resize(96, 96)
    .png()
    .toFile(path.join(outputDir, 'leads-icon.png'));
  console.log('✓ Generated: leads-icon.png');

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const createZip = async () => {
  const outputPath = path.join(__dirname, '..', 'extension.zip');
  const distPath = path.join(__dirname, '..', 'dist');

  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist directory not found. Please run "npm run build" first.');
    process.exit(1);
  }

  // Remove existing zip file
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
  }

  // Create a file to stream archive data to
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Listen for all archive data to be written
  output.on('close', () => {
    const size = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log('✅ Extension packaged successfully!');
    console.log(`📦 File: extension.zip (${size} MB)`);
    console.log('🚀 Ready for Chrome Web Store upload');
  });

  // Handle warnings
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('⚠️  Warning:', err.message);
    } else {
      throw err;
    }
  });

  // Handle errors
  archive.on('error', (err) => {
    console.error('❌ Error creating zip:', err);
    throw err;
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add files from dist directory
  archive.directory(distPath, false);

  // Finalize the archive
  await archive.finalize();
};

// Run the script
createZip().catch((error) => {
  console.error('❌ Failed to create extension zip:', error);
  process.exit(1);
});
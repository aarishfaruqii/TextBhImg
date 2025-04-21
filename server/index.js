import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve processed images
app.use('/processed', express.static(join(__dirname, 'processed')));

app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Process the image using Sharp
    const image = sharp(req.file.buffer);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // For now, we'll just resize and format the image
    // In a real implementation, you would implement subject-background separation here
    const processedBuffer = await image
      .resize({
        width: metadata.width,
        height: metadata.height,
        fit: 'contain'
      })
      .png()
      .toBuffer();

    // Convert buffer to base64
    const base64Image = processedBuffer.toString('base64');
    
    res.json({
      processedImage: `data:image/png;base64,${base64Image}`,
      width: metadata.width,
      height: metadata.height
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
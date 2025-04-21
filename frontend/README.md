# Text Behind Image Editor

A web application that allows you to upload images, automatically remove backgrounds, and place customizable text behind the subject. The text can be positioned, resized, rotated, and styled according to your preferences.

## Features

- Image upload with drag and drop support
- Automatic background removal using AI
- Text positioning with draggable interface
- Resizable text box with corner handles
- Text styling options (font, size, color, opacity)
- Text rotation with slider control
- Over 100 Google Fonts to choose from, organized by category
- Font weight selection for typography control
- Visual font browser with live preview

## Technologies Used

- **Frontend**: React with Vite, Chakra UI, react-draggable, react-resizable
- **Backend**: Flask (Python) with rembg for background removal
- **Fonts**: Google Fonts API with dynamic loading

## Prerequisites

- Node.js (v18+)
- Python 3.x with pip
- Required Python packages: flask, flask-cors, rembg, pillow, numpy

## Installation

### Frontend Setup

```bash
# Install dependencies
npm install
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip3 install flask flask-cors rembg pillow numpy
```

## Running the Application

### Start the Backend Server

```bash
# From the server directory
python3 app.py
```

### Start the Frontend Development Server

```bash
# From the project root directory
npm run dev
```

The application will be available at http://localhost:3000

## Usage

1. Drag and drop an image or click to select one
2. Wait for the background removal process to complete
3. Enter your text in the input field
4. Customize the text appearance using the controls
5. Explore different fonts using the font browser
6. Select from various font weights to find the perfect style
7. Drag the text to position it behind the subject
8. Resize the text box using the corner handles
9. Rotate the text using the rotation controls

## Font System

The application features a comprehensive font system with:

- Over 100 Google Fonts organized in categories (sans-serif, serif, display, handwriting, monospace)
- Progressive font loading for better performance
- Font preview with customizable sample text
- Font weight selection with appropriate options for each font
- Visual font browser with filterable categories
- Font search functionality

## Notes

- The first time you use the application, the rembg library will download the necessary AI model, which may take some time depending on your internet connection.
- For best results, use images with clear subjects against contrasting backgrounds.
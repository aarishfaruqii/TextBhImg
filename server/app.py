from flask import Flask, request, jsonify
import tracebackfrom flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import base64
from PIL import Image
from rembg import remove
import numpy as np
import cv2
import argparse
import threading
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)
CORS(app)

# Ensure the processed directory exists
processed_dir = os.path.join(os.path.dirname(__file__), 'processed')
os.makedirs(processed_dir, exist_ok=True)

# Create a thread pool for parallel processing
executor = ThreadPoolExecutor(max_workers=4)

# Enable multi-threaded processing in OpenCV
cv2.setNumThreads(4)

# Cache for already processed images (simple in-memory cache)
image_cache = {}

def optimize_image_size(img, max_size=1200):
    """Resize large images for faster processing while maintaining quality."""
    width, height = img.size
    if max(width, height) > max_size:
        # Calculate new dimensions while preserving aspect ratio
        if width > height:
            new_width = max_size
            new_height = int(height * (max_size / width))
        else:
            new_height = max_size
            new_width = int(width * (max_size / height))
        
        # Resize for processing
        img_resized = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Return resized image and scale factor for later upscaling
        scale_factor = width / new_width  # or height / new_height
        return img_resized, scale_factor
    
    return img, 1.0

def fast_remove_background(img):
    """Optimized background removal with faster settings."""
    # Process with optimized settings (less alpha matting for speed)
    output = remove(
        img,
        alpha_matting=False,  # Turn off alpha matting for speed
        post_process_mask=True  # Enable built-in post-processing
    )
    
    # Fast alpha channel cleanup
    output_array = np.array(output)
    alpha_channel = output_array[:, :, 3]
    
    # Clean up shadows with simpler thresholding (faster)
    alpha_channel = np.where(alpha_channel < 180, 0, alpha_channel)
    
    # Skip Gaussian blur for speed
    # Make alpha more binary for cleaner results
    alpha_channel = np.where(alpha_channel < 100, 0, 255)
    
    # Update alpha channel
    output_array[:, :, 3] = alpha_channel
    
    return Image.fromarray(output_array)

@app.route('/api/process-image', methods=['POST'])
def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        img = Image.open(file.stream)
        
        # Store original image dimensions
        original_width = img.width
        original_height = img.height
        
        # Calculate a hash of the image data for caching
        file.stream.seek(0)
        file_hash = hash(file.stream.read())
        
        # Check if this image is in the cache
        if file_hash in image_cache:
            print("Using cached result")
            return image_cache[file_hash]
        
        # Store original image
        original_buffer = io.BytesIO()
        img.save(original_buffer, format='PNG')
        original_buffer.seek(0)
        original_img_str = base64.b64encode(original_buffer.getvalue()).decode('utf-8')
        
        # Optimize size for faster processing
        processing_img, scale_factor = optimize_image_size(img)
        
        # Fast background removal
        processed_image = fast_remove_background(processing_img)
        
        # Scale back to original size if needed
        if scale_factor != 1.0:
            processed_image = processed_image.resize((original_width, original_height), Image.LANCZOS)
        
        # Create a new image with the exact original dimensions
        final_output = Image.new('RGBA', (original_width, original_height), (0, 0, 0, 0))
        
        # Paste the processed image exactly centered on the canvas
        paste_x = (original_width - processed_image.width) // 2
        paste_y = (original_height - processed_image.height) // 2
        final_output.paste(processed_image, (paste_x, paste_y), processed_image)
        
        # Create a buffer to store the processed image
        subject_buffer = io.BytesIO()
        final_output.save(subject_buffer, format='PNG', quality=95)  # Slightly reduced quality for speed
        subject_buffer.seek(0)
        
        # Convert to base64 for sending to frontend
        subject_img_str = base64.b64encode(subject_buffer.getvalue()).decode('utf-8')
        
        # Prepare response
        response = jsonify({
            'originalImage': f'data:image/png;base64,{original_img_str}',
            'processedImage': f'data:image/png;base64,{subject_img_str}',
            'width': original_width,
            'height': original_height,
            'dimensions': {
                'width': original_width,
                'height': original_height
            }
        })
        
        # Cache the result (limited to 20 recent images)
        if len(image_cache) > 20:
            # Remove oldest item
            image_cache.pop(next(iter(image_cache)))
        image_cache[file_hash] = response
        
        return response
    
        except Exception as e:
            error_message = f"Error processing image: {str(e)}\n{traceback.format_exc()}"
            print(error_message)  # Log to console (and Render logs)
            return jsonify({'error': error_message}), 500


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4000, help='Port to run the server on')
    args = parser.parse_args()
    
    print(f"Starting server on port {args.port}")
    app.run(debug=True, port=args.port, threaded=True)

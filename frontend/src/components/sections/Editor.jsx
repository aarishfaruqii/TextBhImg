import { useState, useRef, useEffect } from 'react'
import { 
  Box, VStack, Text, Button, Flex, useToast, Spinner, Container, 
  Switch, FormControl, FormLabel, Slider, SliderTrack, SliderThumb, 
  SliderFilledTrack, Heading
} from '@chakra-ui/react'
import { useDropzone } from 'react-dropzone'
import Draggable from 'react-draggable'
import html2canvas from 'html2canvas'
import TextEditor from '../TextEditor'
import '../../styles/BoundingBox.css'

// Add a throttle utility function to smooth updates
const throttle = (callback, delay) => {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return callback(...args);
  };
};

function Editor() {
  // Image states
  const [originalImage, setOriginalImage] = useState(null)
  const [subjectImage, setSubjectImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [originalDimensions, setOriginalDimensions] = useState(null)
  
  // Text states
  const [overlayText, setOverlayText] = useState('Your Text Here')
  const [textStyle, setTextStyle] = useState({
    color: '#ffffff',
    fontSize: '48px',
    fontFamily: 'Arial',
    rotation: 0,
    opacity: 1,
    textAlign: 'center',
    fontStyle: 'normal',
    textDecoration: 'none'
  })
  const [textPosition, setTextPosition] = useState({ x: 100, y: 100 })
  const [textSize, setTextSize] = useState({ width: 300, height: 150 })
  const [actualTextSize, setActualTextSize] = useState({ width: 0, height: 0 })
  const [userResized, setUserResized] = useState(false)
  
  // Rotation states
  const [isRotating, setIsRotating] = useState(false)
  const [rotationStartAngle, setRotationStartAngle] = useState(0)
  const [rotationStartMousePosition, setRotationStartMousePosition] = useState({ x: 0, y: 0 })
  
  // UI states
  const [isActive, setIsActive] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showCenterGrid, setShowCenterGrid] = useState(false)
  const [gridSize, setGridSize] = useState(20) // Grid size in pixels
  
  // New state variables
  const [isSnappingH, setIsSnappingH] = useState(false);
  const [isSnappingV, setIsSnappingV] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  
  // Refs
  const imageContainerRef = useRef(null)
  const textBoxRef = useRef(null)
  const textContentRef = useRef(null)
  const rotationHandleRef = useRef(null)
  const toast = useToast()

  // Handle image upload and processing
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    
      setIsProcessing(true)
      
      // Load image to get natural dimensions before processing
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Store original dimensions
          const dimensions = {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
          setOriginalDimensions(dimensions)
          
          // Create high-quality preview using natural dimensions
          const canvas = document.createElement('canvas')
          const naturalWidth = img.naturalWidth
          const naturalHeight = img.naturalHeight
          canvas.width = naturalWidth
          canvas.height = naturalHeight
          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight) // Draw using natural dimensions
          
          const highQualityDataUrl = canvas.toDataURL('image/png', 1.0)
          setOriginalImage(highQualityDataUrl)
          
          // Center text on the new image based on image dimensions
          setTimeout(() => {
            // Center the text based on the image's natural dimensions
            const centerX = naturalWidth / 2
            const centerY = naturalHeight / 2
            
            // Position text in the center with appropriate fixed size
            const textWidth = 300 // Default text width
            const textHeight = 150 // Default text height
            
            setTextSize({ width: textWidth, height: textHeight })
            setTextPosition({ 
              x: centerX - textWidth / 2, 
              y: centerY - textHeight / 2 
            })
            
            // Make text active to highlight it initially
            setIsActive(true)
            
            // Update text style for better visibility
            setTextStyle(prev => ({
              ...prev,
              color: '#ffffff',  // White text for better visibility
              fontSize: '48px'   // Fixed initial font size
            }))
            
            // Set overlay text with a helpful prompt
            setOverlayText('Your Text Here')
          }, 100)
          
          // Skip server-side processing if API server is not available
          if (!window.API_SERVER_AVAILABLE) {
            setSubjectImage(highQualityDataUrl);
            setIsProcessing(false);
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)

      try {
        // Only try to contact server if we haven't already determined it's unavailable
        if (window.API_SERVER_AVAILABLE !== false) {
          const formData = new FormData()
          formData.append('image', file)

          // Set a timeout for the fetch to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch('https://imageprocessor-zjzc.onrender.com', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          })
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('Failed to process image')
          }

          const data = await response.json()
          setSubjectImage(data.processedImage)
          
          // Use dimensions from server if available
          if (data.dimensions) {
            setOriginalDimensions(data.dimensions)
          }
          
          // Server is available since we got a response
          window.API_SERVER_AVAILABLE = true;
        }
      } catch (error) {
        console.error('Error contacting image processing server:', error);
        
        // Mark server as unavailable for future uploads
        window.API_SERVER_AVAILABLE = false;
        
        // Use original image instead of processed image
        if (originalImage) {
          setSubjectImage(originalImage);
        }
        
        toast({
          title: 'Using local image preview',
          description: 'Could not connect to image processing server. Processing image locally instead.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsProcessing(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/*': []},
    maxFiles: 1
  })

  // Text position handlers
  const handleDragStop = (e, data) => {
    const { x, y } = data;
    
    // Calculate the center of the container
    const containerWidth = imageContainerRef.current?.clientWidth || 0;
    const containerHeight = imageContainerRef.current?.clientHeight || 0;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Get the width and height of the text element
    const textWidth = textSize.width;
    const textHeight = textSize.height;
    
    // Check if we're close to the center guidelines
    const isNearCenterX = Math.abs(x + textWidth / 2 - centerX) < 20;
    const isNearCenterY = Math.abs(y + textHeight / 2 - centerY) < 20;
    
    let newX = x;
    let newY = y;
    
    // Get grid lines for snapping
    const { horizontal, vertical } = getGridLines();
    
    // First check for center snapping (prioritize center over grid)
    if (isNearCenterX) {
      newX = centerX - textWidth / 2;
    } else {
      // Then check for grid snapping
      newX = snapToGrid(newX, vertical);
    }
    
    if (isNearCenterY) {
      newY = centerY - textHeight / 2;
    } else {
      // Then check for grid snapping
      newY = snapToGrid(newY, horizontal);
    }
    
    // Get the bounding box element to apply snapping classes
    const boundingBox = document.querySelector('.bounding-box');
    const centerGuideLayer = document.querySelector('.center-guide-layer');
    
    // Add appropriate snapping classes when snapping occurs
    if (isNearCenterX || isNearCenterY) {
      boundingBox?.classList.add('snapping');
      centerGuideLayer?.classList.add('snapping');
      
      if (isNearCenterX) {
        boundingBox?.classList.add('snapping-v');
      }
      
      if (isNearCenterY) {
        boundingBox?.classList.add('snapping-h');
      }
      
      // Remove the snapping classes after the animation completes
      setTimeout(() => {
        boundingBox?.classList.remove('snapping', 'snapping-v', 'snapping-h');
        centerGuideLayer?.classList.remove('snapping');
      }, 800);
    } else if (newX !== x || newY !== y) {
      // Apply grid snapping visual indicator
      boundingBox?.classList.add('grid-snapping');
      
      // Remove grid snapping class after animation completes
      setTimeout(() => {
        boundingBox?.classList.remove('grid-snapping');
      }, 800);
    }
    
    // Update the text position
    setTextPosition({ x: newX, y: newY });
    
    // Hide the center guide layer after a delay
    setTimeout(() => setShowCenterGrid(false), 800);
  };

  // Calculate grid lines for the preview area - simplified to just center guide
  const getGridLines = () => {
    if (!imageContainerRef.current) return { horizontal: [], vertical: [], snapPoints: [] }
    
    const container = imageContainerRef.current
    const { width, height } = container.getBoundingClientRect()
    
    const horizontal = []
    const vertical = []
    const snapPoints = []
    
    // For center cross guide - always enabled
    // Calculate the center of the container
    const centerX = Math.round(width / 2)
    const centerY = Math.round(height / 2)
    
    // Add only the center lines
    horizontal.push(centerY)
    vertical.push(centerX)
    snapPoints.push({ x: centerX, y: centerY })
    
    // Additional grid lines for snapping (only used for calculations, not visible)
    if (gridSize > 0) {
      // Add horizontal grid lines
      for (let y = gridSize; y < height; y += gridSize) {
        if (Math.abs(y - centerY) > 5) { // Avoid duplicating center line
          horizontal.push(y)
        }
      }
      
      // Add vertical grid lines
      for (let x = gridSize; x < width; x += gridSize) {
        if (Math.abs(x - centerX) > 5) { // Avoid duplicating center line
          vertical.push(x)
        }
      }
    }
    
    return { horizontal, vertical, snapPoints }
  }
  
  // Helper function to snap a value to the nearest grid line
  const snapToGrid = (value, gridLines, threshold = 10) => {
    let snapped = value;
    let minDistance = threshold;
    
    for (const line of gridLines) {
      const distance = Math.abs(value - line);
      if (distance < minDistance) {
        minDistance = distance;
        snapped = line;
      }
    }
    
    return snapped;
  }
  
  // Rotation handlers
  const handleRotationStart = (e) => {
    e.stopPropagation()
    setIsRotating(true)
    
    const textBoxRect = textBoxRef.current.getBoundingClientRect()
    const textBoxCenter = {
      x: textBoxRect.left + textBoxRect.width / 2,
      y: textBoxRect.top + textBoxRect.height / 2
    }
    
    const mousePosition = { x: e.clientX, y: e.clientY }
    const angle = Math.atan2(
      mousePosition.y - textBoxCenter.y,
      mousePosition.x - textBoxCenter.x
    )
    
    setRotationStartAngle(angle - (textStyle.rotation * Math.PI / 180))
    setRotationStartMousePosition(mousePosition)
  }
  
  const handleRotationMove = (e) => {
    if (!isRotating) return
    
    const textBoxRect = textBoxRef.current.getBoundingClientRect()
    const textBoxCenter = {
      x: textBoxRect.left + textBoxRect.width / 2,
      y: textBoxRect.top + textBoxRect.height / 2
    }
    
    const mousePosition = { x: e.clientX, y: e.clientY }
    const angle = Math.atan2(
      mousePosition.y - textBoxCenter.y,
      mousePosition.x - textBoxCenter.x
    )
    
    let newRotation = ((angle - rotationStartAngle) * 180 / Math.PI) % 360
    
    // Snap rotation to 45-degree increments - always enabled
      newRotation = Math.round(newRotation / 45) * 45
    
    setTextStyle(prev => ({
      ...prev,
      rotation: newRotation
    }))
  }
  
  const handleRotationEnd = () => {
    setIsRotating(false)
  }
  
  // Update text box size based on content
  useEffect(() => {
    if (textContentRef.current) {
      // Delay measurement to ensure fonts are loaded
      const measureText = () => {
        const textElement = textContentRef.current
        if (textElement) {
          // Get the full text content size
          const { width, height } = textElement.getBoundingClientRect()
          
          // Add extra padding to ensure text fits comfortably and doesn't get cut off
          const fontSize = parseInt(textStyle.fontSize)
          const paddingX = Math.min(60, Math.max(30, fontSize * 0.1))
          const paddingY = Math.min(40, Math.max(20, fontSize * 0.1))
          
          // For multi-line text, add more vertical padding
          const lines = overlayText.split('\n').length
          const extraVerticalPadding = lines > 1 ? paddingY * (lines * 0.2) : 0
          
          const newSize = {
            width: Math.max(width + paddingX, 80),
            height: Math.max(height + paddingY + extraVerticalPadding, 50)
          }
          
          setActualTextSize(newSize)
          
          // Only adjust size if user hasn't manually resized
          if (!userResized) {
            setTextSize(newSize)
          } 
          // Don't resize if user has manually set the size
        }
      }
      
      // Initial measurement
      setTimeout(measureText, 100)
    }
  }, [overlayText, textStyle.fontSize, textStyle.fontFamily, textStyle.fontWeight, userResized])

  // Reset userResized when font size changes
  useEffect(() => {
    setUserResized(false)
  }, [textStyle.fontSize])
  
  // Set up rotation event listeners
  useEffect(() => {
    if (isRotating) {
      window.addEventListener('mousemove', handleRotationMove)
      window.addEventListener('mouseup', handleRotationEnd)
    }
    
    return () => {
      window.removeEventListener('mousemove', handleRotationMove)
      window.removeEventListener('mouseup', handleRotationEnd)
    }
  }, [isRotating])

  // Keyboard event handlers for shift key
  const handleKeyDown = (e) => {
    if (e.key === 'Shift' && textBoxRef.current && isActive) {
      textBoxRef.current.classList.add('resizing')
    }
  }
  
  const handleKeyUp = (e) => {
    if (e.key === 'Shift' && textBoxRef.current) {
      textBoxRef.current.classList.remove('resizing')
    }
  }
  
  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isActive])

  // Handle resize events
  const handleResizeStart = (e, direction) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = textSize.width
    const startHeight = textSize.height
    
    // Mark as user-resized to prevent auto-resize
    setUserResized(true)
    
    // Add resizing indicator class
    if (textBoxRef.current) {
      textBoxRef.current.classList.add('resizing')
      // Add a subtle transition for smoother visual updates
      textBoxRef.current.style.transition = 'all 0.05s ease-out'
    }

    // Get grid lines for snapping
    const { horizontal, vertical } = getGridLines()
    
    // Get current position
    const startPosition = { ...textPosition }
    
    // Create a throttled version of the state updates for smoother rendering
    const updateStatesThrottled = throttle((newWidth, newHeight, newPosition) => {
      // Update size
      setTextSize({ width: newWidth, height: newHeight })
      
      // Update position if it changed
      if (newPosition && (newPosition.x !== textPosition.x || newPosition.y !== textPosition.y)) {
        setTextPosition(newPosition)
      }
    }, 16); // Aim for 60fps (1000ms / 60 ≈ 16ms)
    
    const handleMouseMove = (moveEvent) => {
      let deltaX = 0
      let deltaY = 0
      
      switch (direction) {
        case 'nw':
          deltaX = startX - moveEvent.clientX
          deltaY = startY - moveEvent.clientY
          // Maintain aspect ratio when shift is pressed
          if (moveEvent.shiftKey) {
            const aspectRatio = startWidth / startHeight
            // Use the larger delta to determine the scale
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              deltaY = deltaX / aspectRatio
            } else {
              deltaX = deltaY * aspectRatio
            }
          }
          break
        case 'n':
          deltaY = startY - moveEvent.clientY
          // Maintain aspect ratio when dragging from top only if shift key is pressed
          if (moveEvent.shiftKey) {
            deltaX = deltaY * (startWidth / startHeight)
          } else {
            deltaX = 0
          }
          break
        case 'ne':
          deltaX = moveEvent.clientX - startX
          deltaY = startY - moveEvent.clientY
          // Maintain aspect ratio when shift is pressed
          if (moveEvent.shiftKey) {
            const aspectRatio = startWidth / startHeight
            // Use the larger delta to determine the scale
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              deltaY = deltaX / aspectRatio
            } else {
              deltaX = deltaY * aspectRatio
            }
          }
          break
        case 'e':
          deltaX = moveEvent.clientX - startX
          // Maintain aspect ratio when dragging from right only if shift key is pressed
          if (moveEvent.shiftKey) {
            deltaY = deltaX / (startWidth / startHeight)
          } else {
            deltaY = 0
          }
          break
        case 'se':
          deltaX = moveEvent.clientX - startX
          deltaY = moveEvent.clientY - startY
          // Maintain aspect ratio when shift is pressed
          if (moveEvent.shiftKey) {
            const aspectRatio = startWidth / startHeight
            // Use the larger delta to determine the scale
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              deltaY = deltaX / aspectRatio
            } else {
              deltaX = deltaY * aspectRatio
            }
          }
          break
        case 's':
          deltaY = moveEvent.clientY - startY
          // Maintain aspect ratio when dragging from bottom only if shift key is pressed
          if (moveEvent.shiftKey) {
            deltaX = deltaY * (startWidth / startHeight)
          } else {
            deltaX = 0
          }
          break
        case 'sw':
          deltaX = startX - moveEvent.clientX
          deltaY = moveEvent.clientY - startY
          // Maintain aspect ratio when shift is pressed
          if (moveEvent.shiftKey) {
            const aspectRatio = startWidth / startHeight
            // Use the larger delta to determine the scale
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              deltaY = deltaX / aspectRatio
            } else {
              deltaX = deltaY * aspectRatio
            }
          }
          break
        case 'w':
          deltaX = startX - moveEvent.clientX
          // Maintain aspect ratio when dragging from left only if shift key is pressed
          if (moveEvent.shiftKey) {
            deltaY = deltaX / (startWidth / startHeight)
          } else {
            deltaY = 0
          }
          break
      }
      
      // Set minimum width and height for better usability
      const minWidth = Math.min(actualTextSize.width * 0.6, 60)
      const minHeight = Math.min(actualTextSize.height * 0.6, 40)
      
      let newWidth = Math.max(minWidth, startWidth + (direction.includes('w') ? deltaX : 0) + (direction.includes('e') ? deltaX : 0))
      let newHeight = Math.max(minHeight, startHeight + (direction.includes('n') ? deltaY : 0) + (direction.includes('s') ? deltaY : 0))
      
      // Initialize position (may be updated during resizing)
      let newPosition = { ...textPosition }
      
      // Update position for corners and edges that affect position
      if (direction.includes('w')) {
        // Left edge is being dragged
        newPosition.x = startPosition.x - deltaX;
      }
      
      if (direction.includes('n')) {
        // Top edge is being dragged
        newPosition.y = startPosition.y - deltaY;
      }
      
      // Center snapping
      if (showCenterGrid && imageContainerRef.current) {
        const container = imageContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const centerX = Math.round(containerRect.width / 2);
        const centerY = Math.round(containerRect.height / 2);
        
        // Calculate edges for snapping during resize
        const snapThreshold = 15;
        
        // Get current box edges after potential resize
        let boxLeft = newPosition.x;
        let boxRight = newPosition.x + newWidth;
        let boxTop = newPosition.y;
        let boxBottom = newPosition.y + newHeight;
        
        // Calculate center of box
        const boxCenterX = boxLeft + newWidth / 2;
        const boxCenterY = boxTop + newHeight / 2;
        
        // Apply center snapping based on which edge is being dragged
        if (Math.abs(boxCenterX - centerX) < snapThreshold) {
          // Snap center horizontally
          newPosition.x = centerX - newWidth / 2;
        }
        
        if (Math.abs(boxCenterY - centerY) < snapThreshold) {
          // Snap center vertically
          newPosition.y = centerY - newHeight / 2;
        }
        
        // Edge snapping to center
        if (direction.includes('e') && Math.abs(boxRight - centerX) < snapThreshold) {
          newWidth = centerX - boxLeft;
        } else if (direction.includes('w') && Math.abs(boxLeft - centerX) < snapThreshold) {
          const rightEdge = startPosition.x + startWidth;
          newWidth = rightEdge - centerX;
          newPosition.x = centerX;
        }
        
        if (direction.includes('s') && Math.abs(boxBottom - centerY) < snapThreshold) {
          newHeight = centerY - boxTop;
        } else if (direction.includes('n') && Math.abs(boxTop - centerY) < snapThreshold) {
          const bottomEdge = startPosition.y + startHeight;
          newHeight = bottomEdge - centerY;
          newPosition.y = centerY;
        }
        
        // Visual indicator for center snapping
        if (textBoxRef.current) {
          const box = textBoxRef.current.querySelector('.bounding-box');
          if (box) {
            const isSnapping = 
              Math.abs(boxCenterX - centerX) < snapThreshold ||
              Math.abs(boxCenterY - centerY) < snapThreshold ||
              Math.abs(boxLeft - centerX) < snapThreshold ||
              Math.abs(boxRight - centerX) < snapThreshold ||
              Math.abs(boxTop - centerY) < snapThreshold ||
              Math.abs(boxBottom - centerY) < snapThreshold;
              
            if (isSnapping) {
              box.classList.add('snapping');
              
              // Add specific classes for axis snapping
              if (Math.abs(boxCenterX - centerX) < snapThreshold || 
                  Math.abs(boxLeft - centerX) < snapThreshold || 
                  Math.abs(boxRight - centerX) < snapThreshold) {
                box.classList.add('snapping-v');
              } else {
                box.classList.remove('snapping-v');
              }
              
              if (Math.abs(boxCenterY - centerY) < snapThreshold || 
                  Math.abs(boxTop - centerY) < snapThreshold || 
                  Math.abs(boxBottom - centerY) < snapThreshold) {
                box.classList.add('snapping-h');
              } else {
                box.classList.remove('snapping-h');
              }
            } else {
              box.classList.remove('snapping', 'snapping-v', 'snapping-h');
            }
          }
        }
      }
      
      // Grid snapping
      if (gridSize > 0) {
        // Apply grid snapping to position and size
        if (direction.includes('w')) {
          // Left edge grid snap
          const snappedLeft = snapToGrid(newPosition.x, vertical);
          if (snappedLeft !== newPosition.x) {
            // Adjust width to compensate for the snapped position
            const rightEdge = newPosition.x + newWidth;
            newWidth = rightEdge - snappedLeft;
            newPosition.x = snappedLeft;
          }
        }
        
        if (direction.includes('n')) {
          // Top edge grid snap
          const snappedTop = snapToGrid(newPosition.y, horizontal);
          if (snappedTop !== newPosition.y) {
            // Adjust height to compensate for the snapped position
            const bottomEdge = newPosition.y + newHeight;
            newHeight = bottomEdge - snappedTop;
            newPosition.y = snappedTop;
          }
        }
        
        if (direction.includes('e')) {
          // Right edge grid snap
          const right = newPosition.x + newWidth;
          const snappedRight = snapToGrid(right, vertical);
          if (snappedRight !== right) {
            newWidth = snappedRight - newPosition.x;
          }
        }
        
        if (direction.includes('s')) {
          // Bottom edge grid snap
          const bottom = newPosition.y + newHeight;
          const snappedBottom = snapToGrid(bottom, horizontal);
          if (snappedBottom !== bottom) {
            newHeight = snappedBottom - newPosition.y;
          }
        }
        
        // Visual indicator for grid snapping
        if (textBoxRef.current) {
          const box = textBoxRef.current.querySelector('.bounding-box');
          if (box && !box.classList.contains('snapping')) {
            const originalX = direction.includes('w') ? startPosition.x - deltaX : textPosition.x;
            const originalY = direction.includes('n') ? startPosition.y - deltaY : textPosition.y;
            const originalRight = originalX + newWidth;
            const originalBottom = originalY + newHeight;
            
            const isGridSnapping = 
              snapToGrid(originalX, vertical) !== originalX ||
              snapToGrid(originalY, horizontal) !== originalY ||
              snapToGrid(originalRight, vertical) !== originalRight ||
              snapToGrid(originalBottom, horizontal) !== originalBottom;
              
            if (isGridSnapping) {
              box.classList.add('grid-snapping');
            } else {
              box.classList.remove('grid-snapping');
            }
          }
        }
      }
      
      // Update the bounding box size and position immediately for smoother visual feedback
      if (textBoxRef.current) {
        const box = textBoxRef.current.querySelector('.bounding-box');
        if (box) {
          box.style.width = `${newWidth}px`;
          box.style.height = `${newHeight}px`;
        }
      }
      
      // Update state with throttling for better performance
      updateStatesThrottled(newWidth, newHeight, newPosition);
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      // Remove stretching class and transition when done
      if (textBoxRef.current) {
        textBoxRef.current.classList.remove('resizing')
        // Reset transition after a short delay to allow final animation
        setTimeout(() => {
          if (textBoxRef.current) {
            textBoxRef.current.style.transition = ''
          }
        }, 100)
      }
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Handle image download
  const handleDownload = async () => {
    if (isProcessing) {
      toast({
        title: 'Please wait',
        description: 'Image is still processing. Please wait for it to complete.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!originalImage || !subjectImage) {
      toast({
        title: 'Error',
        description: 'Images not available for download.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      // Start loading indicators
      setIsDownloading(true)
      setIsExporting(true)

      // Hide resize handles and UI elements during capture
      if (textBoxRef.current) {
        const boundingBox = textBoxRef.current.querySelector('.bounding-box')
        if (boundingBox) {
          boundingBox.classList.add('exporting')
        }
      }

      // Get the capture area (the editor canvas)
      const captureArea = document.getElementById('capture-area')
      
      // Wait a moment for UI changes to apply
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Use html2canvas to take an exact screenshot of what's visible
      const canvas = await html2canvas(captureArea, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Higher resolution capture
        logging: false,
        onclone: (clonedDoc) => {
          // Further ensure no UI elements are visible in the clone
          const clonedCaptureArea = clonedDoc.getElementById('capture-area')
          if (clonedCaptureArea) {
            const handles = clonedCaptureArea.querySelectorAll('.resize-handle, .rotation-handle, .measurement-overlay')
            handles.forEach(handle => {
              handle.style.display = 'none'
            })
            
            const boundingBoxes = clonedCaptureArea.querySelectorAll('.bounding-box')
            boundingBoxes.forEach(box => {
              box.style.border = 'none'
              box.style.background = 'transparent'
              box.style.boxShadow = 'none'
            })
          }
        }
      })
      
      // Get the original image dimensions to properly size the output
      const img = new Image()
      img.src = originalImage
      await new Promise(resolve => { img.onload = resolve })
      
      const originalWidth = img.naturalWidth
      const originalHeight = img.naturalHeight
      
      // Create output canvas with original dimensions
      const outputCanvas = document.createElement('canvas')
      outputCanvas.width = originalWidth
      outputCanvas.height = originalHeight
      const ctx = outputCanvas.getContext('2d')
      
      // Draw the captured content, scaled to match original dimensions
      ctx.drawImage(
        canvas, 
        0, 0, canvas.width, canvas.height,
        0, 0, originalWidth, originalHeight
      )
      
      // Download the image
      const link = document.createElement('a')
      link.download = 'text-behinde-subject.png'
      link.href = outputCanvas.toDataURL('image/png', 1.0)
      link.click()
      
      // Show success message
      toast({
        title: 'Success',
        description: `Image downloaded at original size: ${originalWidth}×${originalHeight}px`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Remove exporting class after short delay
      setTimeout(() => {
        if (textBoxRef.current) {
          const boundingBox = textBoxRef.current.querySelector('.bounding-box')
          if (boundingBox) {
            boundingBox.classList.remove('exporting')
          }
        }
      }, 300)
      
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Error',
        description: 'Failed to download image. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDownloading(false)
      setIsExporting(false)
    }
  }

  // Calculate position information for the text box
  const getBoxInfo = () => {
    if (!textBoxRef.current || !imageContainerRef.current) return null
    
    const boxRect = textBoxRef.current.getBoundingClientRect()
    const containerRect = imageContainerRef.current.getBoundingClientRect()
    
    // Calculate relative position within the container
    const relativeX = boxRect.left - containerRect.left
    const relativeY = boxRect.top - containerRect.top
    
    return {
      width: textSize.width,
      height: textSize.height,
      x: relativeX,
      y: relativeY,
      rotation: textStyle.rotation.toFixed(0)
    }
  }
  
  // Check for very large font sizes
  useEffect(() => {
    const fontSize = parseInt(textStyle.fontSize) || 0
    if (fontSize >= 500 && imageContainerRef.current && textBoxRef.current) {
      const containerRect = imageContainerRef.current.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      if (fontSize > containerWidth * 1.5 || fontSize > containerHeight * 1.5) {
        toast({
          title: 'Very large font size',
          description: 'The font size is extremely large. You may need to zoom out or resize the text box to see it fully.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }, [textStyle.fontSize])

  // Reset text box size
  const resetBoxSize = () => {
    if (textContentRef.current) {
      const element = textContentRef.current
      const rect = element.getBoundingClientRect()
      
      const fontSize = parseInt(textStyle.fontSize)
      const paddingX = Math.min(40, Math.max(20, fontSize * 0.05))
      const paddingY = Math.min(30, Math.max(15, fontSize * 0.05))
      
      const newSize = {
        width: Math.max(rect.width + paddingX, 60),
        height: Math.max(rect.height + paddingY, 40),
      }
      
      // Reset the manual resize flag
      setUserResized(false)
      setActualTextSize(newSize)
      setTextSize(newSize)
    }
  }
  
  // Get grid lines
  const gridLines = getGridLines()
  
  // Get box info
  const boxInfo = getBoxInfo()

  // Keep text within bounds when its size changes
  useEffect(() => {
    if (imageContainerRef.current && textSize.width > 0 && textSize.height > 0) {
      const container = imageContainerRef.current
      const { width, height } = container.getBoundingClientRect()
      
      // Check if current position would place the box outside bounds
      const outOfBoundsX = textPosition.x + textSize.width > width
      const outOfBoundsY = textPosition.y + textSize.height > height
      
      // If out of bounds, adjust position
      if (outOfBoundsX || outOfBoundsY) {
        let newX = textPosition.x
        let newY = textPosition.y
        
        if (outOfBoundsX) {
          newX = Math.max(0, width - textSize.width)
        }
        
        if (outOfBoundsY) {
          newY = Math.max(0, height - textSize.height)
        }
        
        setTextPosition({ x: newX, y: newY })
      }
    }
  }, [textSize.width, textSize.height])

  // Add grid snapping functionality during drag
  const handleDrag = (e, data) => {
    const { x, y } = data;
    
    // Calculate the center of the container
    const containerWidth = imageContainerRef.current?.clientWidth || 0;
    const containerHeight = imageContainerRef.current?.clientHeight || 0;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Get the width and height of the text element
    const textWidth = textSize.width;
    const textHeight = textSize.height;
    
    // Check if we're close to the center guidelines
    const isNearCenterX = Math.abs(x + textWidth / 2 - centerX) < 20;
    const isNearCenterY = Math.abs(y + textHeight / 2 - centerY) < 20;
    
    // Get grid lines for potential grid snapping visualization
    const { horizontal, vertical } = getGridLines();
    const isNearGridX = vertical.some(gridX => Math.abs(x - gridX) < 10);
    const isNearGridY = horizontal.some(gridY => Math.abs(y - gridY) < 10);
    
    // Always show the center guides during dragging
    setShowCenterGrid(true);
    
    // Get the bounding box and guide elements to apply snapping classes
    const boundingBox = document.querySelector('.bounding-box');
    const centerGuideLayer = document.querySelector('.center-guide-layer');
    const horizontalGuide = document.querySelector('.horizontal-guide');
    const verticalGuide = document.querySelector('.vertical-guide');
    
    // Add or remove snapping classes based on proximity to center
    if (isNearCenterX) {
      boundingBox?.classList.add('snapping-v');
      verticalGuide?.classList.add('snapping');
    } else {
      boundingBox?.classList.remove('snapping-v');
      verticalGuide?.classList.remove('snapping');
    }
    
    if (isNearCenterY) {
      boundingBox?.classList.add('snapping-h');
      horizontalGuide?.classList.add('snapping');
    } else {
      boundingBox?.classList.remove('snapping-h');
      horizontalGuide?.classList.remove('snapping');
    }
    
    // If we're near both guidelines, add the snapping class
    if (isNearCenterX && isNearCenterY) {
      boundingBox?.classList.add('snapping');
      centerGuideLayer?.classList.add('snapping');
    } else {
      boundingBox?.classList.remove('snapping');
      centerGuideLayer?.classList.remove('snapping');
    }
    
    // Add grid snapping indicator
    if ((isNearGridX || isNearGridY) && !(isNearCenterX || isNearCenterY)) {
      boundingBox?.classList.add('grid-snapping');
    } else {
      boundingBox?.classList.remove('grid-snapping');
    }
  }

  return (
    <Container maxW="container.xl" py={10}>
      {!originalImage ? (
        <Box
          {...getRootProps()}
          w="100%"
          maxW="800px"
          h="300px"
          border="1px solid"
          borderColor={isDragActive ? 'purple.400' : 'rgba(255, 255, 255, 0.2)'}
          borderRadius="lg"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(16px)"
          position="relative"
          overflow="hidden"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.2)"
          transition="all 0.3s ease"
          _hover={{ borderColor: 'purple.400' }}
          mx="auto"
        >
          <input {...getInputProps()} />
          <Text color="gray.300" mb={2}>
            Drag and drop an image here
          </Text>
          <Text color="gray.400" fontSize="sm">
            or click to select a file
          </Text>
        </Box>
      ) : (
        <Flex direction={{ base: "column", lg: "row" }} gap={6} justify="center" align="start">
          {/* Image Preview Panel */}
          <Box 
            flex="1" 
            className="image-container"
            ref={imageContainerRef} 
            position="relative" 
            overflow="hidden" 
            bg="#1A1A1A"
            id="capture-area"
            sx={{ 
              borderRadius: '12px', // Increased border radius for more noticeable rounded corners
              aspectRatio: originalDimensions ? `${originalDimensions.width} / ${originalDimensions.height}` : 'auto',
              width: '100%',
              maxWidth: originalDimensions ? `${originalDimensions.width}px` : '100%'
            }}
          >
            {/* Enhanced center guide layer with proper classes */}
            {showCenterGrid && (
              <div className={`center-guide-layer ${showCenterGrid ? 'active' : ''}`} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5,
                pointerEvents: 'none'
              }}>
                <div className="center-guide horizontal-guide"></div>
                <div className="center-guide vertical-guide"></div>
              </div>
            )}
            
            {isProcessing ? (
              <Flex justify="center" align="center" h="100%" minH="300px" className="loading-indicator">
                <Spinner size="xl" color="purple.500" />
                <Text ml={4} color="gray.300">Processing Image...</Text>
              </Flex>
            ) : (
              <>
                {/* Background layer (original image) */}
                <Box
                  as="img"
                  src={originalImage}
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  objectFit="contain"
                  zIndex={1}
                  className="background-layer"
                  borderRadius="12px"
                />
                
                {/* Text layer */}
                <Box 
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  zIndex={2}
                  className="text-layer"
                >
                  <Draggable 
                    bounds={{
                      left: 0,
                      top: 0,
                      right: imageContainerRef.current ? 
                        imageContainerRef.current.getBoundingClientRect().width - textSize.width : 0,
                      bottom: imageContainerRef.current ? 
                        imageContainerRef.current.getBoundingClientRect().height - textSize.height : 0
                    }}
                    onStop={handleDragStop} 
                    position={textPosition} 
                    onDrag={handleDrag}
                    nodeRef={textBoxRef}
                  >
                    <Box 
                      className={`bounding-box-container ${isExporting ? 'exporting' : ''} ${isSnapping ? 'snapping' : ''}`}
                      ref={textBoxRef}
                      onMouseDown={() => !isExporting && setIsActive(true)}
                      onMouseLeave={() => !isRotating && setIsActive(false)}
                    >
                      <Box 
                        className={`bounding-box ${isActive ? 'active' : ''} ${isSnapping ? 'snapping' : ''}`}
                        width={`${textSize.width}px`}
                        height={`${textSize.height}px`}
                        style={{
                          transform: `rotate(${textStyle.rotation}deg)`,
                          transformOrigin: 'center center',
                          transition: isExporting ? 'none' : 'transform 0.1s ease-out',
                          border: isActive ? '2px solid rgba(138, 43, 226, 0.8)' : '1px dashed rgba(255, 255, 255, 0.4)',
                          boxShadow: isActive ? '0 0 10px rgba(138, 43, 226, 0.3)' : 'none',
                          background: isActive ? 'rgba(138, 43, 226, 0.05)' : 'transparent'
                        }}
                      >
                        {!isExporting && (
                          <>
                            {/* Resize handles */}
                            <Box className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                            <Box className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
                            <Box className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                            <Box className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                            <Box className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
                            <Box className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's')} />
                            <Box className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                            <Box className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
                            
                            {/* Rotation handle */}
                            <Box 
                              className="rotation-handle" 
                              ref={rotationHandleRef}
                              onMouseDown={handleRotationStart}
                            />
                            
                            {/* Measurement overlay - only visible when active */}
                            {(isActive || userResized) && boxInfo && (
                              <Box 
                                className="measurement-overlay"
                                position="absolute"
                                top="-36px"
                                left="0"
                                bg="rgba(0, 0, 0, 0.7)"
                                color="white"
                                fontSize="10px"
                                padding="4px 8px"
                                borderRadius="4px"
                                whiteSpace="nowrap"
                                zIndex="10"
                                fontFamily="monospace"
                                style={{ transform: 'rotate(0deg)' }}
                              >
                                {`${textSize.width.toFixed(0)}×${textSize.height.toFixed(0)}px | Rotation: ${boxInfo.rotation}°${userResized ? ' | Manual Size' : ''}`}
                              </Box>
                            )}
                          </>
                        )}
                        
                        {/* Text content */}
                        <Box 
                          className="text-container"
                          width="100%"
                          height="100%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="visible"
                          position="relative"
                        >
                          <Text
                            ref={textContentRef}
                            color={textStyle.color}
                            fontSize={textStyle.fontSize}
                            fontFamily={textStyle.fontFamily}
                            fontWeight={textStyle.fontWeight || '400'}
                            fontStyle={textStyle.fontStyle || 'normal'}
                            textDecoration={textStyle.textDecoration || 'none'}
                            textAlign={textStyle.textAlign || 'center'}
                            userSelect="none"
                            whiteSpace="normal" 
                            width="100%"
                            height="100%"
                            overflow="visible"
                            opacity={textStyle.opacity}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              wordBreak: "break-word",
                              overflowWrap: "break-word"
                            }}
                          >
                            {overlayText}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  </Draggable>
                </Box>
                
                {/* Subject layer (processed image) */}
                <Box
                  as="img"
                  src={subjectImage}
                  position="absolute"
                  top="0"
                  left="0"
                  width="100%"
                  height="100%"
                  objectFit="contain"
                  zIndex={3}
                  className="subject-layer"
                  borderRadius="12px"
                />
              </>
            )}
          </Box>

          {/* Controls Panel */}
          <Box flex="1" maxW={{ base: "100%", lg: "400px" }}>
            <VStack spacing={4} align="stretch">
              {/* <Box bg="rgba(0, 0, 0, 0.3)" p={3} borderRadius="md" mb={3}>
                <Text color="cyan.300" fontSize="sm" textAlign="center">
                  <Box as="span" fontWeight="bold">💡 Tip:</Box> Resize the text by dragging any of the handles on the text box.
                </Text>
              </Box> */}

              <TextEditor 
                text={overlayText} 
                setText={setOverlayText} 
                textStyle={textStyle} 
                setTextStyle={setTextStyle}
                onSizeChange={resetBoxSize}
              />
              
              {/* Action Buttons in a single row */}
              <Flex gap={2} mb={4}>
              <Button 
                  flex="1"
                colorScheme="purple" 
                  size="sm"
                leftIcon={<Box as="span">+</Box>} 
                onClick={() => {
                  setOverlayText('New Text')
                  setTextPosition({ x: 100, y: 100 })
                  setTextSize({ width: 300, height: 150 })
                  setTextStyle({
                    color: '#ffffff',
                    fontSize: '48px',
                    fontFamily: 'Arial',
                    rotation: 0,
                      opacity: 1,
                      textAlign: 'center',
                      fontStyle: 'normal',
                      textDecoration: 'none'
                  })
                }}
              >
                  Add Text
              </Button>
              
              <Button
                  flex="1"
                variant="outline"
                colorScheme="teal"
                  size="sm"
                leftIcon={
                  <Box as="span" fontSize="1.2em" role="img" aria-label="reupload">
                    🔄
                  </Box>
                }
                onClick={() => {
                  // Reset the state to allow for a new image upload
                  setOriginalImage(null)
                  setSubjectImage(null)
                  setIsProcessing(false)
                }}
                >
                  Replace
              </Button>
              
              <Button
                  flex="1"
                colorScheme="blue"
                  size="sm"
                variant="outline"
                  leftIcon={<Box as="span" fontSize="1.2em" role="img" aria-label="center">⌖</Box>}
                  onClick={() => {
                    if (!imageContainerRef.current) return
                    
                    const container = imageContainerRef.current
                    const { width, height } = container.getBoundingClientRect()
                    const centerX = Math.round(width / 2)
                    const centerY = Math.round(height / 2)
                    
                    // Center the text box
                    setTextPosition({ 
                      x: centerX - textSize.width / 2, 
                      y: centerY - textSize.height / 2 
                    })
                    
                    // Show a toast notification
                    toast({
                      title: 'Text Centered',
                      description: 'Text has been centered on the canvas',
                      status: 'success',
                      duration: 2000,
                      isClosable: true,
                    })
                  }}
                >
                  Center
                </Button>
              </Flex>
              
              {/* Download Button */}
              <Button
                colorScheme="green"
                w="100%"
                onClick={handleDownload}
                isDisabled={isProcessing}
                isLoading={isDownloading}
                loadingText="Downloading..."
                leftIcon={<Box as="span">↓</Box>}
              >
                Download Image
              </Button>
              
              <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
                Drag the text to position it, resize using the handles to change the font size
              </Text>
              
            </VStack>
          </Box>
        </Flex>
      )}
    </Container>
  )
}

export default Editor

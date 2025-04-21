import { useState, useEffect } from 'react'
import { Box, VStack, Input, Textarea, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, HStack, Select, Button, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody, SimpleGrid, useColorModeValue, IconButton, ButtonGroup } from '@chakra-ui/react'
import { SketchPicker } from 'react-color'
import fontCollection from '../data/fontCollection'
import { loadGoogleFonts, preloadFont } from '../utils/fontLoader'
import FontPreview from './FontPreview'
import { useFontContext } from '../context/FontContext'

// Google Fonts API integration
const GOOGLE_FONTS_API_KEY = 'AIzaSyBNI_y-H6-_mBwM5WKZp4q7mwxBIwdaHgE' // This is a placeholder, replace with your actual API key
const GOOGLE_FONTS_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`

function TextEditor({ text, setText, textStyle, setTextStyle, onSizeChange }) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [fontSizeInput, setFontSizeInput] = useState(parseInt(textStyle.fontSize) || 48)
  
  // Use the font context instead of managing our own state
  const { 
    availableFonts, 
    loadedFonts, 
    fontCategories, 
    isLoading,
    loadingProgress, 
    loadFont,
    getFontWeights
  } = useFontContext()
  
  // Get font weights for the current font
  const fontWeights = getFontWeights(textStyle.fontFamily)
  
  // Effect to load font when changed
  useEffect(() => {
    if (textStyle.fontFamily) {
      loadFont(textStyle.fontFamily)
    }
    
    // Set default weight if not already set
    if (!textStyle.fontWeight && textStyle.fontFamily) {
      const weights = getFontWeights(textStyle.fontFamily)
      if (weights.includes('400')) {
        setTextStyle(prev => ({ ...prev, fontWeight: '400' }))
      } else if (weights.length > 0) {
        setTextStyle(prev => ({ ...prev, fontWeight: weights[0] }))
      }
    }
    
    // Trigger onSizeChange when font family changes
    if (onSizeChange) {
      onSizeChange();
    }
  }, [textStyle.fontFamily]);
  
  // Update input when font size changes from outside
  useEffect(() => {
    setFontSizeInput(parseInt(textStyle.fontSize) || 48);
  }, [textStyle.fontSize]);
  
  // Add effect to trigger resize when font size changes
  useEffect(() => {
    // Trigger onSizeChange when font size changes
    if (onSizeChange) {
      onSizeChange();
    }
  }, [textStyle.fontSize]);
  
  // Filter fonts based on category and search term
  const filteredFonts = availableFonts.filter(font => {
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory
    const matchesSearch = font.family.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Apply font size change
  const applyFontSize = (value) => {
    // Validate the input - must be a number between 12 and 500
    let newSize;
    
    if (value === '' || isNaN(value)) {
      // If empty or not a number, reset to previous size
      newSize = parseInt(textStyle.fontSize) || 48;
    } else {
      // Ensure size is within valid range
      newSize = Math.max(12, Math.min(500, parseInt(value)));
    }
    
    // Update the input field to show the validated value
    setFontSizeInput(newSize);
    
    // Update the actual text style
    setTextStyle(prev => ({ ...prev, fontSize: `${newSize}px` }));
    
    // Trigger size change callback
    if (onSizeChange) {
      onSizeChange();
    }
  }

  // Handle font selection
  const handleFontSelect = (fontFamily) => {
    setTextStyle(prev => ({ ...prev, fontFamily }))
    loadFont(fontFamily)
    
    // Close the popover
    const popoverElement = document.querySelector('[role="dialog"]')
    if (popoverElement) {
      const closestButton = popoverElement.previousElementSibling
      if (closestButton && closestButton.getAttribute('aria-expanded') === 'true') {
        closestButton.click()
      }
    }
  }

  // Handle text alignment changes
  const handleAlignmentChange = (textAlign) => {
    setTextStyle(prev => ({ ...prev, textAlign }));
    if (onSizeChange) {
      onSizeChange();
    }
  }

  // Handle text formatting toggles
  const toggleBold = () => {
    setTextStyle(prev => ({ 
      ...prev, 
      fontWeight: prev.fontWeight === '700' ? '400' : '700' 
    }));
    if (onSizeChange) {
      onSizeChange();
    }
  }

  const toggleItalic = () => {
    setTextStyle(prev => ({ 
      ...prev, 
      fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic' 
    }));
    if (onSizeChange) {
      onSizeChange();
    }
  }

  const toggleUnderline = () => {
    setTextStyle(prev => ({ 
      ...prev, 
      textDecoration: prev.textDecoration === 'underline' ? 'none' : 'underline' 
    }));
    if (onSizeChange) {
      onSizeChange();
    }
  }

  return (
    <VStack spacing={4} align="stretch" bg="rgba(0, 0, 0, 0.2)" p={4} borderRadius="md">
      <Text color="white" fontWeight="bold">Text Editor</Text>
      
      {/* Font Loading Indicator */}
      {loadingProgress < 100 && (
        <Box>
          <Text color="white" fontSize="xs" mb={1}>Loading fonts: {loadingProgress}%</Text>
          <Box w="100%" h="4px" bg="rgba(255, 255, 255, 0.1)" borderRadius="full" overflow="hidden">
            <Box 
              h="100%" 
              bg="purple.500" 
              borderRadius="full" 
              w={`${loadingProgress}%`}
              transition="width 0.3s ease"
            />
          </Box>
        </Box>
      )}
      
      {/* Text Formatting Controls */}
      <HStack spacing={2} mb={2}>
        <ButtonGroup size="sm" isAttached variant="outline">
          <IconButton
            aria-label="Align left"
            icon={<Box as="span">≡</Box>}
            onClick={() => handleAlignmentChange('left')}
            bg={textStyle.textAlign === 'left' ? 'rgba(128, 90, 213, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
          />
          <IconButton
            aria-label="Align center"
            icon={<Box as="span">≡</Box>}
            onClick={() => handleAlignmentChange('center')}
            bg={textStyle.textAlign === 'center' ? 'rgba(128, 90, 213, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
          />
          <IconButton
            aria-label="Align right"
            icon={<Box as="span">≡</Box>}
            onClick={() => handleAlignmentChange('right')}
            bg={textStyle.textAlign === 'right' ? 'rgba(128, 90, 213, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
          />
        </ButtonGroup>
        
        <ButtonGroup size="sm" isAttached variant="outline">
          <IconButton
            aria-label="Bold"
            icon={<Box as="span" fontWeight="bold">B</Box>}
            onClick={toggleBold}
            bg={textStyle.fontWeight === '700' ? 'rgba(128, 90, 213, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
          />
          <IconButton
            aria-label="Italic"
            icon={<Box as="span" fontStyle="italic">I</Box>}
            onClick={toggleItalic}
            bg={textStyle.fontStyle === 'italic' ? 'rgba(128, 90, 213, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
          />
          <IconButton
            aria-label="Underline"
            icon={<Box as="span" textDecoration="underline">U</Box>}
            onClick={toggleUnderline}
            bg={textStyle.textDecoration === 'underline' ? 'rgba(128, 90, 213, 0.6)' : 'rgba(0, 0, 0, 0.3)'}
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: 'rgba(128, 90, 213, 0.4)' }}
          />
        </ButtonGroup>
      </HStack>
      
      <Textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Enter your text here" 
        size="sm"
        bg="rgba(0, 0, 0, 0.3)"
        color="white"
        borderColor="rgba(255, 255, 255, 0.2)"
        _hover={{ borderColor: "purple.400" }}
        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
        resize="vertical"
        rows={3}
      />
      
      {/* Font Family Selection with Search and Categories */}
      <Box>
        <Text color="white" fontSize="sm" mb={1}>Font Family</Text>
        <Flex gap={2}>
          <Popover placement="bottom-start">
            <PopoverTrigger>
              <Button 
                w="100%" 
                justifyContent="space-between" 
                bg="rgba(0, 0, 0, 0.3)" 
                color="white"
                borderColor="rgba(255, 255, 255, 0.2)"
                _hover={{ bg: "rgba(0, 0, 0, 0.4)" }}
                size="sm"
                fontFamily={textStyle.fontFamily}
                isLoading={isLoading}
              >
                {textStyle.fontFamily || 'Select font'}
                <Box as="span" ml={2}>▼</Box>
              </Button>
            </PopoverTrigger>
            <PopoverContent bg="rgba(30, 30, 30, 0.95)" borderColor="rgba(255, 255, 255, 0.2)" maxH="300px" w="300px">
              <PopoverBody p={3}>
                <VStack spacing={2} align="stretch">
                  <Input 
                    placeholder="Search fonts..." 
                    size="sm" 
                    bg="rgba(0, 0, 0, 0.3)"
                    color="white"
                    borderColor="rgba(255, 255, 255, 0.2)"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    mb={2}
                  />
                  
                  <HStack spacing={1} mb={2} overflowX="auto" pb={2}>
                    {fontCategories.map(category => (
                      <Button 
                        key={category}
                        size="xs"
                        variant={selectedCategory === category ? "solid" : "outline"}
                        colorScheme="purple"
                        onClick={() => setSelectedCategory(category)}
                        textTransform="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </HStack>
                  
                  <Box overflowY="auto" maxH="200px" pr={2}>
                    <VStack spacing={1} align="stretch">
                      {filteredFonts.map(font => (
                        <Button 
                          key={font.family}
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          fontFamily={font.family}
                          color="white"
                          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                          onClick={() => handleFontSelect(font.family)}
                          style={{ fontWeight: loadedFonts.includes(font.family) ? 400 : 300 }}
                        >
                          {font.family}
                        </Button>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          {/* Add Font Preview Button */}
          <FontPreview onSelectFont={handleFontSelect} />
        </Flex>
      </Box>
      
      {/* Font Weight Selection */}
      <Box>
        <Text color="white" fontSize="sm" mb={1}>Font Weight</Text>
        <Select 
          value={textStyle.fontWeight || '400'} 
          onChange={(e) => setTextStyle(prev => ({ ...prev, fontWeight: e.target.value }))}
          bg="rgba(0, 0, 0, 0.3)"
          color="white"
          borderColor="rgba(255, 255, 255, 0.2)"
          _hover={{ borderColor: "purple.400" }}
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
          size="sm"
          isDisabled={fontWeights.length === 0}
        >
          {fontWeights.map(weight => (
            <option key={weight} value={weight} style={{ background: '#2D3748' }}>
              {weight === '100' ? 'Thin (100)' :
               weight === '200' ? 'Extra Light (200)' :
               weight === '300' ? 'Light (300)' :
               weight === '400' ? 'Regular (400)' :
               weight === '500' ? 'Medium (500)' :
               weight === '600' ? 'Semi Bold (600)' :
               weight === '700' ? 'Bold (700)' :
               weight === '800' ? 'Extra Bold (800)' :
               weight === '900' ? 'Black (900)' :
               `Weight ${weight}`}
            </option>
          ))}
        </Select>
      </Box>
      
      {/* Font Size Input */}
      <Box>
        <Text color="white" fontSize="sm" mb={1}>Font Size</Text>
        <Flex gap={2}>
          <Input
            type="text"
            value={fontSizeInput}
            onChange={(e) => {
              // Allow empty field or numeric values
              const value = e.target.value;
              if (value === '' || /^\d*$/.test(value)) {
                setFontSizeInput(value);
              }
            }}
            onBlur={() => applyFontSize(fontSizeInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur(); // Lose focus to trigger onBlur
              }
            }}
            bg="rgba(0, 0, 0, 0.3)"
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ borderColor: "purple.400" }}
            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
            size="sm"
          />
          <Button
            size="sm"
            onClick={() => {
              const currentSize = parseInt(textStyle.fontSize) || 48;
              const newSize = Math.max(12, currentSize - 4);
              setFontSizeInput(newSize);
              applyFontSize(newSize);
            }}
            bg="rgba(0, 0, 0, 0.3)"
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: "rgba(128, 90, 213, 0.4)" }}
          >
            -
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const currentSize = parseInt(textStyle.fontSize) || 48;
              const newSize = Math.min(500, currentSize + 4);
              setFontSizeInput(newSize);
              applyFontSize(newSize);
            }}
            bg="rgba(0, 0, 0, 0.3)"
            color="white"
            borderColor="rgba(255, 255, 255, 0.2)"
            _hover={{ bg: "rgba(128, 90, 213, 0.4)" }}
          >
            +
          </Button>
        </Flex>
      </Box>
      
      {/* Text Color */}
      <Box>
        <Text color="white" fontSize="sm" mb={1}>Text Color</Text>
        <Popover
          isOpen={colorPickerOpen}
          onClose={() => setColorPickerOpen(false)}
          placement="bottom"
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Button 
              w="100%" 
              h="30px" 
              bg={textStyle.color} 
              _hover={{ opacity: 0.8 }}
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              size="sm"
            />
          </PopoverTrigger>
          <PopoverContent border="none" bg="transparent" shadow="none">
            <PopoverBody p={0}>
              <SketchPicker 
                color={textStyle.color}
                onChange={(color) => setTextStyle(prev => ({ ...prev, color: color.hex }))}
                disableAlpha={false}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
      
      {/* Text Opacity */}
      <Box>
        <Text color="white" fontSize="sm" mb={1}>Opacity: {Math.round(textStyle.opacity * 100)}%</Text>
        <Slider 
          min={0} 
          max={1} 
          step={0.01} 
          value={textStyle.opacity} 
          onChange={(val) => setTextStyle(prev => ({ ...prev, opacity: val }))}
          colorScheme="purple"
        >
          <SliderTrack bg="rgba(255, 255, 255, 0.2)">
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb boxSize={6} />
        </Slider>
      </Box>
    </VStack>
  )
}

export default TextEditor
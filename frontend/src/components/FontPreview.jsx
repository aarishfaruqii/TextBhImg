import { useState, useEffect } from 'react'
import { Box, Heading, VStack, Text, Flex, Input, Select, Button, SimpleGrid, Badge, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Wrap, WrapItem, HStack, Divider } from '@chakra-ui/react'
import { useFontContext } from '../context/FontContext'

function FontPreview({ onSelectFont }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog')
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Use font context instead of directly importing the collection
  const { availableFonts, fontCategories: allCategories, loadedFonts, loadFont } = useFontContext()
  
  // Extract unique categories
  const categories = ['all', ...new Set(allCategories)]
  
  // Filter fonts based on category and search term
  const filteredFonts = availableFonts.filter(font => {
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory
    const matchesSearch = font.family.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })
  
  // Group fonts by category for display
  const groupedFonts = filteredFonts.reduce((acc, font) => {
    if (!acc[font.category]) {
      acc[font.category] = []
    }
    acc[font.category].push(font)
    return acc
  }, {})
  
  // Get all bold fonts (fonts with 700 or higher weight variant)
  const boldFonts = availableFonts.filter(font => 
    font.variants.some(v => parseInt(v) >= 700)
  )
  
  // Handle font selection with loading
  const handleSelectFont = (fontFamily) => {
    loadFont(fontFamily)
    if (onSelectFont) {
      onSelectFont(fontFamily)
      onClose()
    }
  }
  
  return (
    <>
      <Button colorScheme="purple" variant="outline" onClick={onOpen} mt={2} size="sm">
        Browse All Fonts
      </Button>
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay bg="rgba(0, 0, 0, 0.7)" backdropFilter="blur(10px)" />
        <ModalContent bg="rgba(20, 20, 20, 0.95)" color="white" borderRadius="md">
          <ModalHeader>Font Gallery ({filteredFonts.length} fonts)</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {/* Controls */}
              <Flex gap={4} wrap="wrap">
                <Box flex="1" minW="200px">
                  <Text fontSize="sm" mb={1}>Search Fonts</Text>
                  <Input 
                    placeholder="Search by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="rgba(0, 0, 0, 0.3)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                  />
                </Box>
                <Box flex="1" minW="150px">
                  <Text fontSize="sm" mb={1}>Filter by Category</Text>
                  <Select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    bg="rgba(0, 0, 0, 0.3)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} style={{ background: '#1A1A1A' }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Box flex="1" minW="200px">
                  <Text fontSize="sm" mb={1}>Preview Text</Text>
                  <Input 
                    placeholder="Enter preview text" 
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    bg="rgba(0, 0, 0, 0.3)"
                    borderColor="rgba(255, 255, 255, 0.2)"
                  />
                </Box>
              </Flex>
              
              {/* Category Buttons - Improved design with solid background */}
              <Box bg="rgba(30, 30, 40, 0.9)" p={4} borderRadius="md" position="sticky" top="0" zIndex="10" 
                   boxShadow="0 4px 12px rgba(0, 0, 0, 0.4)" backdropFilter="blur(8px)">
                <Text fontSize="sm" fontWeight="bold" mb={2}>Categories</Text>
                <Wrap spacing={2}>
                  {categories.map(category => (
                    <WrapItem key={category}>
                      <Button 
                        size="sm"
                        variant={selectedCategory === category ? "solid" : "outline"}
                        colorScheme="purple"
                        onClick={() => setSelectedCategory(category)}
                        textTransform="capitalize"
                        mb={1}
                        boxShadow={selectedCategory === category ? "0 0 8px rgba(128, 90, 213, 0.6)" : "none"}
                      >
                        {category}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
              
              {/* Bold Fonts Section - Always visible, enhanced design */}
              <Box mb={6} bg="rgba(80, 27, 110, 0.15)" p={4} borderRadius="md" borderLeft="4px solid #805AD5">
                <Flex align="center" mb={3} justify="space-between">
                  <HStack>
                    <Heading size="sm">Bold Fonts</Heading>
                    <Badge ml={2} colorScheme="purple">{boldFonts.length}</Badge>
                  </HStack>
                  <Button 
                    size="xs" 
                    variant="outline" 
                    colorScheme="purple"
                    onClick={() => setSelectedCategory('all')}
                  >
                    View All Bold
                  </Button>
                </Flex>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                  {boldFonts.slice(0, 9).map(font => (
                    <Box 
                      key={font.family}
                      p={3}
                      bg="rgba(40, 20, 60, 0.4)"
                      borderRadius="md"
                      cursor="pointer"
                      _hover={{ bg: "rgba(128, 90, 213, 0.2)", transform: "translateY(-2px)" }}
                      onClick={() => handleSelectFont(font.family)}
                      opacity={loadedFonts.includes(font.family) ? 1 : 0.8}
                      transition="all 0.3s ease"
                      border="1px solid rgba(128, 90, 213, 0.3)"
                    >
                      <Text fontSize="sm" mb={1} fontWeight="bold">{font.family}</Text>
                      <Box 
                        mt={2} 
                        fontFamily={font.family}
                        fontSize="md"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        fontWeight="700"
                        letterSpacing="-0.01em"
                      >
                        {previewText}
                      </Box>
                      <Flex mt={2} gap={1} flexWrap="wrap">
                        {font.variants.filter(w => parseInt(w) >= 700).map(weight => (
                          <Badge 
                            key={weight} 
                            fontSize="2xs" 
                            colorScheme="purple" 
                            variant="solid"
                          >
                            {weight}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
              
              <Divider borderColor="rgba(255, 255, 255, 0.1)" />
              
              {/* Font Preview List */}
              <Box>
                {Object.keys(groupedFonts).length > 0 ? (
                  Object.entries(groupedFonts).map(([category, fonts]) => (
                    <Box key={category} mb={6}>
                      <Flex align="center" mb={2}>
                        <Heading size="sm" textTransform="capitalize">{category}</Heading>
                        <Badge ml={2} colorScheme="purple">{fonts.length}</Badge>
                      </Flex>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        {fonts.map(font => (
                          <Box 
                            key={font.family}
                            p={3}
                            bg="rgba(0, 0, 0, 0.3)"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                            onClick={() => handleSelectFont(font.family)}
                            opacity={loadedFonts.includes(font.family) ? 1 : 0.7}
                            transition="opacity 0.3s ease"
                          >
                            <Text fontSize="sm" mb={1} fontWeight="bold">{font.family}</Text>
                            <Box 
                              mt={2} 
                              fontFamily={font.family}
                              fontSize="md"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                              fontWeight={font.variants.includes('400') ? '400' : font.variants[0]}
                            >
                              {previewText}
                            </Box>
                            <Flex mt={2} gap={1} flexWrap="wrap">
                              {font.variants.map(weight => (
                                <Badge 
                                  key={weight} 
                                  fontSize="2xs" 
                                  colorScheme="blue" 
                                  variant="outline"
                                >
                                  {weight}
                                </Badge>
                              ))}
                            </Flex>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </Box>
                  ))
                ) : (
                  <Text>No fonts match your search criteria</Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default FontPreview 
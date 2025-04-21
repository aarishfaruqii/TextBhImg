import { Box, Flex, Stack, Button, Text, Container } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

function Navbar() {
  const [activeLink, setActiveLink] = useState('/')
  
  useEffect(() => {
    // Set initial active link based on current pathname
    setActiveLink(window.location.pathname)
  }, [])
  
  return (
    <Box 
      as="nav" 
      position="fixed" 
      top="20px" 
      left="0" 
      right="0" 
      zIndex="1000"
      mx={{ base: 4, md: 10 }}
    >
      <Container maxW="container.xl">
        <Box
          bg="rgba(13, 16, 27, 0)"
          backdropFilter="blur(8px)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
          py={2}
          px={6}
          borderRadius="full"
          border="1px solid rgba(255, 255, 255, 0.1)"
        >
          <Flex align="center" justify="space-between" py={2}>
            {/* Logo */}
            <Link to="/">
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color="white"
              >
                <Box as="span" color="purple.300">Text</Box>
                <Box as="span">-Behind-</Box>
                <Box as="span" color="purple.300">Image</Box>
              </Text>
            </Link>
            
            {/* Navigation Links */}
            <Stack 
              direction="row" 
              spacing={8} 
              display={{ base: "none", md: "flex" }}
            >
              <Link to="/">
                <Button
                  variant="ghost"
                  colorScheme="whiteAlpha"
                  color="white"
                  fontWeight={activeLink === '/' ? "bold" : "normal"}
                  borderBottom={activeLink === '/' ? "2px solid" : "none"}
                  borderColor="purple.300"
                  borderRadius="0"
                  _hover={{ bg: "whiteAlpha.100" }}
                >
                  Home
                </Button>
              </Link>
              <Link to="/tools">
                <Button
                  variant="ghost"
                  colorScheme="whiteAlpha"
                  color="white"
                  fontWeight={activeLink === '/tools' ? "bold" : "normal"}
                  borderBottom={activeLink === '/tools' ? "2px solid" : "none"}
                  borderColor="purple.300"
                  borderRadius="0"
                  _hover={{ bg: "whiteAlpha.100" }}
                >
                  Tools
                </Button>
              </Link>
            </Stack>
            
            {/* CTA Button */}
            <Link to="/editor">
              <Button
                colorScheme="purple"
                borderRadius="md"
                size="md"
                _hover={{ bg: "purple.400" }}
              >
                Get Started
              </Button>
            </Link>
          </Flex>
        </Box>
      </Container>
    </Box>
  )
}

export default Navbar

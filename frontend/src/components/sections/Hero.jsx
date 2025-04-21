import { VStack, Heading, Text, Box, Container } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <Container maxW="container.xl" pt={8} pb={16}>
      <VStack spacing={8}>
        <VStack spacing={3} textAlign="center" mb={8}>
          <Heading as="h1" fontSize={{ base: "4xl", md: "6xl" }} fontWeight="bold" color="white" lineHeight="1.2">
            Create <Box as="span" position="relative" display="inline-block">
              Designs
              <Box position="absolute" bottom="5px" left="0" right="0" height="4px" bg="purple.500" />  
            </Box> Easily
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="2xl" mt={6}>
            Create text-behind-image designs in seconds using AI. Unlimited downloads. 100% free to use. No sign-up required.
          </Text>
          <Link to="/editor">
            <Box
              as="button"
              mt={8}
              px={8}
              py={4}
              bg="purple.500"
              color="white"
              borderRadius="full"
              fontWeight="bold"
              boxShadow="0 4px 20px rgba(128, 90, 213, 0.4)"
              _hover={{ 
                bg: 'purple.600',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(128, 90, 213, 0.5)'
              }}
              transition="all 0.3s ease"
            >
              Start Creating
            </Box>
          </Link>
        </VStack>
      </VStack>
    </Container>
  )
}

export default Hero 
import { Box, Container, VStack, Heading, Text, Grid, Image, Flex, Badge } from '@chakra-ui/react'

function Services() {
  const services = [
    {
      id: 1,
      image: 'images/sample1.png',
      alt: 'sample'
    },
    {
      id: 2,
      image: 'images/sample3.png',
      alt: 'sample'
    },
    {
      id: 3,
      image: 'images/sample2.png',
      alt: 'sample'
    },
    {
      id: 4,
      image: 'images/sample4.png',
      alt: 'sample'
    }
  ]

  // Common card styles for consistency
  const cardStyle = {
    borderRadius: "lg",
    overflow: "hidden",
    bg: "rgba(23, 25, 35, 0.8)",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
    _hover: { 
      transform: "translateY(-5px)", 
      boxShadow: "0 8px 30px rgba(128, 90, 213, 0.3)" 
    },
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  }

  // Ad card style inherits from cardStyle with specific modifications
  const adCardStyle = {
    ...cardStyle,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bg: "rgba(26, 32, 44, 0.8)",
    color: "white",
    _hover: { 
      boxShadow: "0 8px 30px rgba(128, 90, 213, 0.3)",
      borderColor: "rgba(128, 90, 213, 0.5)" 
    }
  }

  return (
    <Box bg="#0B0F1A" py={10}>
      <Container maxW="container.xl">

        {/* Banner Ad Space */}
        <Box 
          w="100%" 
          h="100px" 
          mb={8} 
          {...adCardStyle}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            bgGradient: "linear(to-r, purple.500, pink.500)",
            borderTopLeftRadius: "lg",
            borderTopRightRadius: "lg"
          }}
        >
          <Text color="gray.300" fontSize="sm">ADVERTISEMENT SPACE</Text>
        </Box>

        {/* Services Grid with Ad Spaces */}
        <Grid
          templateColumns={{ 
            base: "1fr", 
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)" 
          }}
          gap={4}
          mb={8}
        >
          {/* First row: 2 services, 1 ad */}
          <Box {...cardStyle}>
            <Box h="160px" position="relative">
              <Image
                src={services[0].image}
                alt={services[0].alt}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </Box>
          </Box>

          <Box {...cardStyle}>
            <Box h="160px">
              <Image
                src={services[1].image}
                alt={services[1].alt}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </Box>
          </Box>

          {/* Vertical Ad Space */}
          <Box 
            display={{ base: "none", md: "flex" }}
            gridColumn={{ md: "span 2" }}
            {...adCardStyle}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              bgGradient: "linear(to-b, purple.500, pink.500)",
              borderTopLeftRadius: "lg",
              borderBottomLeftRadius: "lg"
            }}
          >
            <Text color="gray.300" fontSize="sm">ADVERTISEMENT SPACE</Text>
          </Box>

          {/* Second row: 1 ad, 2 services */}
          <Box 
            display={{ base: "none", md: "flex" }}
            gridColumn={{ md: "span 2" }}
            mt={{ base: 4, md: 0 }}
            {...adCardStyle}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              bgGradient: "linear(to-b, pink.500, purple.500)",
              borderTopRightRadius: "lg",
              borderBottomRightRadius: "lg"
            }}
          >
            <Text color="gray.300" fontSize="sm">ADVERTISEMENT SPACE</Text>
          </Box>

          <Box {...cardStyle}>
            <Box h="160px">
              <Image
                src={services[2].image}
                alt={services[2].alt}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </Box>
          </Box>

          <Box {...cardStyle}>
            <Box h="160px" position="relative">
              <Image
                src={services[3].image}
                alt={services[3].alt}
                objectFit="cover"
                w="100%"
                h="100%"
              />
            </Box>
          </Box>
        </Grid>

        {/* Bottom Banner Ad Space */}
        <Box 
          w="100%" 
          h="100px" 
          {...adCardStyle}
          position="relative"
          _before={{
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            bgGradient: "linear(to-r, pink.500, purple.500)",
            borderBottomLeftRadius: "lg",
            borderBottomRightRadius: "lg"
          }}
        >
          <Text color="gray.300" fontSize="sm">ADVERTISEMENT SPACE</Text>
        </Box>
      </Container>
    </Box>
  )
}

export default Services 
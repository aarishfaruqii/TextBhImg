import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Flex, 
  VStack, 
  Link as ChakraLink 
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

function Tools() {
  // Array of tool objects
  const tools = [
    {
      id: 1,
      title: "Text Behind Image",
      description: "Create beautiful designs with text behind your images using AI. Perfect for social media posts, banners, and creative projects.",
      icon: "🖼️",
      link: "/editor",
      bgGradient: "linear(to-r, purple.500, pink.500)"
    },
    {
      id: 2,
      title: "Coming Soon",
      description: "New creative tools are in development. Stay tuned for more exciting features!",
      icon: "⏳",
      link: "#",
      bgGradient: "linear(to-r, gray.600, gray.700)"
    }
  ];

  return (
    <Layout>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={6} align="center" mb={12}>
          <Heading 
            as="h1" 
            fontSize={{ base: '3xl', md: '5xl' }} 
            fontWeight="bold" 
            color="white" 
            textAlign="center"
          >
            Our Creative Tools
          </Heading>
          <Text 
            fontSize={{ base: 'md', md: 'lg' }} 
            color="gray.300" 
            maxW="800px" 
            textAlign="center"
          >
            Explore our collection of design tools to enhance your creative projects. All tools are free to use and require no sign-up.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          {tools.map((tool) => (
            <Link 
              key={tool.id} 
              to={tool.link}
              style={{ textDecoration: 'none' }}
            >
              <Box
                borderRadius="2xl"
                overflow="hidden"
                bg="rgba(0, 0, 0, 0.2)"
                backdropFilter="blur(10px)"
                borderWidth="1px"
                borderColor="rgba(255, 255, 255, 0.1)"
                boxShadow="0 10px 30px -5px rgba(0, 0, 0, 0.3)"
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.4)",
                  borderColor: "rgba(255, 255, 255, 0.2)"
                }}
                position="relative"
                h="100%"
              >
                <Box 
                  position="absolute" 
                  top="0" 
                  left="0" 
                  right="0" 
                  h="8px" 
                  bgGradient={tool.bgGradient} 
                />
                <Flex direction="column" p={8} h="100%">
                  <Flex 
                    align="center" 
                    mb={4}
                  >
                    <Box 
                      fontSize="3xl" 
                      mr={4}
                    >
                      {tool.icon}
                    </Box>
                    <Heading 
                      as="h3" 
                      fontSize={{ base: "xl", md: "2xl" }} 
                      fontWeight="bold" 
                      color="white"
                    >
                      {tool.title}
                    </Heading>
                  </Flex>
                  <Text 
                    color="gray.300" 
                    mb={6}
                    flex="1"
                  >
                    {tool.description}
                  </Text>
                  <ChakraLink 
                    alignSelf="flex-start"
                    color="purple.300"
                    fontWeight="bold"
                    _hover={{ color: "purple.200" }}
                  >
                    {tool.id === 1 ? "Try it now →" : "Coming soon"}
                  </ChakraLink>
                </Flex>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      </Container>
    </Layout>
  );
}

export default Tools; 
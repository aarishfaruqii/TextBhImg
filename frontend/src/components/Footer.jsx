import { Box, Flex, Text, HStack, IconButton } from '@chakra-ui/react'
import { FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'

function FooterWithGallery() {
  return (
    <Box as="section" mt={20}>
      {/* Footer */}
      <Box as="footer" py={6} mt={10} borderTop="1px solid rgba(255, 255, 255, 0.1)">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          px={{ base: 4, md: 10 }}
        >
          <Text color="gray.400" fontSize="sm" textAlign="center" mb={{ base: 2, md: 0 }}>
            © {new Date().getFullYear()} Text-Behind-Image. All rights reserved.
          </Text>

          <HStack spacing={4}>
            <IconButton
              aria-label="Twitter"
              icon={<FaTwitter />}
              variant="ghost"
              colorScheme="whiteAlpha"
            />
            <IconButton
              aria-label="GitHub"
              icon={<FaGithub />}
              variant="ghost"
              colorScheme="whiteAlpha"
            />
            <IconButton
              aria-label="Instagram"
              icon={<FaInstagram />}
              variant="ghost"
              colorScheme="whiteAlpha"
            />
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
} 

export default FooterWithGallery;
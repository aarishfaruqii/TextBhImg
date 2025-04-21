import { Box } from '@chakra-ui/react'
import Navbar from './Navbar'
import Footer from '../Footer'

function Layout({ children }) {
  return (
    <Box 
      minH="100vh" 
      bg="#0f0c29" 
      backgroundImage="linear-gradient(135deg, #0f0c29, #302b63, #24243e)"
      backgroundAttachment="fixed"
      overflowX="hidden"
    >
      <Navbar />
      <Box 
        as="main"
        px={{ base: 2, md: 4 }}
        mt={{ base: 24, md: 32 }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  )
}

export default Layout 
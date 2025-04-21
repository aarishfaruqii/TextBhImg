import React, { useState, useEffect, Suspense } from 'react'
import { Box, Spinner, Center, Text, Button } from '@chakra-ui/react'
import Editor from '../components/sections/Editor'
import Layout from '../components/layout/Layout'

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Editor component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh" flexDirection="column" p={4}>
          <Text fontSize="xl" mb={4}>Something went wrong with the editor.</Text>
          <Text color="gray.500" mb={6}>
            {this.state.error?.message || "Unknown error occurred"}
          </Text>
          <Button colorScheme="blue" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Center>
      );
    }

    return this.props.children;
  }
}

function EditorPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple timeout to ensure rendering has time to complete
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      {isLoading ? (
        <Center h="70vh">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
        </Center>
      ) : (
        <ErrorBoundary>
          <Suspense fallback={
            <Center h="70vh">
              <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
            </Center>
          }>
            <Editor />
          </Suspense>
        </ErrorBoundary>
      )}
    </Layout>
  )
}

export default EditorPage 
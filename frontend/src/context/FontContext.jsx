import { createContext, useState, useContext, useEffect } from 'react'
import fontCollection from '../data/fontCollection'
import { loadGoogleFonts, preloadFont } from '../utils/fontLoader'

// Create context
export const FontContext = createContext()

// Hook to use font context
export const useFontContext = () => useContext(FontContext)

// Font Provider component
export const FontProvider = ({ children }) => {
  const [availableFonts, setAvailableFonts] = useState([])
  const [loadedFonts, setLoadedFonts] = useState([])
  const [fontCategories, setFontCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // Load fonts on component mount
  useEffect(() => {
    const initializeFonts = async () => {
      setIsLoading(true)
      
      try {
        // Load only 5 popular fonts first for immediate use (reduced from 15)
        const popularFonts = fontCollection.slice(0, 5)
        
        try {
          loadGoogleFonts(popularFonts)
        } catch (fontError) {
          console.warn('Error loading initial fonts:', fontError)
          // Continue even if fonts fail to load
        }
        
        setLoadingProgress(10)
        
        // Set available fonts
        setAvailableFonts(fontCollection)
        
        // Extract categories
        const categories = ['all', ...new Set(fontCollection.map(font => font.category))]
        setFontCategories(categories)
        setLoadingProgress(20)
        
        // Track loaded fonts
        setLoadedFonts(popularFonts.map(font => font.family))
        
        // Load remaining fonts in smaller batches with more delay
        const remainingFonts = fontCollection.slice(5, 25) // Only load 20 more fonts initially
        const batchSize = 5 // Smaller batch size
        const totalBatches = Math.ceil(remainingFonts.length / batchSize)
        
        for (let i = 0; i < totalBatches; i++) {
          const start = i * batchSize
          const end = start + batchSize
          const batch = remainingFonts.slice(start, end)
          
          // Use setTimeout to prevent UI blocking with longer delay
          await new Promise(resolve => {
            setTimeout(() => {
              try {
                loadGoogleFonts(batch)
                setLoadedFonts(prev => [...prev, ...batch.map(font => font.family)])
              } catch (batchError) {
                console.warn(`Error loading font batch ${i}:`, batchError)
              }
              
              const progress = 20 + Math.round(80 * (i + 1) / totalBatches)
              setLoadingProgress(progress)
              resolve()
            }, 300) // Increased delay
          })
        }
      } catch (error) {
        console.error('Error initializing fonts:', error)
      } finally {
        setLoadingProgress(100)
        setIsLoading(false)
      }
    }
    
    initializeFonts()
  }, [])
  
  // Load a specific font on demand
  const loadFont = async (fontFamily) => {
    if (!fontFamily || loadedFonts.includes(fontFamily)) return
    
    const font = fontCollection.find(f => f.family === fontFamily)
    if (font) {
      try {
        await preloadFont(font.family, font.variants)
        setLoadedFonts(prev => [...prev, font.family])
        return true
      } catch (error) {
        console.warn(`Failed to load font ${fontFamily}:`, error)
        return false
      }
    }
    return false
  }
  
  // Get font weights for a specific font
  const getFontWeights = (fontFamily) => {
    const font = fontCollection.find(f => f.family === fontFamily)
    return font ? font.variants : ['400', '700']
  }
  
  // Context value
  const value = {
    availableFonts,
    loadedFonts,
    fontCategories,
    isLoading,
    loadingProgress,
    loadFont,
    getFontWeights
  }
  
  return (
    <FontContext.Provider value={value}>
      {children}
    </FontContext.Provider>
  )
}

export default FontProvider 
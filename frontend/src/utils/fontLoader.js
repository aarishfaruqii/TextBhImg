/**
 * Utility to dynamically load Google Fonts
 */

/**
 * Loads a batch of Google Fonts
 * @param {Array} fonts - Array of font objects with family and variants properties
 * @param {Number} batchSize - Number of fonts to load in each batch (default: 10)
 */
export const loadGoogleFonts = (fonts, batchSize = 10) => {
  // Create batches of fonts to avoid hitting request limits
  const batches = [];
  for (let i = 0; i < fonts.length; i += batchSize) {
    batches.push(fonts.slice(i, i + batchSize));
  }
  
  // Load each batch
  batches.forEach(batch => {
    const families = batch.map(font => {
      const fontFamily = font.family.replace(/ /g, '+');
      const variants = font.variants.join(',');
      return `${fontFamily}:wght@${variants}`;
    });
    
    if (families.length > 0) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}`).join('&')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  });
};

/**
 * Creates a style element with font-face declarations for all specified fonts
 * This is an alternative method if Google Fonts API has issues
 * @param {Array} fonts - Array of font objects
 */
export const createFontFaceStylesheet = (fonts) => {
  const fontFaces = fonts.map(font => {
    const fontFamily = font.family.replace(/ /g, '+');
    const variants = font.variants;
    
    return variants.map(weight => {
      return `
@font-face {
  font-family: '${font.family}';
  font-style: normal;
  font-weight: ${weight};
  src: url(https://fonts.gstatic.com/s/${fontFamily.toLowerCase()}/v1/${fontFamily}-${weight}.woff2) format('woff2');
  font-display: swap;
}`;
    }).join('\n');
  }).join('\n');
  
  const style = document.createElement('style');
  style.textContent = fontFaces;
  document.head.appendChild(style);
};

/**
 * Preloads a single font for immediate use
 * @param {String} fontFamily - Font family name
 * @param {Array} weights - Array of font weights to load
 */
export const preloadFont = (fontFamily, weights = ['400']) => {
  const family = fontFamily.replace(/ /g, '+');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@${weights.join(',')}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  // Return a promise that resolves when the font is loaded
  return new Promise(resolve => {
    link.onload = () => resolve();
    // Fallback if onload doesn't trigger
    setTimeout(resolve, 2000);
  });
};

export default loadGoogleFonts; 
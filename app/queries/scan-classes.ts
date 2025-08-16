// Query to scan all Motor records for CSS classes
interface ScanClassesParams {
  includeModules?: boolean;  // Scan compiled modules (default: true)
  includeAssets?: boolean;   // Scan HTML assets (default: true)
  includeRouters?: boolean;  // Scan router outputs (default: false)
}

interface State {
  classes: Set<string>;
  scannedRecords: number;
}

const queryDefinition = {
  // Parameter validation
  params: (input: any): ScanClassesParams => ({
    includeModules: input?.includeModules ?? true,
    includeAssets: input?.includeAssets ?? true,
    includeRouters: input?.includeRouters ?? false
  }),
  
  // Initialize state
  init: (): State => ({
    classes: new Set<string>(),
    scannedRecords: 0
  }),
  
  // Process each record
  update: (record: any, state: State): State => {
    // We'll check params in transform, for now scan everything
    let contentToScan: string | null = null;
    
    // Scan modules for className attributes
    if (record.type === 'module' && record.operation === 'add') {
    // Skip bundle modules - they contain minified library code
    if (record.name && (record.name.includes('.bundle') || record.name.includes('unocss-core'))) {
      return state;
    }
    
    contentToScan = record.data && (record.data.src || record.data.compiled_src) || '';
    
    if (contentToScan) {
      
      // Match className="..." in JSX/TSX
      const classNameMatches = contentToScan.matchAll(/className=["']([^"']+)["']/g);
      for (const match of classNameMatches) {
        if (match && match[1]) {
          const classes = match[1].split(/\s+/).filter(Boolean);
          classes.forEach(cls => state.classes.add(cls));
        }
      }
      
      // Match className={`...`} template literals
      const templateMatches = contentToScan.matchAll(/className=\{`([^`]+)`\}/g);
      for (const match of templateMatches) {
        if (match && match[1]) {
          // Remove template expressions ${...} before splitting
          const cleanedTemplate = match[1].replace(/\$\{[^}]+\}/g, ' ');
          const classes = cleanedTemplate.split(/\s+/).filter(Boolean);
          classes.forEach(cls => {
            // Additional filtering for common template literal artifacts
            if (!cls.includes('$') && !cls.includes('?') && !cls.includes(':') && cls.length > 1) {
              state.classes.add(cls);
            }
          });
        }
      }
      
      // Match string literals that contain CSS classes (for variant objects, etc.)
      // Look for quoted strings that contain common Tailwind patterns
      const stringLiteralMatches = contentToScan.matchAll(/"([^"]*(?:bg-|text-|border-|p-|m-|w-|h-|flex|grid|rounded|shadow|hover:|focus:|active:)[^"]*)"/g);
      for (const match of stringLiteralMatches) {
        if (match && match[1]) {
          const classes = match[1].split(/\s+/).filter(Boolean);
          classes.forEach(cls => {
            // Filter for valid CSS class patterns
            if (cls.match(/^[a-z][a-z0-9\-_:]*$/i) && cls.length > 1) {
              state.classes.add(cls);
            }
          });
        }
      }
      
      state.scannedRecords++;
    }
    }
    
    // Scan HTML assets for class attributes
    if (record.type === 'asset' && record.operation === 'add') {
    if (record.data.mime_type === 'text/html' && record.data.content) {
      contentToScan = record.data.content;
      
      if (contentToScan) {
        // Match class="..." in HTML
        const classMatches = contentToScan.matchAll(/class=["']([^"']+)["']/g);
        for (const match of classMatches) {
          if (match && match[1]) {
            const classes = match[1].split(/\s+/).filter(Boolean);
            classes.forEach(cls => state.classes.add(cls));
          }
        }
        
        state.scannedRecords++;
      }
    }
    }
    
    // Scan router outputs (optional, can be expensive)
    if (record.type === 'router' && record.operation === 'add') {
    if (record.data.compiled_src || record.data.src) {
      contentToScan = record.data.compiled_src || record.data.src || '';
      
      if (contentToScan) {
        // Look for HTML strings in router code
        const htmlMatches = contentToScan.matchAll(/class=["']([^"']+)["']/g);
        for (const match of htmlMatches) {
          if (match && match[1]) {
            const classes = match[1].split(/\s+/).filter(Boolean);
            classes.forEach(cls => state.classes.add(cls));
          }
        }
        
        state.scannedRecords++;
      }
    }
    }
    
    return state;
  },
  
  // Transform state to result
  transform: (state: State, params: ScanClassesParams) => {
    // Convert Set to Array for proper serialization
    const classesArray = Array.from(state.classes).sort();
    
    return {
      classes: classesArray,
      count: classesArray.length,
      scannedRecords: state.scannedRecords
    };
  }
};

// Export the query definition
export default queryDefinition;
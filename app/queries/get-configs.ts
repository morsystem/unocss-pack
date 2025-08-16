// Query to get all UnoCSS configurations
export function initState(): any {
  return {
    configs: []
  };
}

export function processRecord(record: any, state: any): void {
  // Process configuration records
  if (record.type === 'uno-config' && (record.operation === 'create' || record.operation === 'update')) {
    // Check if this is an update to existing config
    const existingIndex = state.configs.findIndex(c => c.name === record.name);
    
    const config = {
      name: record.name,
      presets: record.data.presets || [],
      theme: record.data.theme || {},
      rules: record.data.rules || [],
      shortcuts: record.data.shortcuts || {},
      path: record.data.path,
      createdAt: record.data.createdAt,
      createdBy: record.data.createdBy,
      updatedAt: record.data.updatedAt,
      updatedBy: record.data.updatedBy
    };
    
    if (existingIndex >= 0) {
      // Update existing config
      state.configs[existingIndex] = config;
    } else {
      // Add new config
      state.configs.push(config);
    }
  }
}

export function getResult(state: any): any {
  // Sort by name
  const sortedConfigs = state.configs.sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return {
    configs: sortedConfigs,
    count: sortedConfigs.length
  };
}
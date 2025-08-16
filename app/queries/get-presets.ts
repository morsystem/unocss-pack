// Query to get all registered UnoCSS presets
export interface GetPresetsParams {
  includeConfig?: boolean;  // Include preset configuration (default: true)
}

export function initState(): any {
  return {
    presets: []
  };
}

export function processRecord(record: any, state: any, params: GetPresetsParams = {}): void {
  const { includeConfig = true } = params;
  
  // Only process preset registration records
  if (record.type === 'uno-preset' && record.operation === 'register') {
    const preset = {
      name: record.name,
      module: record.data.module,
      path: record.data.path,
      priority: record.data.priority || 100,
      registeredAt: record.data.registeredAt,
      registeredBy: record.data.registeredBy
    };
    
    if (includeConfig) {
      preset.config = record.data.config || {};
    }
    
    state.presets.push(preset);
  }
}

export function getResult(state: any): any {
  // Sort by priority (higher first) and then by name
  const sortedPresets = state.presets.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return a.name.localeCompare(b.name);
  });
  
  return {
    presets: sortedPresets,
    count: sortedPresets.length
  };
}
// Query to get the latest generated CSS for a configuration
export interface GetGeneratedCssParams {
  configName: string;
}

export function initState(): any {
  return {
    cssContent: null,
    generatedAt: null,
    classCount: 0,
    recordId: null
  };
}

export function processRecord(record: any, state: any, params: GetGeneratedCssParams): void {
  // Only process css-generated records for the requested config
  if (record.type === 'css-generated' && 
      record.name === params.configName && 
      record.operation === 'generate') {
    
    // Always use the latest record (they come in chronological order)
    state.cssContent = record.data.content;
    state.generatedAt = record.data.generatedAt;
    state.classCount = record.data.classCount || 0;
    state.recordId = record.id;
  }
}

export function getResult(state: any): any {
  if (!state.cssContent) {
    return {
      found: false,
      content: null,
      generatedAt: null,
      classCount: 0,
      recordId: null
    };
  }
  
  return {
    found: true,
    content: state.cssContent,
    generatedAt: state.generatedAt,
    classCount: state.classCount,
    recordId: state.recordId
  };
}
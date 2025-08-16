// Action to create a custom UnoCSS configuration
interface CreateConfigArgs {
  name: string;
  presets: string[];  // Names of presets to include
  theme?: Record<string, any>;  // Theme overrides
  rules?: Array<[string | RegExp, any]>;  // Custom rules
  shortcuts?: Record<string, string>;  // Custom shortcuts
  path?: string;  // Optional CSS path (defaults to /{name}.css)
}

export function execute(args: CreateConfigArgs): any {
  // Validate inputs
  Motor.validate.required(args.name, 'Configuration name is required');
  Motor.validate.required(args.presets, 'At least one preset is required');
  Motor.validate.isArray(args.presets, 'Presets must be an array');
  
  if (args.presets.length === 0) {
    return Motor.action.error('At least one preset must be specified');
  }
  
  const { name, presets, theme = {}, rules = [], shortcuts = {}, path } = args;
  
  // Create config record
  const configPath = path || `/${name}.css`;
  
  createRecord('uno-config', name, 'create', {
    presets,
    theme,
    rules,
    shortcuts,
    path: configPath,
    createdAt: Motor.time.now(),
    createdBy: args.actor_id || 'system'
  });
  
  return Motor.action.success({
    message: `UnoCSS configuration '${name}' created successfully`,
    config: {
      name,
      presets,
      theme,
      rules,
      shortcuts,
      path: configPath
    }
  });
}
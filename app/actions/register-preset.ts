// Action to register a UnoCSS preset
interface RegisterPresetArgs {
  name: string;
  module: string;
  path?: string;  // Optional CSS path (defaults to /{name}.css)
  priority?: number;  // Higher priority presets override lower ones
  config?: Record<string, any>;  // Default configuration
}

export function execute(args: RegisterPresetArgs): any {
  // Validate inputs
  Motor.validate.required(args.name, 'Preset name is required');
  Motor.validate.required(args.module, 'Module name is required');
  
  const { name, module, path, priority = 100, config = {} } = args;
  
  // Create the preset record
  const presetPath = path || `/${name}.css`;
  
  createRecord('uno-preset', name, 'register', {
    module,
    path: presetPath,
    priority,
    config,
    registeredAt: Motor.time.now(),
    registeredBy: args.actor_id || 'system'
  });
  
  return Motor.action.success({
    message: `UnoCSS preset '${name}' registered successfully`,
    preset: {
      name,
      module,
      path: presetPath,
      priority,
      config
    }
  });
}
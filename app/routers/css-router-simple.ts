// Simple router that serves pre-generated CSS
// Since routers can't access Motor.query APIs, we'll use a different approach
export async function serveCss(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Extract configuration name from path
    const match = path.match(/^\/([^\/]+)\.css$/);
    
    if (!match) {
      return new Response('Not Found', { status: 404 });
    }
    
    const configName = match[1];
    
    // For now, return a placeholder that tells users to generate CSS
    // In a real implementation, we'd need Motor to provide a way for routers
    // to access records or run queries
    
    const placeholderCss = `/* Motor UnoCSS - Build-time CSS Generation
    
Configuration: ${configName}
Generated CSS is stored in event records.

To generate CSS for this configuration, run:
  motor action run regenerate-css -a '{"configName": "${configName}"}'

Note: This router needs Motor to provide record access APIs for routers.
Currently, routers cannot query the database directly.
*/

/* Minimal fallback styles */
body { 
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 20px;
}

/* Basic utility classes for testing */
.bg-blue-500 { background-color: #3b82f6; }
.text-white { color: #ffffff; }
.p-4 { padding: 1rem; }
.rounded-lg { border-radius: 0.5rem; }
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.font-bold { font-weight: 700; }
.mb-4 { margin-bottom: 1rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.text-center { text-align: center; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.max-w-3xl { max-width: 48rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
`;
    
    return new Response(placeholderCss, {
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-UnoCSS-Config': configName,
        'X-UnoCSS-Status': 'placeholder'
      }
    });
    
  } catch (error) {
    console.error('CSS router error:', error);
    
    const errorCss = `/* UnoCSS Router Error
Error: ${error.message}
*/
body { font-family: system-ui, -apple-system, sans-serif; }
`;
    
    return new Response(errorCss, {
      status: 500,
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'X-UnoCSS-Error': error.message
      }
    });
  }
}
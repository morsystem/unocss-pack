// Event-sourced router that serves pre-generated CSS from css-generated records
export async function serveCss(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Extract configuration name from path
    // Examples:
    // /tailwind.css -> tailwind
    // /all.css -> all
    // /my-app.css -> my-app
    const match = path.match(/^\/([^\/]+)\.css$/);
    
    if (!match) {
      return new Response('Not Found', { status: 404 });
    }
    
    const configName = match[1];
    
    // Query for the latest css-generated record
    console.log(`Serving CSS for configuration: ${configName}`);
    
    const cssRecords = await Motor.query.getRecords({
      type: 'css-generated',
      name: configName
    });
    
    if (cssRecords.length === 0) {
      // No CSS generated yet - return helpful message
      const helpfulCss = `/* UnoCSS - No CSS Generated Yet
      
Configuration: ${configName}
Time: ${Motor.time.now()}

To generate CSS, run:
  motor action run regenerate-css -a '{"configName": "${configName}"}'

Or if using a pack, CSS should be generated automatically during installation.
*/

/* Minimal fallback styles */
body { 
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 20px;
}
`;
      
      return new Response(helpfulCss, {
        status: 404,
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          'X-UnoCSS-Status': 'not-generated'
        }
      });
    }
    
    // Get the latest generated CSS (records are ordered by ID, so last is newest)
    const latestRecord = cssRecords[cssRecords.length - 1];
    const cssData = latestRecord.data;
    
    console.log(`  Serving CSS generated at ${cssData.generatedAt} (${cssData.size} bytes, ${cssData.classCount} classes)`);
    
    // Return the pre-generated CSS with appropriate caching headers
    return new Response(cssData.content, {
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'ETag': `"${latestRecord.hash}"`, // Use record hash as ETag
        'X-UnoCSS-Config': configName,
        'X-UnoCSS-Generated': cssData.generatedAt,
        'X-UnoCSS-Classes': String(cssData.classCount),
        'X-Motor-Record-ID': String(latestRecord.id)
      }
    });
    
  } catch (error) {
    console.error('CSS router error:', error);
    
    // Return error as CSS comment
    const errorCss = `/* UnoCSS Router Error
    
URL: ${request.url}
Error: ${error.message}
Time: ${Motor.time.now()}

This is likely a temporary issue. Please try again or check the server logs.
*/

/* Fallback styles */
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
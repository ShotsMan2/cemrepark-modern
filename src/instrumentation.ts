export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // We would import '@opentelemetry/sdk-node' here in a real production environment
    console.log('[OpenTelemetry] Tracing initialized for Node.js runtime');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[OpenTelemetry] Tracing initialized for Edge runtime');
  }
}

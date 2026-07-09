export async function withRetry(asyncFunction, maxRetries = 3, baseDelay = 1000) {
  let retries = 0;

  while (true) {
    try {
      return await asyncFunction();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, retries);
      retries++;

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

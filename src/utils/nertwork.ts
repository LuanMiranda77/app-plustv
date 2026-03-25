export const delay = (ms: number) => {
  return new Promise(res => setTimeout(res, ms));
};

export async function requestWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  wait = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0) {
      await delay(wait);
      return requestWithRetry(fn, retries - 1, wait);
    }
    throw err;
  }
}

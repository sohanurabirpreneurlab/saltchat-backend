export class ProviderRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable = true,
  ) {
    super(message);
    this.name = 'ProviderRequestError';
  }
}

export function isRetryableProviderError(error: unknown): boolean {
  if (error instanceof ProviderRequestError) return error.retryable;
  return error instanceof TypeError || (error instanceof Error && /timeout|fetch failed|network/i.test(error.message));
}

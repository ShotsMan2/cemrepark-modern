/**
 * Validates if a given URL string is a valid image URL for Next.js <Image> component.
 * Next.js requires absolute URLs (starting with http:// or https://) or relative URLs starting with /
 * This helper returns the input URL if valid, otherwise falls back to a placeholder image.
 */
export function getValidImageUrl(
  src: string | null | undefined,
  fallback: string = "/assets/img/default-150x150.png"
): string {
  if (!src || typeof src !== "string") return fallback;

  const trimmed = src.trim();

  // If it starts with / it's considered a valid relative path by Next.js
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // If it starts with http:// or https://, check if it's a valid URL constructor-wise
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch (e) {
      return fallback;
    }
  }

  // If it's something like "data:image/...", it's also allowed by Next.js (if configured),
  // but generally not used for product images. Just in case:
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  // If it doesn't match any valid pattern, return the fallback
  return fallback;
}

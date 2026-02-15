/**
 * Image URL utilities for converting between Cloudinary URLs and proxy URLs
 */

import { API_BASE_URL } from '@/utils/api.config';

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL (e.g., https://res.cloudinary.com/cloud/image/upload/v1234/folder/image.jpg)
 * @returns Public ID (e.g., folder/image or santt-market/products/image)
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // Match pattern: /upload/v{version}/{publicId}.{format}
    // or /upload/{publicId}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (match && match[1]) {
      // Remove file extension if present
      return match[1].replace(/\.[^.]+$/, '');
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Convert Cloudinary URL to proxy URL
 * @param cloudinaryUrl - Full Cloudinary URL
 * @returns Proxy URL (e.g., /api/images/santt-market/products/image)
 */
export const convertToProxyUrl = (cloudinaryUrl: string): string => {
  if (!cloudinaryUrl) return '';

  // If already a proxy URL, return as is
  // Check for both relative /api/v1 and full API_BASE_URL to be safe, or just API_BASE_URL
  if (cloudinaryUrl.startsWith(`${API_BASE_URL}/images/`)) {
    return cloudinaryUrl;
  }

  // If not a Cloudinary URL, return as is
  if (!cloudinaryUrl.includes('cloudinary.com')) {
    return cloudinaryUrl;
  }

  const publicId = extractPublicIdFromUrl(cloudinaryUrl);
  if (!publicId) {
    // If can't extract, return original URL
    return cloudinaryUrl;
  }

  return `${API_BASE_URL}/images/${publicId}`;
};

/**
 * Check if an image URL should use the proxy
 * @param url - Image URL
 * @returns true if URL should be proxied
 */
export const shouldUseProxy = (url: string): boolean => {
  if (!url) return false;

  // Use proxy for Cloudinary URLs
  return url.includes('cloudinary.com') && url.includes('/upload/');
};

/**
 * Get the best image URL to use (proxy if available, otherwise original)
 * @param url - Original image URL
 * @param useProxy - Whether to use proxy (default: true)
 * @returns Best URL to use
 */
export const getImageUrl = (url: string, useProxy: boolean = true): string => {
  if (!url) return '';

  if (useProxy && shouldUseProxy(url)) {
    return convertToProxyUrl(url);
  }

  return url;
};

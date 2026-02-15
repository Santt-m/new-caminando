import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logError } from '../utils/logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Upload an image to Cloudinary
 * @param fileSource - Buffer or data URI string of the image file
 * @param folder - Folder in Cloudinary (e.g., 'products', 'categories')
 * @param publicId - Optional custom public ID
 * @returns Upload result with URL and public_id
 */
export const uploadImage = async (
  fileSource: Buffer | string,
  folder: string = 'products',
  publicId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof fileSource === 'string') {
      // For data URI strings, use upload method
      cloudinary.uploader.upload(fileSource, {
        folder: `${env.projectId}/${folder}`,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }, (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('Upload failed'));
      });
    } else {
      // For buffers, use stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${env.projectId}/${folder}`,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload failed'));
        }
      );
      uploadStream.end(fileSource);
    }
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL (e.g., https://res.cloudinary.com/cloud/image/upload/v1234/folder/image.jpg)
 * @returns Public ID (e.g., folder/image or santt-market/products/image)
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
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
 * @param baseUrl - Base URL of your server (e.g., 'http://localhost:4000' or 'https://yourdomain.com')
 * @returns Proxy URL (e.g., /api/images/santt-market/products/image)
 */
export const convertToProxyUrl = (cloudinaryUrl: string, baseUrl: string = ''): string => {
  const publicId = extractPublicIdFromUrl(cloudinaryUrl);
  if (!publicId) {
    // If can't extract, return original URL
    return cloudinaryUrl;
  }
  return `${baseUrl}/api/images/${publicId}`;
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image
 * @returns Deletion result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteImage = async (publicId: string): Promise<any> => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Get image details from Cloudinary
 * @param publicId - The public ID of the image
 * @returns Image resource details
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getImageDetails = async (publicId: string): Promise<any> => {
  return cloudinary.api.resource(publicId);
};

/**
 * List all images in a folder
 * @param folder - Folder path
 * @param maxResults - Maximum number of results
 * @returns List of resources
 */
export const listImages = async (
  folder: string = env.projectId,
  maxResults: number = 100
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  return cloudinary.api.resources({
    type: 'upload',
    prefix: folder,
    max_results: maxResults,
    resource_type: 'image'
  });
};

/**
 * Get Cloudinary usage statistics
 * @returns Usage stats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUsageStats = async (): Promise<any> => {
  const usage = await cloudinary.api.usage();

  // Normalize the response to match frontend expectations
  return {
    storage: {
      bytes_stored: usage.storage?.usage || 0,
      max_bytes_allowed: usage.storage?.limit || usage.plan_credits?.usage || 1000000000, // Default 1GB
    },
    objects_count: usage.resources || 0,
    requests: {
      active_requests: 0,
      requests_this_month: usage.requests || 0,
    },
    transformations: usage.transformations || 0,
    bandwidth: usage.bandwidth?.usage || 0,
    plan: usage.plan || 'free',
  };
};

/**
 * Get folder statistics by analyzing resources
 * @returns Array of folders with their stats
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFolderStats = async (): Promise<any[]> => {
  try {
    // Get all resources
    const allResources = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image'
    });

    // Group by folder
    const folderMap = new Map<string, { count: number; bytes: number }>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allResources.resources.forEach((resource: any) => {
      const folder = resource.folder || resource.public_id.split('/')[0] || 'root';

      if (!folderMap.has(folder)) {
        folderMap.set(folder, { count: 0, bytes: 0 });
      }

      const stats = folderMap.get(folder)!;
      stats.count++;
      stats.bytes += resource.bytes || 0;
    });

    // Convert to array
    return Array.from(folderMap.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      bytes: stats.bytes
    }));
  } catch (error) {
    logError('Error getting folder stats:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
    return [];
  }
};

/**
 * Get analytics data from Cloudinary resources
 */
export const getCloudinaryAnalytics = async () => {
  try {
    // Get all resources with details
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image'
    });

    const resources = result.resources || [];

    // Sort by created_at to get most recent
    // Sort by created_at to get most recent
    const recentUploads = [...resources]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        publicId: r.public_id,
        url: r.secure_url,
        folder: r.folder || r.public_id.split('/')[0],
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        createdAt: r.created_at
      }));

    // Get total stats
    // Get total stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalBytes = resources.reduce((sum: number, r: any) => sum + (r.bytes || 0), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formats = resources.reduce((acc: any, r: any) => {
      acc[r.format] = (acc[r.format] || 0) + 1;
      return acc;
    }, {});

    const totalStats = {
      totalImages: resources.length,
      totalBytes,
      formats,
      averageSize: resources.length > 0 ? totalBytes / resources.length : 0
    };

    // Group by folder
    // Group by folder
    const folderStatsArray = await getFolderStats();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const folderStats = folderStatsArray.reduce((acc: any, folder: any) => {
      acc[folder.name] = {
        count: folder.count,
        bytes: folder.bytes
      };
      return acc;
    }, {});

    // Get largest images
    // Get largest images
    const largestImages = [...resources]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => (b.bytes || 0) - (a.bytes || 0))
      .slice(0, 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => ({
        publicId: r.public_id,
        url: r.secure_url,
        folder: r.folder || r.public_id.split('/')[0],
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height
      }));

    return {
      totalStats,
      folderStats,
      recentUploads,
      largestImages
    };
  } catch (error) {
    logError('Error getting Cloudinary analytics:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
    return {
      totalStats: {
        totalImages: 0,
        totalBytes: 0,
        formats: {},
        averageSize: 0
      },
      folderStats: {},
      recentUploads: [],
      largestImages: []
    };
  }
};

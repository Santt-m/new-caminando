import { Router, type Request, type Response, type NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { success, error as errorResponse } from '../../utils/response.js';
import {
  uploadImage,
  deleteImage,
  getImageDetails,
  listImages,
  getUsageStats,
  getFolderStats,
  getCloudinaryAnalytics,
  convertToProxyUrl
} from '../../config/cloudinary.js';
import { uploadSingle } from '../../middlewares/upload.js';
import { env } from '../../config/env.js';
import { logAudit, logError } from '../../utils/logger.js';

const router = Router();

// Middleware to check if Cloudinary is configured
const checkCloudinaryConfig = (_req: Request, res: Response, next: NextFunction) => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return errorResponse(
      res,
      'Cloudinary no está configurado. Por favor, configura las variables de entorno CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en el archivo .env del backend.',
      503
    );
  }
  next();
};

// Apply middleware to all routes
router.use(checkCloudinaryConfig);

// GET /api/panel/cloudinary/stats - Get Cloudinary usage statistics
router.get(
  '/stats',
  asyncHandler(async (_req: Request, res) => {
    const stats = await getUsageStats();
    return success(res, stats, 'Cloudinary stats retrieved successfully');
  })
);

// GET /api/panel/cloudinary/folders - Get folder statistics
router.get(
  '/folders',
  asyncHandler(async (_req: Request, res) => {
    const folders = await getFolderStats();
    return success(res, folders, 'Folder stats retrieved successfully');
  })
);

// GET /api/panel/cloudinary/images - List all images
router.get(
  '/images',
  asyncHandler(async (req: Request, res) => {
    const folder = req.query.folder as string | undefined;
    const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string) : 50;

    const images = await listImages(folder, maxResults);
    return success(res, images, 'Images retrieved successfully');
  })
);

// GET /api/admin/cloudinary/images/:publicId - Get image details
router.get(
  '/images/:publicId',
  asyncHandler(async (req: Request, res) => {
    const publicId = req.params.publicId;
    const details = await getImageDetails(publicId);

    if (!details) {
      return errorResponse(res, 'Image not found', 404);
    }

    return success(res, details, 'Image details retrieved successfully');
  })
);

// POST /api/admin/cloudinary/upload - Upload image
router.post(
  '/upload',
  uploadSingle,
  asyncHandler(async (req: Request, res) => {
    if (!req.file) {
      return errorResponse(res, 'No image file provided', 400);
    }

    const folder = (req.body.folder as string) || 'products';

    try {
      // Convert buffer to base64
      const b64 = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await uploadImage(dataURI, folder);

      // Convert Cloudinary URL to proxy URL
      const proxyUrl = convertToProxyUrl(result.secure_url);

      // Return proxy URL as the main URL
      logAudit('Image uploaded via admin', 'ADMIN', { public_id: result.public_id, folder }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

      return success(res, {
        url: proxyUrl,                    // ✅ URL principal (proxy)
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        // URLs adicionales para referencia
        cloudinary_url: result.secure_url, // URL original de Cloudinary (backup)
        proxy_url: proxyUrl                // URL del proxy (mismo que url)
      }, 'Image uploaded successfully', 201);
    } catch (error) {
      logError('Upload error:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
      return errorResponse(res, 'Failed to upload image', 500);
    }
  })
);

// DELETE /api/admin/cloudinary/images/:publicId - Delete image
router.delete(
  '/images/:publicId',
  asyncHandler(async (req: Request, res) => {
    const publicId = decodeURIComponent(req.params.publicId);

    try {
      const result = await deleteImage(publicId);

      if (result.result === 'not found') {
        return errorResponse(res, 'Image not found', 404);
      }

      logAudit('Image deleted via admin', 'ADMIN', { public_id: publicId }, { ip: req.ip, userAgent: req.headers['user-agent'] }, req.userId);

      return success(res, result, 'Image deleted successfully');
    } catch (error) {
      logError('Delete error:', error instanceof Error ? error : new Error(String(error)), 'SYSTEM');
      return errorResponse(res, 'Failed to delete image', 500);
    }
  })
);

// ==================== ANALYTICS ENDPOINTS ====================

// GET /api/panel/cloudinary/metrics/analytics - Get Cloudinary analytics
router.get(
  '/metrics/analytics',
  asyncHandler(async (_req: Request, res) => {
    const analytics = await getCloudinaryAnalytics();
    return success(res, analytics, 'Analytics retrieved successfully');
  })
);

export default router;

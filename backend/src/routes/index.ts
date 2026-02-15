import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { analyticsRouter } from './analytics.js';
import { adminAuthRouter } from './panel/auth.js';
import { adminUsersRouter } from './panel/users.js';
import { adminTicketsRouter } from './panel/tickets.js';
import { adminAnalyticsRouter } from './panel/analytics.js';
import { adminSystemRouter } from './panel/system.js';
import adminCloudinaryRouter from './panel/cloudinary.js';
import adminImageProxyRouter from './panel/imageProxy.js';
import { adminCampaignsRouter } from './panel/campaigns.js';
import adminScraperRouter from './panel/scraper.js';

import { adminSecurityRouter } from './panel/security.js';
import { adminEmailsRouter } from './panel/emails.js';
import imagesRouter from './images.js';
import { supportRouter } from './support.js';
import { productsRouter } from './products.js';

// E-commerce panel routes
import { adminCategoriesRouter } from './panel/categories.js';
import { adminBrandsRouter } from './panel/brands.js';
import { adminAttributesRouter } from './panel/attributes.js';
import { adminProductsRouter } from './panel/products.js';

import { cronRouter } from './cron.js';
import eanRouter from './ean.js';

export const apiRouter = Router();

export const panelRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/images', imagesRouter);
apiRouter.use('/support', supportRouter);
apiRouter.use('/cron', cronRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/ean', eanRouter);

panelRouter.use('/auth', adminAuthRouter);
panelRouter.use('/users', adminUsersRouter);
panelRouter.use('/tickets', adminTicketsRouter);
panelRouter.use('/analytics', adminAnalyticsRouter);
panelRouter.use('/system', adminSystemRouter);
panelRouter.use('/cloudinary', adminCloudinaryRouter);
panelRouter.use('/cloudinary/proxy', adminImageProxyRouter);
panelRouter.use('/campaigns', adminCampaignsRouter);
panelRouter.use('/emails', adminEmailsRouter);
panelRouter.use('/security', adminSecurityRouter);
panelRouter.use('/scraper', adminScraperRouter);

// E-commerce admin routes
panelRouter.use('/categories', adminCategoriesRouter);
panelRouter.use('/brands', adminBrandsRouter);
panelRouter.use('/attributes', adminAttributesRouter);
panelRouter.use('/products', adminProductsRouter);



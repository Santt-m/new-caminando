import { adminApi } from './admin/auth.service';

interface CloudinaryUploadResult {
  url: string;              // URL del proxy (/api/images/...)
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  cloudinary_url?: string;  // URL original de Cloudinary (backup)
  proxy_url?: string;       // URL del proxy (mismo que url)
}

interface CloudinaryImage {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  resource_type: string;
}

interface CloudinaryStats {
  storage: {
    bytes_stored: number;
    max_bytes_allowed: number;
  };
  objects_count: number;
  requests: {
    active_requests: number;
    requests_this_month: number;
  };
}

export interface Category {
  id: string;
  translations: {
    es: string;
    en?: string;
    pt?: string;
  };
  subcategories: Array<{
    slug: string;
    translations: {
      es: string;
      en?: string;
      pt?: string;
    };
  }>;
  active: boolean;
  order: number;
  icon?: string;
  color?: string;
}

// Category services
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await adminApi.get('/categories');
    return response.data.data;
  },

  async getCategory(id: string): Promise<Category> {
    const response = await adminApi.get(`/categories/${id}`);
    return response.data.data;
  },

  async createCategory(category: Omit<Category, 'order'>): Promise<Category> {
    const response = await adminApi.post('/categories', category);
    return response.data.data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const response = await adminApi.put(`/categories/${id}`, updates);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<{ id: string }> {
    const response = await adminApi.delete(`/categories/${id}`);
    return response.data.data;
  },

  async toggleCategoryActive(id: string): Promise<Category> {
    const response = await adminApi.patch(`/categories/${id}/toggle`);
    return response.data.data;
  },

  async reorderCategories(categoryOrders: Array<{ id: string; order: number }>): Promise<Category[]> {
    const response = await adminApi.post('/categories/reorder', { categoryOrders });
    return response.data.data;
  },
};

// Cloudinary services
export const cloudinaryService = {
  async uploadImage(file: File, folder: string = 'products', onUploadProgress?: (progressEvent: any) => void): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await adminApi.post('/cloudinary/upload', formData, {
      onUploadProgress
    });
    return response.data.data;
  },

  async deleteImage(publicId: string): Promise<{ result: string }> {
    const response = await adminApi.delete(`/cloudinary/images/${encodeURIComponent(publicId)}`);
    return response.data.data;
  },

  async getFolders(): Promise<{ name: string; count: number; bytes: number }[]> {
    const response = await adminApi.get('/cloudinary/folders');
    return response.data.data;
  },

  async listImages(folder?: string, maxResults: number = 50): Promise<CloudinaryImage[]> {
    const params = new URLSearchParams();
    if (folder) params.append('folder', folder);
    params.append('maxResults', maxResults.toString());

    const response = await adminApi.get(`/cloudinary/images?${params}`);
    return response.data.data;
  },

  async getStats(): Promise<CloudinaryStats> {
    const response = await adminApi.get('/cloudinary/stats');
    return response.data.data;
  },

  async getImageDetails(publicId: string): Promise<CloudinaryImage> {
    const response = await adminApi.get(`/cloudinary/images/${publicId}`);
    return response.data.data;
  },

  async getAnalytics(): Promise<any> {
    const response = await adminApi.get('/cloudinary/metrics/analytics');
    return response.data.data;
  },
};

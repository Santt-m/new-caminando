import axios from 'axios';

import { API_BASE_URL as API_URL } from '@/utils/api.config';

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

// Helper to get auth token
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

const getFormAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

// Cloudinary services
export const cloudinaryService = {
  async uploadImage(file: File, folder: string = 'products'): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await axios.post<{ data: CloudinaryUploadResult }>(
      `${API_URL}/panel/cloudinary/upload`,
      formData,
      {
        headers: getFormAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async deleteImage(publicId: string): Promise<{ result: string }> {
    const response = await axios.delete<{ data: { result: string } }>(
      `${API_URL}/panel/cloudinary/images/${encodeURIComponent(publicId)}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async listImages(folder?: string, maxResults: number = 50): Promise<CloudinaryImage[]> {
    const params = new URLSearchParams();
    if (folder) params.append('folder', folder);
    params.append('maxResults', maxResults.toString());

    const response = await axios.get<{ data: CloudinaryImage[] }>(
      `${API_URL}/panel/cloudinary/images?${params}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async getStats(): Promise<CloudinaryStats> {
    const response = await axios.get<{ data: CloudinaryStats }>(
      `${API_URL}/panel/cloudinary/stats`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async getImageDetails(publicId: string): Promise<CloudinaryImage> {
    const response = await axios.get<{ data: CloudinaryImage }>(
      `${API_URL}/panel/cloudinary/images/${publicId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },
};

// Category services
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await axios.get<{ data: Category[] }>(
      `${API_URL}/panel/categories`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async getCategory(id: string): Promise<Category> {
    const response = await axios.get<{ data: Category }>(
      `${API_URL}/panel/categories/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async createCategory(category: Omit<Category, 'order'>): Promise<Category> {
    const response = await axios.post<{ data: Category }>(
      `${API_URL}/panel/categories`,
      category,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const response = await axios.put<{ data: Category }>(
      `${API_URL}/panel/categories/${id}`,
      updates,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async deleteCategory(id: string): Promise<{ id: string }> {
    const response = await axios.delete<{ data: { id: string } }>(
      `${API_URL}/panel/categories/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async toggleCategoryActive(id: string): Promise<Category> {
    const response = await axios.patch<{ data: Category }>(
      `${API_URL}/panel/categories/${id}/toggle`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },

  async reorderCategories(categoryOrders: Array<{ id: string; order: number }>): Promise<Category[]> {
    const response = await axios.post<{ data: Category[] }>(
      `${API_URL}/panel/categories/reorder`,
      { categoryOrders },
      {
        headers: getAuthHeaders(),
      }
    );

    return response.data.data;
  },
};

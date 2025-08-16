import { Platform } from 'react-native';

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloud_name:
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || 'your_api_key',
  api_secret:
    process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET || 'your_api_secret',
  upload_preset:
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset', // Recommended for client-side uploads
};

// Generate signature for secure uploads (if using signed uploads)
const generateSignature = (params, apiSecret) => {
  const crypto = require('crypto-js');
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return crypto.SHA1(sortedParams + apiSecret).toString();
};

// Upload image to Cloudinary using unsigned upload (recommended for mobile)
const uploadToCloudinary = async (imageUri, folder = 'medtek') => {
  try {
    // Create FormData for the upload
    const formData = new FormData();

    // Handle different file formats based on platform
    const fileExtension = imageUri.split('.').pop();
    const fileName = `image_${Date.now()}.${fileExtension}`;

    formData.append('file', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });

    formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
    formData.append('folder', folder);
    formData.append('quality', 'auto:good');
    formData.append('fetch_format', 'auto');

    // Optional: Add transformation parameters
    formData.append('transformation', 'q_auto:good,f_auto');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${errorData.error?.message || 'Unknown error'}`,
      );
    }

    const result = await response.json();

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Alternative: Signed upload for more security (requires backend signature generation)
const uploadToCloudinarySigned = async (imageUri, folder = 'medtek') => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const params = {
      folder: folder,
      timestamp: timestamp,
      quality: 'auto:good',
      fetch_format: 'auto',
    };

    // Note: In production, you should generate the signature on your backend
    // This is just for demonstration - never expose api_secret in client code
    const signature = generateSignature(params, CLOUDINARY_CONFIG.api_secret);

    const formData = new FormData();
    const fileExtension = imageUri.split('.').pop();
    const fileName = `image_${Date.now()}.${fileExtension}`;

    formData.append('file', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: `image/${fileExtension}`,
      name: fileName,
    });

    formData.append('api_key', CLOUDINARY_CONFIG.api_key);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('quality', 'auto:good');
    formData.append('fetch_format', 'auto');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${errorData.error?.message || 'Unknown error'}`,
      );
    }

    const result = await response.json();

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    throw new Error(`Cloudinary signed upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary (requires backend endpoint for security)
const deleteFromCloudinary = async public_id => {
  try {
    // Note: Direct deletion from client is not recommended for security
    // This should be done through your backend API

    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      public_id: public_id,
      timestamp: timestamp,
    };

    const signature = generateSignature(params, CLOUDINARY_CONFIG.api_secret);

    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('api_key', CLOUDINARY_CONFIG.api_key);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/destroy`;

    const response = await fetch(deleteUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Recommended: Delete through backend endpoint
const deleteFromCloudinaryViaBackend = async (public_id, backendUrl) => {
  try {
    const response = await fetch(`${backendUrl}/api/cloudinary/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_id }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting from Cloudinary via backend:', error);
    return false;
  }
};

// Utility function to get optimized image URL
const getOptimizedImageUrl = (public_id, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto:good',
    format = 'auto',
  } = options;

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/w_${width},h_${height},q_${quality},f_${format}/${public_id}`;
};

export {
  uploadToCloudinary,
  uploadToCloudinarySigned,
  deleteFromCloudinary,
  deleteFromCloudinaryViaBackend,
  getOptimizedImageUrl,
  CLOUDINARY_CONFIG,
};

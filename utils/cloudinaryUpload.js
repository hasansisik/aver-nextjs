/**
 * Utility function to upload files to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} preset - The Cloudinary upload preset to use
 * @param {string} folder - The folder to upload to in Cloudinary
 * @returns {Promise<object>} - The upload response with URLs and metadata
 */
export async function uploadToCloudinary(file, preset = 'default_preset', folder = 'services') {
  if (!file) {
    throw new Error('No file provided');
  }

  // Create form data for the upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);
  formData.append('folder', folder);

  try {
    // You should replace 'your-cloud-name' with your actual Cloudinary cloud name
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    // Make the upload request
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Helper function to get appropriate Cloudinary upload preset based on file type
 * @param {string} fileType - The type of file (e.g., 'image', 'icon', 'document')
 * @returns {string} - The Cloudinary preset to use
 */
export function getUploadPreset(fileType) {
  // Map file types to different presets if needed
  const presetMap = {
    image: 'services_images',
    icon: 'services_icons',
    document: 'services_docs'
  };

  return presetMap[fileType] || 'services_preset';
} 
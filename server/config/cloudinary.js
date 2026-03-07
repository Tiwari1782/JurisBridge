const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary from local temp path
const uploadToCloudinary = async (filePath, folder = 'jurisbridge') => {
  try {
    console.log('☁️  Cloudinary uploading...');
    console.log('   📁 File:', filePath);
    console.log('   🔑 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
    });

    console.log('   ✅ Upload success:', result.secure_url);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    // LOG THE ACTUAL ERROR — this will tell us exactly what's wrong
    console.error('❌ Cloudinary ACTUAL error:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    throw new Error('File upload to cloud storage failed');
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete failed:', error.message);
    throw new Error('File deletion from cloud storage failed');
  }
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
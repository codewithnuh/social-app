import cloudinary from '../utils/upload/cloudinary';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';

class UploadService {
  public static async uploadImage(filePath: string) {
    if (!filePath) {
      throw new AppError(ERRORS.BAD_REQUEST);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'social-app',
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  public static async deleteImage(publicId: string) {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  }
}

export default UploadService;

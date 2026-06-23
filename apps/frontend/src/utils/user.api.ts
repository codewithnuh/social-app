import { apiRequest } from '../utils/api';

export type UpdateProfileDTO = {
  name?: string;
  avatar?: File | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function updateProfile(data: UpdateProfileDTO) {
  const formData = new FormData();

  if (data.name) {
    formData.append('name', data.name);
  }

  if (data.avatar) {
    formData.append('image', data.avatar); // MUST match multer field name
  }

  return apiRequest<
    ApiResponse<{
      _id: string;
      name: string;
      username: string;
      email: string;
      avatarUrl?: string;
    }>
  >('/api/v1/auth/user/profile', {
    method: 'PATCH',
    body: formData,
  });
}

export async function logoutUser() {
  return apiRequest<
    ApiResponse<{
      success: boolean;
    }>
  >('/api/v1/auth/logout', {
    method: 'POST',
  });
}

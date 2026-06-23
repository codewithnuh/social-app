import type { PostType } from '../components/Dashboard/types';
import { apiRequest } from '../utils/api';
import type { CommentDTO } from '@social-app/shared';
type FeedType = {
  success: boolean;
  message: string;
  data: PostType[];
};
export class PostsAPI {
  // CREATE POST
  static createPost(data: FormData) {
    return apiRequest<PostType>('/api/v1/post', {
      method: 'POST',
      body: data,
      // no Content-Type header, no JSON.stringify —
      // browser sets multipart/form-data boundary automatically
    });
  }

  // GET FEED
  static getFeed() {
    return apiRequest<FeedType>('/api/v1/post/feed');
  }

  // LIKE / UNLIKE
  static toggleLike(postId: string) {
    return apiRequest(`/api/v1/post/${postId}/like`, {
      method: 'PATCH',
    });
  }

  // ADD COMMENT
  static addComment(postId: string, data: CommentDTO) {
    return apiRequest(`/api/v1/post/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // DELETE POST
  static deletePost(postId: string) {
    return apiRequest(`/api/v1/post/${postId}`, {
      method: 'DELETE',
    });
  }
}

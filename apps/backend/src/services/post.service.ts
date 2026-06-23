import { PostModel } from '../models/post';
import { UserModel } from '../models/user';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

class PostService {
  // -------------------------
  // CREATE POST
  // -------------------------
  public static async createPost(input: {
    authorId: string;
    text?: string;
    image?: string;
  }) {
    const { authorId, text, image } = input;

    const user = await UserModel.findById(authorId);
    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    const post = await PostModel.create({
      author: new Types.ObjectId(authorId),
      text,
      image,
      likes: [],
      comments: [],
    });

    if (!post) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR);
    }

    return post;
  }

  // -------------------------
  // GET FEED (ALL POSTS)
  // -------------------------
  public static async getFeed(currentUserId: string) {
    const posts = await PostModel.find()
      .populate('author', 'username name avatarUrl')
      .populate('comments.user', 'username name avatarUrl')
      .sort({ createdAt: -1 });

    return posts.map(post => {
      const isLiked = post.likes.some(id => id.toString() === currentUserId);

      return {
        _id: post._id.toString(),
        author: post.author,
        text: post.text,
        image: post.image,

        likesCount: post.likes.length,
        isLiked,

        commentsCount: post.comments.length,
        comments: post.comments.map(comment => ({
          user: comment.user,
          text: comment.text,
        })),

        createdAt: post.createdAt,
      };
    });
  }

  // -------------------------
  // LIKE / UNLIKE POST
  // -------------------------
  public static async toggleLike(postId: string, userId: string) {
    const post = await PostModel.findById(postId);

    if (!post) {
      throw new Error('Post not found');
    }

    const index = post.likes.findIndex(id => id.toString() === userId);

    const isLiked = index === -1;

    if (isLiked) {
      post.likes.push(userId as any);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    return {
      success: true,
      isLiked,
      likesCount: post.likes.length,
    };
  }
  // -------------------------
  // ADD COMMENT
  // -------------------------
  public static async addComment(
    postId: string,
    input: { userId: string; text: string }
  ) {
    const { userId, text } = input;

    const post = await PostModel.findById(postId);
    if (!post) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    const comment = {
      user: new Types.ObjectId(userId),
      text,
    };

    post.comments.push(comment as any);

    await post.save();

    return {
      commentsCount: post.comments.length,
      comment: {
        user: {
          _id: user._id,
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        text,
      },
    };
  }

  // -------------------------
  // DELETE POST
  // -------------------------
  public static async deletePost(postId: string, userId: string) {
    const post = await PostModel.findById(postId);

    if (!post) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    if (post.author.toString() !== userId) {
      throw new AppError(ERRORS.UNAUTHORIZED);
    }

    await PostModel.findByIdAndDelete(postId);

    return { success: true };
  }
}

export default PostService;

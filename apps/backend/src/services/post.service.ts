import { PostModel } from '../models/post';
import { UserModel } from '../models/user';
import { AppError } from '../utils/app-error';
import { ERRORS } from '../constants/errors';
import { Types } from 'mongoose';

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
  public static async getFeed() {
    const posts = await PostModel.find()
      .populate('author', 'username name avatarUrl')
      .sort({ createdAt: -1 });

    return posts.map(post => ({
      _id: post._id,
      author: post.author,
      text: post.text,
      image: post.image,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      comments: post.comments.map((c: any) => ({
        user: c.user,
        text: c.text,
        createdAt: c.createdAt,
      })),
      createdAt: post.createdAt,
    }));
  }

  // -------------------------
  // LIKE / UNLIKE POST
  // -------------------------
  public static async toggleLike(postId: string, userId: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new AppError(ERRORS.NOT_FOUND);
    }

    const userObjectId = new Types.ObjectId(userId);

    const hasLiked = post.likes.some(id => id.equals(userObjectId));

    if (hasLiked) {
      post.likes = post.likes.filter(id => !id.equals(userObjectId));
    } else {
      post.likes.push(userObjectId);
    }

    await post.save();

    return {
      liked: !hasLiked,
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

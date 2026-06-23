export type UserType = {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
};

export type CommentType = {
  _id: string;
  user: UserType;
  text: string;
  createdAt?: string;
};

export interface PostItem {
  id: string;
  author: string;
  handle: string;
  timeAgo: string;
  content: string;
  image?: string;
}

export type PostType = {
  _id: string;
  author: {
    _id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };

  text?: string;
  image?: string;

  likesCount: number;
  isLiked: boolean;
  commentsCount: number;

  comments: CommentType[];

  createdAt?: string;
};
export interface CreatePostInput {
  text: string;
  image?: File | null;
  author: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
}

import { Document, Schema, Types, model } from 'mongoose';

import { CallbackError } from 'mongoose';

export interface PostDoc extends Document {
  author: Types.ObjectId;
  text?: string;
  image?: string;
  likes: Types.ObjectId[];
  comments: {
    user: Types.ObjectId;
    text: string;
  }[];
  createdAt: Schema.Types.Date;
}
const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const PostSchema = new Schema<PostDoc>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    comments: [CommentSchema],
  },
  {
    timestamps: true,
  }
);

PostSchema.pre(
  'validate' as any,
  function (this: PostDoc, next: (err?: CallbackError) => void) {
    if (!this.text && !this.image) {
      return next(new Error('Post must contain text or image'));
    }
    next();
  }
);
export const PostModel = model<PostDoc>('Post', PostSchema);

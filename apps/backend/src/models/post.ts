import { model, Schema } from 'mongoose';
import type { PostType } from '@social-app/shared';

const PostSchema = new Schema(
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

    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const PostModel = model<PostType>('Post', PostSchema);

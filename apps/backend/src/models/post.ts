import { Document, Schema, Types, model } from 'mongoose';

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

PostSchema.pre('validate', function () {
  if (!this.text && !this.image) {
    throw new Error('Post must contain text or image');
  }
});
export const PostModel = model<PostDoc>('Post', PostSchema);

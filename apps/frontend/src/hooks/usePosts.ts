import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PostsAPI } from '../utils/posts.api';

import type {
  UserType,
  PostType,
  CreatePostInput,
} from '../components/Dashboard/types';

// GET FEED

export function useFeed() {
  console.log('useFeed executed');
  return useQuery({
    queryKey: ['posts', 'feed'],
    enabled: true,
    queryFn: async () => {
      const res = await PostsAPI.getFeed();
      console.log('FEED RAW RESPONSE:', res);
      return res.data;
    },
  });
}

// CREATE POST

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => {
      const formData = new FormData();
      formData.append('text', input.text);
      if (input.image) {
        formData.append('image', input.image); // must match multer's upload.single('image')
      }
      return PostsAPI.createPost(formData);
    },

    // optimistic insert
    onMutate: async input => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });

      const previousPosts = queryClient.getQueryData<PostType[]>([
        'posts',
        'feed',
      ]);

      const tempId = `temp-${Date.now()}`;

      const optimisticPost: PostType = {
        _id: tempId,
        text: input.text,
        image: input.image ? URL.createObjectURL(input.image) : undefined,
        author: input.author,
        isLiked: false,
        likesCount: 0,
        comments: [],
        commentsCount: 0,
      };

      queryClient.setQueryData(
        ['posts', 'feed'],
        (old: PostType[] | undefined) => [optimisticPost, ...(old ?? [])]
      );

      // return context for rollback + so onSuccess can find/replace the temp post
      return { previousPosts, tempId };
    },

    // rollback on failure
    onError: (_err, _input, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts', 'feed'], context.previousPosts);
      }
    },

    // replace temp post with the real server post
    onSuccess: (serverPost, _input, context) => {
      queryClient.setQueryData(
        ['posts', 'feed'],
        (old: PostType[] | undefined) => {
          if (!old) return old;
          return old.map(p => (p._id === context?.tempId ? serverPost : p));
        }
      );
    },

    // safety net: always resync with server truth eventually
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}

// LIKE POST

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => PostsAPI.toggleLike(postId),

    onMutate: async postId => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });

      const previous = queryClient.getQueryData(['posts', 'feed']);

      queryClient.setQueryData(['posts', 'feed'], (old: PostType[]) => {
        if (!old) return old;

        return old.map((post: PostType) => {
          if (post._id !== postId) return post;

          const isLiked = post.isLiked;

          return {
            ...post,
            isLiked: !isLiked,
            likesCount: isLiked
              ? Math.max(0, post.likesCount - 1)
              : post.likesCount + 1,
          };
        });
      });

      return { previous };
    },

    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['posts', 'feed'], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}

// COMMENT

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      PostsAPI.addComment(postId, { text }),

    // 1. instant UI update
    onMutate: async ({ postId, text }) => {
      await queryClient.cancelQueries({ queryKey: ['posts', 'feed'] });

      const previous = queryClient.getQueryData<PostType[]>(['posts', 'feed']);

      const currentUser = queryClient.getQueryData<UserType>(['user']); // optional

      queryClient.setQueryData<PostType[]>(['posts', 'feed'], old =>
        old?.map(post => {
          if (post._id !== postId) return post;

          const newComment = {
            _id: `temp-${Date.now()}`,
            text,
            user: {
              _id: currentUser?._id ?? 'me',
              name: currentUser?.name ?? 'You',
              username: currentUser?.username ?? 'you',
              avatarUrl: currentUser?.avatarUrl,
            },
          };

          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [newComment, ...post.comments],
          };
        })
      );

      return { previous };
    },

    // rollback if error
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['posts', 'feed'], context.previous);
      }
    },

    // final sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
    },
  });
}

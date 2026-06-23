import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ThumbUpOutlined,
  ThumbUp,
  ChatBubbleOutlined,
} from '@mui/icons-material';

import type { CommentType, PostType } from './types';
import { useToggleLike, useAddComment } from '../../hooks/usePosts';
import { useUser } from '../../hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  post: PostType;
};

export default function PostCard({ post }: Props) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { data: user } = useUser();

  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const queryClient = useQueryClient();

  const handleLikeToggle = () => {
    const postId = post._id;

    queryClient.setQueryData(
      ['posts', 'feed'],
      (old: PostType[] | undefined) => {
        if (!old) return old;

        return old.map(p => {
          if (p._id !== postId) return p;

          const isLiked = p.isLiked;

          return {
            ...p,
            isLiked: !isLiked,
            likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        });
      }
    );

    toggleLike.mutate(postId);
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const newComment: CommentType = {
      _id: Date.now().toString(),
      text: commentText,
      user: {
        _id: user?.id ?? 'me',
        username: user?.username ?? 'you',
        name: user?.name ?? 'You',
      },
    };

    const postId = post._id;

    queryClient.setQueryData(
      ['posts', 'feed'],
      (old: PostType[] | undefined) => {
        if (!old) return old;

        return old.map(p => {
          if (p._id !== postId) return p;

          return {
            ...p,
            comments: [newComment, ...p.comments],
            commentsCount: p.commentsCount + 1,
          };
        });
      }
    );

    setCommentText('');

    addComment.mutate({
      postId,
      text: commentText,
    });
  };

  return (
    <>
      <Card
        sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      >
        <CardHeader
          avatar={
            <Avatar src={post.author.avatarUrl}>
              {post.author.name?.[0] || post.author.username?.[0]}
            </Avatar>
          }
          action={
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {post.author.name}
            </Typography>
          }
          subheader={`@${post.author.username}`}
        />

        <CardContent sx={{ pt: 0, px: 3 }}>
          <Typography>{post.text}</Typography>

          {post.image && (
            <Box sx={{ mt: 2 }}>
              <img
                height={400}
                width={400}
                alt={post.text?.slice(0, 10)}
                src={post.image}
                style={{ width: '100%' }}
              />
            </Box>
          )}
        </CardContent>

        <Divider />

        <CardActions sx={{ px: 2, py: 0.5 }}>
          <Button
            onClick={handleLikeToggle}
            startIcon={
              post.isLiked ? (
                <ThumbUp sx={{ color: '#1976d2' }} />
              ) : (
                <ThumbUpOutlined />
              )
            }
            sx={{
              textTransform: 'none',
              color: post.isLiked ? '#1976d2' : 'text.secondary',
              fontWeight: post.isLiked ? 600 : 400,
            }}
          >
            {post.isLiked
              ? `Liked (${post.likesCount})`
              : `Like (${post.likesCount})`}
          </Button>

          <Button
            startIcon={<ChatBubbleOutlined />}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
            onClick={() => setCommentOpen(true)}
          >
            Comment ({post.commentsCount})
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Comments</DialogTitle>

        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            @{post.author.username}
          </DialogContentText>

          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {post.comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No comments yet.
              </Typography>
            ) : (
              post.comments.map(comment => {
                const isMine = comment.user?._id === user?.id;

                return (
                  <Box
                    key={comment._id}
                    sx={{ p: 1.5, bgcolor: 'grey.100', borderRadius: 2 }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {isMine ? 'You' : comment.user?.name}
                    </Typography>
                    <Typography variant="body2">{comment.text}</Typography>
                  </Box>
                );
              })
            )}
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Write your comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCommentOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!commentText.trim()}
            onClick={handleCommentSubmit}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

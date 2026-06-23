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
  Send as SendIcon,
} from '@mui/icons-material';

import type { CommentType, PostType } from './types';
import { useToggleLike, useAddComment } from '../../hooks/usePosts';
import { useUser } from '../../hooks/useUser';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  post: PostType;
};

function getSafeAuthor(author: PostType['author'] | undefined) {
  const name =
    author?.name?.trim() || author?.username?.trim() || 'Unknown User';
  const username = author?.username?.trim() || 'unknown';
  const avatarUrl = author?.avatarUrl?.trim() || undefined;
  const initial = name.charAt(0).toUpperCase() || '?';

  return { name, username, avatarUrl, initial };
}

function getSafeCommentUser(commentUser: CommentType['user'] | undefined) {
  const name =
    commentUser?.name?.trim() ||
    commentUser?.username?.trim() ||
    'Unknown User';
  const initial = name.charAt(0).toUpperCase() || '?';
  return { name, initial };
}

export default function PostCard({ post }: Props) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [imageError, setImageError] = useState(false);
  const { data: user } = useUser();

  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const queryClient = useQueryClient();

  const author = getSafeAuthor(post.author);

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
        sx={{
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          border: '1px solid',
          borderColor: 'grey.200',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          },
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={author.avatarUrl}
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'primary.main',
                fontWeight: 600,
              }}
            >
              {author.initial}
            </Avatar>
          }
          action={
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          }
          title={
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, lineHeight: 1.3 }}
            >
              {author.name}
            </Typography>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              @{author.username}
            </Typography>
          }
          sx={{ pb: 1 }}
        />

        <CardContent sx={{ pt: 0, pb: post.image ? 1 : 2, px: 3 }}>
          {post.text && (
            <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {post.text}
            </Typography>
          )}

          {post.image && !imageError && (
            <Box
              sx={{
                mt: 2,
                borderRadius: '12px',
                overflow: 'hidden',
                bgcolor: 'grey.100',
                maxHeight: 480,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                alt={post.text?.slice(0, 40) || 'Post image'}
                src={post.image}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  maxHeight: 480,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Box>
          )}

          {post.image && imageError && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: '12px',
                bgcolor: 'grey.100',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Image couldn't be loaded
              </Typography>
            </Box>
          )}
        </CardContent>

        <Divider sx={{ mx: 2 }} />

        <CardActions sx={{ px: 2, py: 0.5, gap: 0.5 }}>
          <Button
            onClick={handleLikeToggle}
            startIcon={
              post.isLiked ? (
                <ThumbUp sx={{ fontSize: 18, color: 'primary.main' }} />
              ) : (
                <ThumbUpOutlined sx={{ fontSize: 18 }} />
              )
            }
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              color: post.isLiked ? 'primary.main' : 'text.secondary',
              fontWeight: post.isLiked ? 600 : 500,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {post.isLiked ? 'Liked' : 'Like'}
            {post.likesCount > 0 && ` · ${post.likesCount}`}
          </Button>

          <Button
            startIcon={<ChatBubbleOutlined sx={{ fontSize: 18 }} />}
            size="small"
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              color: 'text.secondary',
              fontWeight: 500,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => setCommentOpen(true)}
          >
            Comment
            {post.commentsCount > 0 && ` · ${post.commentsCount}`}
          </Button>
        </CardActions>
      </Card>

      <Dialog
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{ borderRadius: '16px' }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Comments
          {post.commentsCount > 0 && (
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              ({post.commentsCount})
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3 }}>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {post.comments.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No comments yet. Be the first to say something.
                </Typography>
              </Box>
            ) : (
              post.comments.map(comment => {
                const isMine = comment.user?._id === user?.id;
                const commentUser = getSafeCommentUser(comment.user);

                return (
                  <Box
                    key={comment._id}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: isMine ? 'primary.main' : 'grey.500',
                      }}
                    >
                      {commentUser.initial}
                    </Avatar>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: isMine ? 'primary.50' : 'grey.100',
                        borderRadius: '12px',
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {isMine ? 'You' : commentUser.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {comment.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Stack>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Write your comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '12px' },
              }}
            />
            <IconButton
              color="primary"
              disabled={!commentText.trim()}
              onClick={handleCommentSubmit}
              sx={{ mb: 0.5 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setCommentOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

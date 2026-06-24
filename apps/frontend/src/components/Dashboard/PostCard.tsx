import { useState } from 'react';
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
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ThumbUpOutlined,
  ThumbUp,
  ChatBubbleOutlined,
  Send as SendIcon,
  Close as CloseIcon,
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
  const username = commentUser?.username?.trim() || 'unknown';
  const avatarUrl = commentUser?.avatarUrl?.trim() || undefined;
  const initial = name.charAt(0).toUpperCase() || '?';
  return { name, username, avatarUrl, initial };
}

export default function PostCard({ post }: Props) {
  const theme = useTheme();
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [imageError, setImageError] = useState(false);
  const { data: user } = useUser();

  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const queryClient = useQueryClient();

  const author = getSafeAuthor(post.author);
  const postImage = post.image?.trim() || '';

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
    addComment.mutate({ postId: post._id, text: commentText });
    setCommentText('');
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.25s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            transform: 'translateY(-2px)',
          },
          overflow: 'hidden',
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              src={author.avatarUrl}
              alt={author.name}
              sx={{
                width: 44,
                height: 44,
                bgcolor: theme.palette.primary.main,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {author.initial}
            </Avatar>
          }
          action={
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          }
          title={
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {author.name}
            </Typography>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              @{author.username}
            </Typography>
          }
          sx={{
            pb: 0.5,
            pt: 2,
            px: 3,
          }}
        />

        <CardContent sx={{ pt: 1, pb: 1.5, px: 3 }}>
          {post.text?.trim() ? (
            <Typography
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                fontSize: '0.95rem',
              }}
            >
              {post.text}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No caption provided.
            </Typography>
          )}

          {postImage && !imageError && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'grey.50',
                maxHeight: 480,
                display: 'flex',
                justifyContent: 'center',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <img
                alt={post.text?.slice(0, 40) || 'Post image'}
                src={postImage}
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

          {postImage && imageError && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.50',
                textAlign: 'center',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Image couldn't be loaded
              </Typography>
            </Box>
          )}
        </CardContent>

        <Divider sx={{ mx: 2 }} />

        <CardActions sx={{ px: 2, py: 1, gap: 0.5 }}>
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
              borderRadius: 50,
              px: 1.5,
              py: 0.5,
              color: post.isLiked ? 'primary.main' : 'text.secondary',
              fontWeight: post.isLiked ? 600 : 500,
              '&:hover': {
                bgcolor: 'action.hover',
              },
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
              borderRadius: 50,
              px: 1.5,
              py: 0.5,
              color: 'text.secondary',
              fontWeight: 500,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => setCommentOpen(true)}
          >
            Comment
            {post.commentsCount > 0 && ` · ${post.commentsCount}`}
          </Button>
        </CardActions>
      </Card>

      {/* Comment Dialog */}
      <Dialog
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          borderRadius: 3,
          boxShadow: '0 12px 60px rgba(0,0,0,0.15)',
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            Comments
            {post.commentsCount > 0 && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1, fontWeight: 400 }}
              >
                ({post.commentsCount})
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={() => setCommentOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {(post.comments ?? []).length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No comments yet. Be the first to say something.
                </Typography>
              </Box>
            ) : (
              post.comments.map(comment => {
                const isMine = comment.user?._id === user?._id;

                console.log({
                  isMine,
                  commentUser: comment.user._id,
                  currentUser: user,
                });
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
                      src={commentUser.avatarUrl}
                      alt={commentUser.name}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: isMine
                          ? theme.palette.primary.main
                          : theme.palette.grey[500],
                      }}
                    >
                      {commentUser.initial}
                    </Avatar>

                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        bgcolor: isMine
                          ? theme.palette.primary.dark
                          : theme.palette.grey[100],
                        color: isMine ? 'white' : theme.palette.text.primary,
                        borderRadius: 3,
                        borderBottomLeftRadius: isMine ? 3 : 0,
                        borderBottomRightRadius: isMine ? 0 : 3,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {isMine ? 'You' : commentUser.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-word', mt: 0.25 }}
                      >
                        {comment.text || 'No comment text'}
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
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                },
              }}
              slotProps={{
                input: {
                  sx: { py: 0.5 },
                },
              }}
            />
            <IconButton
              color="primary"
              disabled={!commentText.trim()}
              onClick={handleCommentSubmit}
              sx={{
                mb: 0.5,
                bgcolor: commentText.trim()
                  ? theme.palette.primary.main
                  : 'action.disabledBackground',
                color: commentText.trim() ? 'white' : 'text.disabled',
                '&:hover': {
                  bgcolor: commentText.trim()
                    ? theme.palette.primary.dark
                    : 'action.disabledBackground',
                },
                width: 40,
                height: 40,
                borderRadius: 2,
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button
            onClick={() => setCommentOpen(false)}
            sx={{
              textTransform: 'none',
              borderRadius: 50,
              color: 'text.secondary',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

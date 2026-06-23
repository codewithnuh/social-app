import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

type Props = {
  postText: string;
  onPostTextChange: (value: string) => void;
  postImage: File | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function CreatePostCard({
  postText,
  onPostTextChange,
  postImage,
  imagePreview,
  onImageChange,
  onSubmit,
}: Props) {
  return (
    <Card
      component="form"
      onSubmit={onSubmit}
      sx={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
          Create Post
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="What's on your mind?"
          value={postText}
          onChange={e => onPostTextChange(e.target.value)}
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
            },
          }}
          sx={{ fontSize: '16px' }}
        />

        {imagePreview && (
          <Box
            sx={{
              mt: 2,
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              maxHeight: '250px',
            }}
          >
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          px: 3,
          py: 1.5,
          justifyContent: 'space-between',
          bgcolor: '#fafafa',
        }}
      >
        <Button
          component="label"
          variant="text"
          startIcon={<PhotoCamera />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add Image
          <input type="file" accept="image/*" hidden onChange={onImageChange} />
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={!postText.trim() && !postImage}
          sx={{
            px: 4,
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Post
        </Button>
      </CardActions>
    </Card>
  );
}

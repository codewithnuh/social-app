import React, { useEffect, useMemo, useState } from 'react';
import DashboardHeader from '../components/Dashboard/DashBoardHeader';
import { Box, Container, Stack, Typography } from '@mui/material';
import CreatePostCard from '../components/Dashboard/CreateCardPost';
import FeedTabs from '../components/Dashboard/FeedTabs';
import PostsPagination from '../components/Dashboard/Pagination';
import PostCard from '../components/Dashboard/PostCard';
import { useFeed, useCreatePost } from '../hooks/usePosts';
import { useUser } from '../hooks/useUser';

export default function Dashboard() {
  const { data: posts, isLoading } = useFeed();
  const createPost = useCreatePost();

  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useUser();
  const [page, setPage] = useState(1);

  const postsPerPage = 5;

  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPostImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!postText.trim() && !postImage) return;

    createPost.mutate(
      { text: postText, image: undefined },
      {
        onSuccess: () => {
          setPostText('');
          setPostImage(null);
          setImagePreview(null);
          setPage(1);
        },
      }
    );
  };

  const postsArray = Array.isArray(posts) ? posts : [];

  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return postsArray.filter(post => {
      const text = (post.text ?? '').toLowerCase();
      const author = (post.author?.username ?? '').toLowerCase();

      return text.includes(q) || author.includes(q);
    });
  }, [postsArray, searchQuery]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginatedPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 8 }}>
      <DashboardHeader
        searchQuery={searchQuery}
        profile={{
          name: user?.name || 'John Doe',
          email: user?.email || 'mail@example.com',
          username: user?.username || 'username',
        }}
        onProfileSave={() => {}}
        onSearchChange={setSearchQuery}
        anchorEl={anchorEl}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        isMenuOpen={isMenuOpen}
      />

      <Container maxWidth="md">
        <Stack spacing={3}>
          <CreatePostCard
            postText={postText}
            onPostTextChange={setPostText}
            postImage={postImage}
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
            onSubmit={handleCreatePost}
          />

          <FeedTabs value={currentTab} onChange={setCurrentTab} />

          {isLoading ? (
            <Typography sx={{ textAlign: 'center', py: 4 }}>
              Loading feed...
            </Typography>
          ) : paginatedPosts.length === 0 ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ py: 4, textAlign: 'center' }}
            >
              No posts found.
            </Typography>
          ) : (
            paginatedPosts.map(post => <PostCard key={post._id} post={post} />)
          )}

          <PostsPagination
            totalPages={totalPages}
            page={page}
            onChange={setPage}
          />
        </Stack>
      </Container>
    </Box>
  );
}

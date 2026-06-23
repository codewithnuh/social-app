import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Logout,
  ManageAccounts,
  Search as SearchIcon,
  PhotoCamera,
} from '@mui/icons-material';

import { useLogout } from '../../hooks/useUser'; // 👈 ADD THIS

type ProfileData = {
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  avatar?: File | null;
};

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  anchorEl: null | HTMLElement;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  isMenuOpen: boolean;
  profile: ProfileData;
  onProfileSave: (data: ProfileData) => void;
};

export default function DashboardHeader({
  searchQuery,
  onSearchChange,
  anchorEl,
  onMenuOpen,
  onMenuClose,
  isMenuOpen,
  profile,
  onProfileSave,
}: Props) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    profile.avatarUrl
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ✅ LOGOUT HOOK
  const logout = useLogout();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    onProfileSave({
      name,
      username: profile.username,
      email: profile.email,
      avatarUrl: avatarPreview,
      avatar: avatarFile,
    });

    setProfileOpen(false);
    onMenuClose();
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        onMenuClose();
        // optional: redirect
        window.location.href = '/login';
      },
    });
  };

  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'background.paper',
        boxShadow: 1,
        py: 1.5,
        mb: 4,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          Social App
        </Typography>

        <TextField
          size="small"
          placeholder="Search promotions, users..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          sx={{
            width: { xs: '100%', sm: '40%' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: '#f0f2f5',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <IconButton onClick={onMenuOpen}>
          <Avatar src={profile.avatarUrl}>{profile.name?.[0] || 'U'}</Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={onMenuClose}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem onClick={() => setProfileOpen(true)}>
            <ManageAccounts sx={{ mr: 1.5 }} />
            Update Profile Info
          </MenuItem>

          <Divider />

          {/* ✅ FIXED LOGOUT */}
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 1.5 }} />
            Logout
          </MenuItem>
        </Menu>

        {/* PROFILE DIALOG */}
        <Dialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          fullWidth
        >
          <DialogTitle>Update Profile</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar src={avatarPreview} sx={{ width: 88, height: 88 }}>
                  {name?.[0] || 'U'}
                </Avatar>
              </Box>

              <Button component="label" startIcon={<PhotoCamera />}>
                Change Profile Photo
                <input hidden type="file" onChange={handleAvatarChange} />
              </Button>

              <TextField
                label="Display Name"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
              />

              <TextField
                label="Username"
                value={profile.username}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
              <TextField
                label="Email"
                value={profile.email}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setProfileOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

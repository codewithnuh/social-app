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
  Badge,
  useTheme,
} from '@mui/material';
import {
  Logout,
  ManageAccounts,
  Search as SearchIcon,
  PhotoCamera,
  Person,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useLogout } from '../../hooks/useUser';

type ProfileData = {
  name: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
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
  const theme = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatarUrl ?? null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const logout = useLogout();

  const openProfileDialog = () => {
    setName(profile.name);
    setAvatarPreview(profile.avatarUrl ?? null);
    setAvatarFile(null);
    setProfileOpen(true);
    onMenuClose();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    const preview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(preview);
  };

  const handleSave = () => {
    onProfileSave({
      name,
      username: profile.username,
      email: profile.email,
      avatarUrl: avatarPreview ?? undefined,
      avatar: avatarFile,
    });

    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        onMenuClose();
        window.location.href = '/login';
      },
    });
  };

  return (
    <Box
      component="header"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1.5,
        mb: 4,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* App Name */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: -0.5,
            whiteSpace: 'nowrap',
          }}
        >
          Social App
        </Typography>

        {/* Search Bar */}
        <TextField
          size="small"
          placeholder="Search promotions, users..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          sx={{
            width: { xs: '100%', sm: '40%', md: '45%' },
            order: { xs: 3, sm: 0 },
            mt: { xs: 1, sm: 0 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '50px',
              bgcolor: 'action.hover',
              transition: 'all 0.2s',
              '&:hover, &.Mui-focused': {
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Avatar & Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={onMenuOpen}
            sx={{
              p: 0.5,
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: '50%',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'scale(1.05)',
                borderColor: theme.palette.primary.dark,
              },
            }}
          >
            <Avatar
              src={profile.avatarUrl ?? undefined}
              alt={profile.name}
              sx={{ width: 40, height: 40 }}
            >
              {profile.name?.trim()?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={onMenuClose}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          sx={{
            mt: 0.5,
            borderRadius: 2,
            minWidth: 200,
            overflow: 'visible',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <MenuItem onClick={openProfileDialog}>
            <ManageAccounts sx={{ mr: 1.5 }} fontSize="small" />
            Update Profile Info
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 1.5 }} fontSize="small" />
            Logout
          </MenuItem>
        </Menu>

        {/* Profile Update Dialog */}
        <Dialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          fullWidth
          maxWidth="sm"
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          }}
        >
          <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
            Update Profile
          </DialogTitle>

          <DialogContent>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      component="label"
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={avatarPreview ?? undefined}
                    alt={name}
                    sx={{
                      width: 96,
                      height: 96,
                      border: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    {name?.trim()?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </Badge>
              </Box>

              {/* Display Name - editable */}
              <TextField
                label="Display Name"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
                variant="outlined"
                size="medium"
              />

              {/* Username - read-only, with icon */}
              <TextField
                label="Username"
                value={profile.username}
                fullWidth
                variant="outlined"
                size="medium"
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* Email - read-only, with icon */}
              <TextField
                label="Email"
                value={profile.email}
                fullWidth
                variant="outlined"
                size="medium"
                slotProps={{
                  input: {
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => setProfileOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 50, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                borderRadius: 50,
                textTransform: 'none',
                px: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                '&:hover': {
                  boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
                },
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

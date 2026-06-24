import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Link,
  Paper,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  keyframes,
} from '@mui/material';
import { z } from 'zod';
import { apiRequest } from '../utils/api';

// MUI Icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PeopleIcon from '@mui/icons-material/People';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatarUrl?: string;
  };
  accessToken: string;
  refreshToken: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (payload: z.infer<typeof loginSchema>) => {
      return apiRequest<ApiResponse<LoginResponse>>('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async res => {
      queryClient.setQueryData(['user'], res.data.user);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/dashboard', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const errors: typeof formErrors = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof typeof formErrors;
        errors[key] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    loginMutation.mutate(result.data);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fdfdfd',

        py: 4,
        animation: `${fadeIn} 0.8s ease-out`,
      }}
    >
      <Paper
        elevation={1} // subtle shadow
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          p: { xs: 3, sm: 5 },
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', // light, soft shadow
        }}
      >
        <Stack spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              mb: 1,
            }}
          >
            <PeopleIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              letterSpacing: -0.5,
            }}
          >
            Social App
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
            Welcome back! Please sign in to continue.
          </Typography>
        </Stack>

        {loginMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(loginMutation.error as Error).message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              required
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              error={!!formErrors.email}
              helperText={formErrors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
            />

            <TextField
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={!!formErrors.password}
              helperText={formErrors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
              size={isMobile ? 'small' : 'medium'}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{
                py: 1.5,
                borderRadius: 50,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                backgroundColor: theme.palette.primary.main,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.action.disabledBackground,
                },
              }}
            >
              {loginMutation.isPending ? 'Signing In…' : 'Sign In'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              variant="subtitle2"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Register
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

import React, { useState } from 'react';
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
} from '@mui/material';
import { z } from 'zod';
import { apiRequest } from '../utils/api';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const loginMutation = useMutation({
    mutationFn: async (payload: z.infer<typeof loginSchema>) => {
      return apiRequest<{
        user: unknown;
        accessToken: string;
        refreshToken: string;
      }>('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    },

    onSuccess: data => {
      queryClient.setQueryData(['user'], data.user);
      navigate('/dashboard', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('SUBMIT FIRED 🔥'); //  add this
    const result = loginSchema.safeParse(data);
    console.log(result);
    if (!result.success) {
      const errors: typeof formErrors = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof typeof formErrors;
        errors[key] = issue.message;
      });
      console.log(errors);
      setFormErrors(errors);
      return;
    }

    loginMutation.mutate(result.data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Sign In
      </Typography>

      {loginMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {(loginMutation.error as Error).message}
        </Alert>
      )}

      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          required
          fullWidth
          label="Email Address"
          name="email"
          error={!!formErrors.email}
          helperText={formErrors.email}
        />

        <TextField
          required
          fullWidth
          label="Password"
          name="password"
          type="password"
          error={!!formErrors.password}
          helperText={formErrors.password}
        />

        <Button
          style={{ borderRadius: '40px' }}
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loginMutation.isPending}
          sx={{ py: 1.5, textTransform: 'none', fontWeight: '600' }}
        >
          {loginMutation.isPending ? 'Signing In...' : 'Login'}
        </Button>
      </Stack>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            variant="subtitle2"
            underline="hover"
          >
            Register
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

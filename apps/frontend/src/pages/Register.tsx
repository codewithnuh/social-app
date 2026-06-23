import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  Alert,
} from '@mui/material';
import { z } from 'zod';
import { apiRequest } from '../utils/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const registerMutation = useMutation({
    mutationFn: async (payload: z.infer<typeof registerSchema>) => {
      return apiRequest<{ user: unknown; accessToken?: string }>(
        '/api/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
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

    const result = registerSchema.safeParse(data);

    if (!result.success) {
      const errors: FormErrors = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof FormErrors;
        errors[key] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    registerMutation.mutate(result.data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Create an Account
      </Typography>

      {registerMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {registerMutation.error.message}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          name="name"
          label="Full Name"
          fullWidth
          error={!!formErrors.name}
          helperText={formErrors.name}
        />

        <TextField
          name="email"
          label="Email"
          fullWidth
          error={!!formErrors.email}
          helperText={formErrors.email}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          error={!!formErrors.password}
          helperText={formErrors.password}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Creating...' : 'Register'}
        </Button>
      </Stack>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login">
          Already have an account?
        </Link>
      </Box>
    </Box>
  );
}

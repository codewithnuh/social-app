import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Stack, Link } from '@mui/material';
import { z } from 'zod';

// Simple schema
const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  // Single object state to track field errors cleanly
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); // Reset errors on new submit

    // Use FormData API to gather values natively without controlled state bindings
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Safely parse data using Zod
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      // Format Zod errors into a simple flat object mapping field names to messages
      const formattedErrors: typeof errors = {};
      result.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof typeof errors;
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    // If validation passes, run your API call
    setLoading(true);
    console.log('Validated payload ready for API submission:', result.data);

    // simulate network
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Sign In
      </Typography>

      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          required
          fullWidth
          label="Email Address"
          name="email" // Match schema key
          type="email"
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          required
          fullWidth
          label="Password"
          name="password" // Match schema key
          type="password"
          error={!!errors.password}
          helperText={errors.password}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ py: 1.5, textTransform: 'none', fontWeight: '600' }}
        >
          {loading ? 'Processing...' : 'Login'}
        </Button>
      </Stack>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component={RouterLink}
            to="/login"
            variant="subtitle2"
            underline="hover"
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

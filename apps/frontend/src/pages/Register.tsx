import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  FormHelperText,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { z } from 'zod';
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  profileImage?: string;
}

export default function Register() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle standard native input file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrors(prev => ({ ...prev, profileImage: undefined }));
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const textData = Object.fromEntries(formData.entries());

    // 2. Validate text values with Zod
    const textResult = registerSchema.safeParse(textData);
    const currentErrors: FormErrors = {};

    if (!textResult.success) {
      textResult.error.issues.forEach(issue => {
        const path = issue.path[0] as keyof FormErrors;
        currentErrors[path] = issue.message;
      });
    }

    // 3. Manual file field check
    if (!selectedFile) {
      currentErrors.profileImage = 'Profile image is required';
    }

    // If there are any errors (Zod or File related), halt submission
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    // 4. Everything is valid -> Build the standard payload
    setLoading(true);

    const finalPayload = new FormData();
    finalPayload.append('name', textResult.data!.name);
    finalPayload.append('email', textResult.data!.email);
    finalPayload.append('password', textResult.data!.password);
    finalPayload.append('profileImage', selectedFile as Blob);

    console.log(
      'Valid Registration payload constructed! Ready for API transmission.'
    );

    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Create an Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Join us by filling out the details below.
      </Typography>

      <Stack spacing={3}>
        <TextField
          required
          fullWidth
          label="Full Name"
          name="name"
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          required
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          required
          fullWidth
          label="Password"
          name="password"
          type="password"
          error={!!errors.password}
          helperText={errors.password}
        />

        {/* File upload wrapper element */}
        <Box>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            fullWidth
            color={errors.profileImage ? 'error' : 'primary'}
            sx={{ py: 1.2, textTransform: 'none' }}
          >
            {selectedFile ? selectedFile.name : 'Upload Profile Image'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {errors.profileImage && (
            <FormHelperText error sx={{ ml: 1.5, mt: 0.5 }}>
              {errors.profileImage}
            </FormHelperText>
          )}
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ py: 1.5, fontWeight: '600', textTransform: 'none' }}
        >
          {loading ? 'Registering...' : 'Register'}
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

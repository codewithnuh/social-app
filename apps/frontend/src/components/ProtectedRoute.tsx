import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { CircularProgress, Box } from '@mui/material';

export function ProtectedRoute() {
  const { data: user, isLoading } = useUser();

  // Show a clean global loading spinner while checking auth status
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Next.js equivalent of rendering child pages
  return <Outlet />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { CircularProgress, Box } from '@mui/material';

export function PublicRoute() {
  const { data: user, isLoading } = useUser();

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

  // If user is already logged in, skip the auth pages entirely
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

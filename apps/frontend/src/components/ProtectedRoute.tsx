import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Box, CircularProgress } from '@mui/material';

export function ProtectedRoute() {
  const location = useLocation();
  const { data: user, isLoading, refetch } = useUser();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await refetch();
      } finally {
        if (mounted) setChecking(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [refetch]);

  if (checking && isLoading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1300,
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

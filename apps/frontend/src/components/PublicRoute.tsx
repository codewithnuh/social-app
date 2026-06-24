import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export function PublicRoute() {
  const { data: user, isLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

  return <Outlet />;
}

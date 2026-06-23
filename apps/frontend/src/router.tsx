// src/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';

export const router = createBrowserRouter([
  {
    // Auth wrapper layout containing the MUI theme provider
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    // Quick fallback catch-all to redirect root URL to login page
    path: '/',
    element: <Navigate to="/login" replace />,
  },
]);

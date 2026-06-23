import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  // 1. PUBLIC ONLY ROUTES (Login / Register)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
        ],
      },
    ],
  },
  // 2. PROTECTED ROUTES (Dashboard / Dashboard Subpages)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <div>Welcome to your premium dashboard area!</div>, // Replace with your Dashboard component
      },
    ],
  },
]);

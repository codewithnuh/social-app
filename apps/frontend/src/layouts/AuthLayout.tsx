import { Outlet } from 'react-router-dom';
import { createTheme, ThemeProvider, Box, Container } from '@mui/material';

// Defining our light theme with primary blue
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
});

export default function AuthLayout() {
  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              backgroundColor: 'background.paper',
              p: { xs: 3, md: 5 },
              borderRadius: 2, // Modern non-rounded edge preference
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Outlet />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

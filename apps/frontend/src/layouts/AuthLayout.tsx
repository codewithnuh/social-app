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
            }}
          >
            <Outlet />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

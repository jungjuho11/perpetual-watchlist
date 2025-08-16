'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { Toaster } from 'react-hot-toast';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

interface MuiProviderProps {
  children: React.ReactNode;
}

export default function MuiProvider({ children }: MuiProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
          },
          success: {
            style: {
              background: '#2e7d32',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#d32f2f',
              color: '#fff',
            },
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Box } from '@mui/material';
import GameResultForm from './components/GameResultForm';
import AdminPage from './components/AdminPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Go Tournament Manager
              </Typography>
              <Button color="inherit" component={RouterLink} to="/">
                Submit Result
              </Button>
              <Button color="inherit" component={RouterLink} to="/admin">
                Admin
              </Button>
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/" element={<GameResultForm />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

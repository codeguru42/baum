import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Titlebar from './components/layout/Titlebar';
import { NotificationProvider } from './components/NotificationContext';
import AdminGamesView from './views/AdminGamesView';
import AdminLayout from './views/AdminLayout';
import AdminPlayersView from './views/AdminPlayersView';
import GameSubmissionView from './views/GameSubmissionView';

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
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ flexGrow: 1 }}>
            <Titlebar />
            <Routes>
              <Route path="/" element={<GameSubmissionView />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="games" replace />} />
                <Route path="games" element={<AdminGamesView />} />
                <Route path="players" element={<AdminPlayersView />} />
              </Route>
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;

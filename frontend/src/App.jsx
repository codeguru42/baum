import Box from '@mui/material/Box';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Titlebar from './components/layout/Titlebar';
import { NotificationProvider } from './components/NotificationContext';
import { ThemeProvider } from './components/ThemeContext';
import { TournamentDataProvider } from './components/TournamentDataContext';
import AdminGamesView from './views/AdminGamesView';
import AdminLayout from './views/AdminLayout';
import AdminPlayersView from './views/AdminPlayersView';
import GameSubmissionView from './views/GameSubmissionView';

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <TournamentDataProvider>
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
        </TournamentDataProvider>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;

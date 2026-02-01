import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './components/AdminPage';
import GameResultForm from './components/GameResultForm';
import Navigation from './components/layout/Navigation';

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
          <Navigation />
          <Routes>
            <Route path="/" element={<GameResultForm />} />
            <Route path="/admin/games" element={<AdminPage view="games" />} />
            <Route path="/admin/players" element={<AdminPage view="players" />} />
            <Route path="/admin" element={<AdminPage view="games" />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

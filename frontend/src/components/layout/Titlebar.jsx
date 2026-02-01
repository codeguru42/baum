import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '../ThemeContext';

/**
 * Title bar for the application
 * Displays the app title and theme toggle button
 */
const Titlebar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Go Tournament Manager
        </Typography>
        <IconButton color="inherit" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Titlebar;

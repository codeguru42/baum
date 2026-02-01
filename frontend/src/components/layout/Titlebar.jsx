import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

/**
 * Title bar for the application
 * Displays the app title
 */
const Titlebar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Go Tournament Manager
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Titlebar;

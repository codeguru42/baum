import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Main navigation bar for the application
 * Displays the app title and navigation links
 */
const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Go Tournament Manager
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          Submit Result
        </Button>
        <Button color="inherit" component={RouterLink} to="/admin/games">
          Admin
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

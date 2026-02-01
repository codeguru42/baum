import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';

/**
 * Layout wrapper for admin routes with shared UI and navigation
 * Uses Outlet to render child routes
 */
const AdminLayout = () => {
  const location = useLocation();
  const isGamesView = location.pathname.includes('/admin/games');
  const isPlayersView = location.pathname.includes('/admin/players');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Tournament Administration
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 2 }}>
          <Button
            variant={isGamesView ? 'contained' : 'outlined'}
            component={RouterLink}
            to="/admin/games"
            size="large"
          >
            Games
          </Button>
          <Button
            variant={isPlayersView ? 'contained' : 'outlined'}
            component={RouterLink}
            to="/admin/players"
            size="large"
          >
            Players
          </Button>
        </Box>

        <Outlet />
      </Paper>
    </Container>
  );
};

export default AdminLayout;

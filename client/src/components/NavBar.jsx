import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
                    MovieApp
                </Typography>
                <Button color="inherit" component={RouterLink} to="/search">Search</Button>
                {user ? (
                    <>
                        {user.role === 'admin' && (
                            <Button color="inherit" component={RouterLink} to="/admin/add">Add Movie</Button>
                        )}
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                )}
            </Toolbar>
        </AppBar>
    );
};
export default NavBar;

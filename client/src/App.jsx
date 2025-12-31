import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import AddMoviePage from './pages/AddMoviePage';
import { useAuth } from './context/AuthContext';
import { Container } from '@mui/material';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <>
            <NavBar />
            <Container sx={{ mt: 4 }}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/admin/add"
                        element={
                            <PrivateRoute adminOnly>
                                <AddMoviePage />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Container>
        </>
    )
}

export default App

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    Card,
    CardMedia,
    CardContent,
    Chip,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${API_URL}/movies/${id}`);
                setMovie(response.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Back to Movies
                </Button>
            </Container>
        );
    }

    if (!movie) return null;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back
            </Button>
            <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', md: 300 }, objectFit: 'cover' }}
                    image={movie.poster}
                    alt={movie.title}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                    }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography component="h1" variant="h3" gutterBottom>
                            {movie.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Chip label={`Rating: ${movie.rating}/10`} color="primary" />
                            <Chip label={`${movie.duration} min`} variant="outlined" />
                            <Chip label={new Date(movie.releaseDate).getFullYear()} variant="outlined" />
                        </Box>
                        <Typography variant="h6" gutterBottom>
                            Overview
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            {movie.description}
                        </Typography>
                    </CardContent>
                </Box>
            </Card>
        </Container>
    );
};

export default MovieDetails;

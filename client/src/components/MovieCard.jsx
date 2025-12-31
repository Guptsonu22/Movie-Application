import { Card, CardMedia, CardContent, Typography, CardActions, Button, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const MovieCard = ({ movie, refreshMovies }) => {
    const { user } = useAuth();

    const handleDelete = async () => {
        if (window.confirm('Delete this movie?')) {
            try {
                await axios.delete(`/api/movies/${movie._id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                refreshMovies();
            } catch (error) {
                alert('Error deleting movie');
            }
        }
    };

    return (
        <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {movie.posterUrl && (
                <CardMedia
                    component="img"
                    height="140"
                    image={movie.posterUrl}
                    alt={movie.title}
                />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div">
                    {movie.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {movie.description?.substring(0, 100)}...
                </Typography>
                <Chip label={`Rating: ${movie.rating}`} size="small" sx={{ mt: 1 }} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {movie.duration} mins | {new Date(movie.releaseDate).getFullYear()}
                </Typography>
            </CardContent>
            {user?.role === 'admin' && (
                <CardActions>
                    <Button size="small" color="error" onClick={handleDelete}>Delete</Button>
                </CardActions>
            )}
        </Card>
    );
};

export default MovieCard;

import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import MovieCard from '../components/MovieCard';

const SearchPage = () => {
    const [search, setSearch] = useState('');
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/movies/search?search=${search}`);
            setMovies(data.movies);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Search Movies</Typography>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    fullWidth
                    label="Search by title or description"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="contained" type="submit" disabled={loading}>
                    Search
                </Button>
            </Box>
            <Grid container spacing={3}>
                {movies.map(movie => (
                    <Grid item key={movie._id} xs={12} sm={6} md={4} lg={3}>
                        <MovieCard movie={movie} />
                    </Grid>
                ))}
                {movies.length === 0 && !loading && <Typography>No movies found</Typography>}
            </Grid>
        </Box>
    );
};
export default SearchPage;

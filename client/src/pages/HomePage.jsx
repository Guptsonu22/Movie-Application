import { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Pagination, Box, Typography } from '@mui/material';
import MovieCard from '../components/MovieCard';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('title');
    const [totalPages, setTotalPages] = useState(1);

    const fetchMovies = async () => {
        try {
            const { data } = await axios.get(`/api/movies?page=${page}&sort=${sort}`);
            setMovies(data.movies);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [page, sort]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Top Movies</Typography>
                <Box>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{ padding: '8px', fontSize: '16px', borderRadius: '4px' }}
                    >
                        <option value="title">Title (A-Z)</option>
                        <option value="-rating">Rating (High-Low)</option>
                        <option value="releaseDate">Release Date (Old-New)</option>
                        <option value="-releaseDate">Release Date (New-Old)</option>
                        <option value="duration">Duration (Short-Long)</option>
                    </select>
                </Box>
            </Box>
            <Grid container spacing={3}>
                {movies.map(movie => (
                    <Grid item key={movie._id} xs={12} sm={6} md={4} lg={3}>
                        <MovieCard movie={movie} refreshMovies={fetchMovies} />
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} />
            </Box>
        </Box>
    );
};
export default HomePage;

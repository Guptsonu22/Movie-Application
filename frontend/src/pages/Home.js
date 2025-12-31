import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  CardActions,
  Button
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchMovies();
  }, [page, sortBy, sortOrder]);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (sortBy === 'default') {
        response = await axios.get(`${API_URL}/movies`, {
          params: { page, limit: 12 },
        });
      } else {
        response = await axios.get(`${API_URL}/movies/sorted`, {
          params: {
            sortBy,
            order: sortOrder,
            page,
            limit: 12,
          },
        });
      }
      setMovies(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching movies');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === 'default') {
      setSortBy('default');
    } else {
      const [field, order] = value.split('-');
      setSortBy(field);
      setSortOrder(order);
    }
    setPage(1);
  };

  if (loading && movies.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          All Movies
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy === 'default' ? 'default' : `${sortBy}-${sortOrder}`} onChange={handleSortChange} label="Sort By">
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="name-asc">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="rating-desc">Rating (High to Low)</MenuItem>
            <MenuItem value="rating-asc">Rating (Low to High)</MenuItem>
            <MenuItem value="releaseDate-desc">Release Date (Newest)</MenuItem>
            <MenuItem value="releaseDate-asc">Release Date (Oldest)</MenuItem>
            <MenuItem value="duration-asc">Duration (Shortest)</MenuItem>
            <MenuItem value="duration-desc">Duration (Longest)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && movies.length === 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie._id}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}>
              {movie.poster ? (
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.poster}
                  alt={movie.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Image
                  </Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Tooltip title={movie.title} arrow placement="top">
                  <Typography gutterBottom variant="h6" component="h2" noWrap>
                    {movie.title}
                  </Typography>
                </Tooltip>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Rating: {movie.rating}/10
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {new Date(movie.releaseDate).getFullYear()} • {movie.duration} min
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    height: '4.5em' // Fix height to approx 3 lines
                  }}
                >
                  {movie.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/movie/${movie._id}`}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Home;


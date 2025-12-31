import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AddMovie = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: '',
    releaseDate: '',
    duration: '',
    genre: '',
    director: '',
    cast: '',
    poster: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const movieData = {
        ...formData,
        rating: parseFloat(formData.rating),
        duration: parseInt(formData.duration),
        releaseDate: new Date(formData.releaseDate).toISOString(),
        genre: formData.genre ? formData.genre.split(',').map((g) => g.trim()) : [],
        cast: formData.cast ? formData.cast.split(',').map((c) => c.trim()) : [],
      };

      await axios.post(`${API_URL}/movies`, movieData);
      setSuccess('Movie added successfully!');
      setTimeout(() => {
        navigate('/admin/manage-movies');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Movie
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            margin="normal"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Rating (0-10)"
              name="rating"
              type="number"
              value={formData.rating}
              onChange={handleChange}
              required
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
              inputProps={{ min: 1 }}
              margin="normal"
            />
          </Box>
          <TextField
            fullWidth
            label="Release Date"
            name="releaseDate"
            type="date"
            value={formData.releaseDate}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Genre (comma-separated)"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            placeholder="e.g., Drama, Action, Comedy"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Director"
            name="director"
            value={formData.director}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Cast (comma-separated)"
            name="cast"
            value={formData.cast}
            onChange={handleChange}
            placeholder="e.g., Actor 1, Actor 2, Actor 3"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Poster URL"
            name="poster"
            value={formData.poster}
            onChange={handleChange}
            margin="normal"
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ flex: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Movie'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/manage-movies')}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddMovie;


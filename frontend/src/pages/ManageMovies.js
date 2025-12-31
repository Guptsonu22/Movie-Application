import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const ManageMovies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, movie: null });
  const [editDialog, setEditDialog] = useState({ open: false, movie: null });
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/movies`, {
        params: { page: 1, limit: 100 },
      });
      setMovies(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching movies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/movies/${deleteDialog.movie._id}`);
      setMovies(movies.filter((m) => m._id !== deleteDialog.movie._id));
      setDeleteDialog({ open: false, movie: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting movie');
    }
  };

  const handleEdit = (movie) => {
    setEditFormData({
      title: movie.title,
      description: movie.description,
      rating: movie.rating,
      releaseDate: movie.releaseDate.split('T')[0],
      duration: movie.duration,
      genre: movie.genre?.join(', ') || '',
      director: movie.director || '',
      cast: movie.cast?.join(', ') || '',
      poster: movie.poster || '',
    });
    setEditDialog({ open: true, movie });
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    setError('');
    try {
      const movieData = {
        ...editFormData,
        rating: parseFloat(editFormData.rating),
        duration: parseInt(editFormData.duration),
        releaseDate: new Date(editFormData.releaseDate).toISOString(),
        genre: editFormData.genre ? editFormData.genre.split(',').map((g) => g.trim()) : [],
        cast: editFormData.cast ? editFormData.cast.split(',').map((c) => c.trim()) : [],
      };

      const response = await axios.put(`${API_URL}/movies/${editDialog.movie._id}`, movieData);
      setMovies(movies.map((m) => (m._id === editDialog.movie._id ? response.data.data : m)));
      setEditDialog({ open: false, movie: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating movie');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Movies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/add-movie')}
        >
          Add Movie
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Release Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie._id}>
                <TableCell>{movie.title}</TableCell>
                <TableCell>{movie.rating}/10</TableCell>
                <TableCell>{new Date(movie.releaseDate).getFullYear()}</TableCell>
                <TableCell>{movie.duration} min</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(movie)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => setDeleteDialog({ open: true, movie })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, movie: null })}>
        <DialogTitle>Delete Movie</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.movie?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, movie: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, movie: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Movie</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={editFormData.title || ''}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              multiline
              rows={4}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Rating"
                name="rating"
                type="number"
                value={editFormData.rating || ''}
                onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                required
              />
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={editFormData.duration || ''}
                onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Release Date"
              name="releaseDate"
              type="date"
              value={editFormData.releaseDate || ''}
              onChange={(e) => setEditFormData({ ...editFormData, releaseDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Genre (comma-separated)"
              name="genre"
              value={editFormData.genre || ''}
              onChange={(e) => setEditFormData({ ...editFormData, genre: e.target.value })}
            />
            <TextField
              fullWidth
              label="Director"
              name="director"
              value={editFormData.director || ''}
              onChange={(e) => setEditFormData({ ...editFormData, director: e.target.value })}
            />
            <TextField
              fullWidth
              label="Cast (comma-separated)"
              name="cast"
              value={editFormData.cast || ''}
              onChange={(e) => setEditFormData({ ...editFormData, cast: e.target.value })}
            />
            <TextField
              fullWidth
              label="Poster URL"
              name="poster"
              value={editFormData.poster || ''}
              onChange={(e) => setEditFormData({ ...editFormData, poster: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, movie: null })}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageMovies;


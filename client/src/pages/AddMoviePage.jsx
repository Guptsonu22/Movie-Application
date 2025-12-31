import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddMoviePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rating: '',
        duration: '',
        releaseDate: '',
        posterUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/movies', formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            alert('Movie added to queue/database successfully');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Error adding movie');
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>Add New Movie</Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Title" name="title" required onChange={handleChange} />
                <TextField label="Description" name="description" multiline rows={4} onChange={handleChange} />
                <TextField label="Rating (0-10)" name="rating" type="number" inputProps={{ min: 0, max: 10, step: 0.1 }} onChange={handleChange} />
                <TextField label="Duration (minutes)" name="duration" type="number" onChange={handleChange} />
                <TextField label="Release Date" name="releaseDate" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} />
                <TextField label="Poster URL" name="posterUrl" onChange={handleChange} />
                <Button variant="contained" type="submit">Add Movie</Button>
            </Box>
        </Paper>
    );
};
export default AddMoviePage;

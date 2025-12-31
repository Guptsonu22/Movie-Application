const Movie = require('../models/Movie');
const { addMovieToQueue } = require('../services/queueService');

const getMovies = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sort } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        let moviesQuery = Movie.find(query);

        if (sort) {
            // sort format from client: "field_asc" or "field_desc" or just "field"
            // We'll assume field names match
            const sortFields = sort.split(',').join(' ');
            moviesQuery = moviesQuery.sort(sortFields);
        }

        const movies = await moviesQuery
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Movie.countDocuments(query);

        res.json({
            movies,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addMovie = async (req, res) => {
    try {
        await addMovieToQueue(req.body);
        res.status(202).json({ message: 'Movie addition queued' });
    } catch (error) {
        console.warn('Queue failed, attempting direct insertion:', error.message);
        try {
            const movie = await Movie.create(req.body);
            res.status(201).json(movie);
        } catch (directError) {
            res.status(500).json({ message: directError.message });
        }
    }
};

const updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Movie removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMovies, addMovie, updateMovie, deleteMovie };

const Queue = require('bull');
const Movie = require('../models/Movie');

const movieQueue = new Queue('movie-insertion', {
    redis: { port: 6379, host: '127.0.0.1' }
});

movieQueue.process(async (job) => {
    console.log('Processing movie:', job.data.title);
    try {
        const movie = await Movie.create(job.data);
        console.log('Movie created:', movie.title);
        return movie;
    } catch (error) {
        console.error('Error creating movie:', error);
        throw error;
    }
});

movieQueue.on('error', (error) => {
    console.error('Queue error:', error);
});

const addMovieToQueue = (movieData) => {
    return movieQueue.add(movieData);
};

module.exports = { addMovieToQueue };

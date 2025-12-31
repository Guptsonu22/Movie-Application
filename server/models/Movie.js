const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    rating: { type: Number, default: 0 },
    duration: { type: Number }, // in minutes
    releaseDate: { type: Date },
    posterUrl: { type: String }
});

module.exports = mongoose.model('Movie', movieSchema);

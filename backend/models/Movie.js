const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    trim: true,
    index: 'text'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be negative'],
    max: [10, 'Rating cannot exceed 10']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  genre: {
    type: [String],
    default: []
  },
  director: {
    type: String,
    trim: true
  },
  cast: {
    type: [String],
    default: []
  },
  poster: {
    type: String,
    default: ''
  },
  imdbId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Indexes for better search performance
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ rating: -1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ duration: 1 });

module.exports = mongoose.model('Movie', movieSchema);


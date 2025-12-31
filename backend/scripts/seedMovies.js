const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const { addMovieToQueue, addMovieDirectly } = require('../utils/queue');

dotenv.config();

// Sample movies data (you can expand this with actual IMDb Top 250 data)
const sampleMovies = [
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    rating: 9.3,
    releaseDate: new Date('1994-09-23'),
    duration: 142,
    genre: ['Drama'],
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton']
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    rating: 9.2,
    releaseDate: new Date('1972-03-24'),
    duration: 175,
    genre: ['Crime', 'Drama'],
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan']
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    rating: 9.0,
    releaseDate: new Date('2008-07-18'),
    duration: 152,
    genre: ['Action', 'Crime', 'Drama'],
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart']
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    rating: 8.9,
    releaseDate: new Date('1994-10-14'),
    duration: 154,
    genre: ['Crime', 'Drama'],
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson']
  },
  {
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
    rating: 8.8,
    releaseDate: new Date('1994-07-06'),
    duration: 142,
    genre: ['Drama', 'Romance'],
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise']
  }
];

const seedMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/movieapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing movies (optional - comment out if you want to keep existing data)
    // await Movie.deleteMany({});
    // console.log('Cleared existing movies');

    let successCount = 0;
    let errorCount = 0;

    for (const movieData of sampleMovies) {
      try {
        // Try queue first, fallback to direct insertion
        try {
          await addMovieToQueue(movieData);
          console.log(`Queued: ${movieData.title}`);
        } catch (queueError) {
          await addMovieDirectly(movieData);
          console.log(`Inserted directly: ${movieData.title}`);
        }
        successCount++;
      } catch (error) {
        console.error(`Error inserting ${movieData.title}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`Successfully processed: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedMovies();


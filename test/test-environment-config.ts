const { connectToDatabase } = require('../../database/database-connect');
const { MongoMemoryServer } = require('mongodb-memory-server');
import mongoose from 'mongoose';

/* RUN BEFORE ALL TESTS (just once) */

const mongoServer = new MongoMemoryServer(); // in memory server

mongoServer.getUri().then((mongoUri) => {
    mongoose.connect(mongoUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
  });

// when the in memory database starts
mongoServer.getConnectionString().then((connectionString) => {
    // connect to database
    connectToDatabase(connectionString);
});

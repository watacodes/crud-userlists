// Imports

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 1515;

// Database connection

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', err => console.log(err));
db.once('open', () => console.log('Securely connected to the database!'));


// Middlewares

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: 'My secret key',
  saveUninitialized: true,
  resave: false,
  })
);

app.use(express.static('uploads'));

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Set template engine

app.set('view engine', 'ejs');

// Route prefix

app.use('', require('./routes/routes'));

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));


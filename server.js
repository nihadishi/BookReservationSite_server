const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const requestLogger = require('./requestLogger');
const logger = require('./logger');
const cors = require("cors");

const app = express();
const port = 2021;

app.use(
    cors({
      credentials: true,
      origin: 'http://localhost:2020',
    })
  );
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);
// Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/user', userRoutes);
app.use('/reservations', reservationRoutes);
app.use('/admin', adminRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Database connection module (to be created)

const router = express.Router();
const JWT_SECRET = 'nihad.tech';

router.post('/register', async (req, res) => {
  const { name, email, password,phone,address } = req.body;

  db.query('SELECT * FROM Customer WHERE Email = ?', [email], async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO Customer (Name, Password, Email, Phone, Address) VALUES (?, ?, ?,?,?)';
    db.query(sql, [name, hashedPassword, email,phone,address], (err) => {
      
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ message: 'User registered successfully' });
      
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  
  const sql = 'SELECT * FROM Customer WHERE Email = ?';
  db.query(sql, [email], async (err, results) => {
    console.log(results);
    
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    console.log(user);
    
    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.CustomerID, name:user.Name, email: user.Email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  });
});
router.post('/checkToken', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: 'Unauthorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({ valid: true, decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: 'Invalid token', error: error.message });
  }
});
module.exports = router;

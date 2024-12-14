const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = 'nihad.tech';

// Admin Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const checkSql = 'SELECT * FROM customer WHERE Email = ? AND Role = "ADMIN"';
    db.query(checkSql, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      if (results.length > 0) {
        return res.status(400).json({ message: 'Admin user already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = `
        INSERT INTO customer (Name, Role, Password, Email, Phone, Address)
        VALUES (?, 'ADMIN', ?, ?, ?, ?)
      `;
      db.query(insertSql, [name, hashedPassword, email, phone || '', address || ''], (err) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(201).json({ message: 'Admin user created successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM customer WHERE Email = ? AND Role = "ADMIN"';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const admin = results[0];
    const isPasswordValid = await bcrypt.compare(password, admin.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: admin.CustomerID, email: admin.Email, role: admin.Role }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({ message: 'Login successful', token });
  });
});

module.exports = router;

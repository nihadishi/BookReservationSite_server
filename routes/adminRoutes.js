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


router.get('/data/books', (req, res) => {
    const sql = 'SELECT * FROM Book';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json(results);
    });
  });
  
  // Add a new book
  router.post('/data/books/add', (req, res) => {
    const { Title, Year, Price, ISBN, Category } = req.body;
    const sql = 'INSERT INTO Book (Title, Year, Price, ISBN, Category) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [Title, Year, Price, ISBN, Category], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ BookID: results.insertId, Title, Year, Price, ISBN, Category });
    });
  });
  
  // Edit an existing book
  router.put('/data/books/edit/:id', (req, res) => {
    const { id } = req.params;
    const { Title, Year, Price, ISBN, Category } = req.body;
    const sql = 'UPDATE Book SET Title = ?, Year = ?, Price = ?, ISBN = ?, Category = ? WHERE BookID = ?';
    db.query(sql, [Title, Year, Price, ISBN, Category, id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Book updated successfully' });
    });
  });
  
  // Delete a book
  router.delete('/data/books/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Book WHERE BookID = ?';
    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Book deleted successfully' });
    });
  });

  router.get('/data/authors', (req, res) => {
    const sql = 'SELECT * FROM Author';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json(results);
    });
  });
  
  // Add a new author
  router.post('/data/authors/add', (req, res) => {
    const { Name, Address, URL } = req.body;
    const sql = 'INSERT INTO Author (Name, Address, URL) VALUES (?, ?, ?)';
    db.query(sql, [Name, Address, URL], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ AuthorID: results.insertId, Name, Address, URL });
    });
  });
  
  // Edit an existing author
  router.put('/data/authors/edit/:id', (req, res) => {
    const { id } = req.params;
    const { Name, Address, URL } = req.body;
    const sql = 'UPDATE Author SET Name = ?, Address = ?, URL = ? WHERE AuthorID = ?';
    db.query(sql, [Name, Address, URL, id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Author updated successfully' });
    });
  });
  
  // Delete an author
  router.delete('/data/authors/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Author WHERE AuthorID = ?';
    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Author deleted successfully' });
    });
  });


  router.get('/data/awards', (req, res) => {
    const sql = 'SELECT * FROM Award';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json(results);
    });
  });
  
  // Add a new award
  router.post('/data/awards/add', (req, res) => {
    const { Name, Year } = req.body;
    const sql = 'INSERT INTO Award (Name, Year) VALUES (?, ?)';
    db.query(sql, [Name, Year], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ AwardID: results.insertId, Name, Year });
    });
  });
  
  // Edit an existing award
  router.put('/data/awards/edit/:id', (req, res) => {
    const { id } = req.params;
    const { Name, Year } = req.body;
    const sql = 'UPDATE Award SET Name = ?, Year = ? WHERE AwardID = ?';
    db.query(sql, [Name, Year, id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Award updated successfully' });
    });
  });
  
  // Delete an award
  router.delete('/data/awards/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Award WHERE AwardID = ?';
    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Award deleted successfully' });
    });
  });
module.exports = router;

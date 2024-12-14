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


  router.get('/data/warehouses', (req, res) => {
    const sql = 'SELECT * FROM Warehouse';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json(results);
    });
  });
  
  // Add a new warehouse
  router.post('/data/warehouses/add', (req, res) => {
    const { Address, Phone, Code } = req.body;
    const sql = 'INSERT INTO Warehouse (Address, Phone, Code) VALUES (?, ?, ?)';
    db.query(sql, [Address, Phone, Code], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ WarehouseID: results.insertId, Address, Phone, Code });
    });
  });
  
  // Edit an existing warehouse
  router.put('/data/warehouses/edit/:id', (req, res) => {
    const { id } = req.params;
    const { Address, Phone, Code } = req.body;
    const sql = 'UPDATE Warehouse SET Address = ?, Phone = ?, Code = ? WHERE WarehouseID = ?';
    db.query(sql, [Address, Phone, Code, id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Warehouse updated successfully' });
    });
  });
  
  // Delete a warehouse
  router.delete('/data/warehouses/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Warehouse WHERE WarehouseID = ?';
    db.query(sql, [id], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Warehouse deleted successfully' });
    });
  });
  


  router.get('/data/contains', (req, res) => {
    const sql = 'SELECT * FROM Contains';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json(results);
    });
  });
  
  // Add a new contains entry
  router.post('/data/contains/add', (req, res) => {
    const { BasketID, BookID, Number } = req.body;
    const sql = 'INSERT INTO Contains (BasketID, BookID, Number) VALUES (?, ?, ?)';
    db.query(sql, [BasketID, BookID, Number], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ BasketID, BookID, Number });
    });
  });
  
  // Edit an existing contains entry
  router.put('/data/contains/edit/:basketID/:bookID', (req, res) => {
    const { basketID, bookID } = req.params;
    const { Number } = req.body;
    const sql = 'UPDATE Contains SET Number = ? WHERE BasketID = ? AND BookID = ?';
    db.query(sql, [Number, basketID, bookID], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Item updated successfully' });
    });
  });
  
  // Delete a contains entry
  router.delete('/data/contains/delete/:basketID/:bookID', (req, res) => {
    const { basketID, bookID } = req.params;
    const sql = 'DELETE FROM Contains WHERE BasketID = ? AND BookID = ?';
    db.query(sql, [basketID, bookID], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Item deleted successfully' });
    });
  });


  router.get('/data/inventories', (req, res) => {
    const sql = `
      SELECT 
        i.BookID, i.WarehouseID, i.Number,
        b.Title AS BookTitle, w.Address AS WarehouseAddress
      FROM Inventory i
      LEFT JOIN Book b ON i.BookID = b.BookID
      LEFT JOIN Warehouse w ON i.WarehouseID = w.WarehouseID
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json(results);
    });
  });
  
  // Add inventory
  router.post('/data/inventories/add', (req, res) => {
    const { BookID, WarehouseID, Number } = req.body;
    if (!BookID || !WarehouseID || Number === undefined) {
      return res.status(400).json({ message: 'BookID, WarehouseID, and Number are required' });
    }
  
    const sql = 'INSERT INTO Inventory (BookID, WarehouseID, Number) VALUES (?, ?, ?)';
    db.query(sql, [BookID, WarehouseID, Number], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(201).json({ BookID, WarehouseID, Number });
    });
  });
  
  // Edit inventory
  router.put('/data/inventories/edit/:bookID/:warehouseID', (req, res) => {
    const { bookID, warehouseID } = req.params;
    const { Number } = req.body;
  
    const sql = 'UPDATE Inventory SET Number = ? WHERE BookID = ? AND WarehouseID = ?';
    db.query(sql, [Number, bookID, warehouseID], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Inventory updated successfully' });
    });
  });
  
  // Delete inventory
  router.delete('/data/inventories/delete/:bookID/:warehouseID', (req, res) => {
    const { bookID, warehouseID } = req.params;
  
    const sql = 'DELETE FROM Inventory WHERE BookID = ? AND WarehouseID = ?';
    db.query(sql, [bookID, warehouseID], (err) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      res.status(200).json({ message: 'Inventory deleted successfully' });
    });
  });
  
module.exports = router;

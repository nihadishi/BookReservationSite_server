const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = 'nihad.tech';
// Get All Books
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM Book';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
});
router.get('/search', (req, res) => {
  const { query } = req.query;
  console.log(query);
  
  if (!query) return res.status(400).json({ message: 'Query is required' });

  const sql = `
    SELECT 
      b.BookID, b.Title, b.Category, b.Price, 
      a.Name AS AuthorName, aw.Name AS AwardName
    FROM 
      Book b
    LEFT JOIN 
      Written_by wb ON b.BookID = wb.BookID
    LEFT JOIN 
      Author a ON wb.AuthorID = a.AuthorID
    LEFT JOIN 
      Awarded_to at ON b.BookID = at.BookID
    LEFT JOIN 
      Award aw ON at.AwardID = aw.AwardID
    WHERE 
      b.Title LIKE ? OR 
      a.Name LIKE ? OR 
      aw.Name LIKE ?
  `;

  const searchQuery = `%${query}%`;
  db.query(sql, [searchQuery, searchQuery, searchQuery], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
});

router.get('/book/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      b.BookID, b.Title, b.Category, b.Price, b.Year, b.ISBN,
      a.Name AS AuthorName, a.Address AS AuthorAddress, a.URL AS AuthorURL,
      aw.Name AS AwardName, aw.Year AS AwardYear,
      w.WarehouseID, w.Address AS WarehouseAddress, i.Number AS Stock,
      c.BasketID, c.Number AS BasketQuantity,
      sb.CustomerID, sb.OrderDate AS BasketOrderDate
    FROM 
      Book b
    LEFT JOIN 
      Written_by wb ON b.BookID = wb.BookID
    LEFT JOIN 
      Author a ON wb.AuthorID = a.AuthorID
    LEFT JOIN 
      Awarded_to at ON b.BookID = at.BookID
    LEFT JOIN 
      Award aw ON at.AwardID = aw.AwardID
    LEFT JOIN 
      Inventory i ON b.BookID = i.BookID
    LEFT JOIN 
      Warehouse w ON i.WarehouseID = w.WarehouseID
    LEFT JOIN 
      Contains c ON b.BookID = c.BookID
    LEFT JOIN 
      ShoppingBasket sb ON c.BasketID = sb.BasketID
    WHERE 
      b.BookID = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Book not2 found' });

    // Process results to structure the response
    const bookDetails = {
      BookID: results[0].BookID,
      Title: results[0].Title,
      Category: results[0].Category,
      Price: results[0].Price,
      Year: results[0].Year,
      ISBN: results[0].ISBN,
      Author: {
        Name: results[0].AuthorName,
        Address: results[0].AuthorAddress,
        URL: results[0].AuthorURL,
      },
      Awards: results
        .filter((row) => row.AwardName)
        .map((row) => ({
          Name: row.AwardName,
          Year: row.AwardYear,
        })),
      Warehouses: results
        .filter((row) => row.WarehouseID)
        .map((row) => ({
          WarehouseID: row.WarehouseID,
          Address: row.WarehouseAddress,
          Stock: row.Stock,
        })),
      Baskets: results
        .filter((row) => row.BasketID)
        .map((row) => ({
          BasketID: row.BasketID,
          CustomerID: row.CustomerID,
          OrderDate: row.BasketOrderDate,
          Quantity: row.BasketQuantity,
        })),
    };

    res.status(200).json(bookDetails);
  });
});

router.post('/basket/add', (req, res) => {
  const { BookID, Count } = req.body;

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const decoded = jwt.verify(token, JWT_SECRET);
  const CustomerID = decoded.id;

  if (!BookID || !Count) {
    return res.status(400).json({ message: 'BookID and Count are required' });
  }

  // Step 1: Find or Create a Basket
  const sqlFindBasket = `
    SELECT BasketID 
    FROM ShoppingBasket 
    WHERE CustomerID = ? 
    ORDER BY OrderDate DESC 
    LIMIT 1
  `;

  db.query(sqlFindBasket, [CustomerID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) {
      // Step 2: Create a new basket if none exists
      const sqlCreateBasket = `
        INSERT INTO ShoppingBasket (CustomerID, OrderDate)
        VALUES (?, NOW())
      `;

      db.query(sqlCreateBasket, [CustomerID], (err, createResults) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        const newBasketID = createResults.insertId;
        addToBasket(newBasketID);
      });
    } else {
      const existingBasketID = results[0].BasketID;
      addToBasket(existingBasketID);
    }
  });

  // Function to Add Book to Basket
  const addToBasket = (BasketID) => {
    db.beginTransaction((transactionErr) => {
      if (transactionErr) return res.status(500).json({ message: 'Transaction error', error: transactionErr });

      const sqlAddToBasket = `
        INSERT INTO Contains (BasketID, BookID, Number)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Number = Number + VALUES(Number)
      `;

      // Step 3: Add to Basket
      db.query(sqlAddToBasket, [BasketID, BookID, Count], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Database error', error: err });
          });
        }

        // Step 4: Subtract Count from Inventory
        const sqlUpdateInventory = `
          UPDATE Inventory
          SET Number = Number - ?
          WHERE BookID = ? AND Number >= ?
        `;

        db.query(sqlUpdateInventory, [Count, BookID, Count], (updateErr, results) => {
          if (updateErr || results.affectedRows === 0) {
            return db.rollback(() => {
              res.status(400).json({ message: 'Insufficient stock or database error', error: updateErr });
            });
          }

          // Commit the transaction if successful
          db.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                res.status(500).json({ message: 'Transaction commit error', error: commitErr });
              });
            }

            res.status(200).json({ message: 'Book added to basket, stock updated successfully' });
          });
        });
      });
    });
  };
});

router.get('/baskets', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  const decoded = jwt.verify(token, JWT_SECRET);
  const CustomerID = decoded.id;
  console.log(CustomerID);
  

  const sql = `
    SELECT 
      sb.BasketID, sb.OrderDate,
      c.BookID, c.Number AS Quantity,
      b.Title, b.Price, b.Category, b.ISBN
    FROM 
      ShoppingBasket sb
    LEFT JOIN 
      Contains c ON sb.BasketID = c.BasketID
    LEFT JOIN 
      Book b ON c.BookID = b.BookID
    WHERE 
      sb.CustomerID = ?
    ORDER BY 
      sb.OrderDate DESC
  `;

  db.query(sql, [CustomerID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No baskets found for the user' });
    }

    const baskets = results.reduce((acc, row) => {
      const basketID = row.BasketID;
      if (!acc[basketID]) {
        acc[basketID] = {
          BasketID: basketID,
          OrderDate: row.OrderDate,
          Books: [],
        };
      }
      
      if (row.BookID) {
        acc[basketID].Books.push({
          BookID: row.BookID,
          Title: row.Title,
          Price: row.Price,
          Category: row.Category,
          ISBN: row.ISBN,
          Quantity: row.Quantity,
        });
      }

      return acc;
    }, {});
    console.log(baskets);
    
    res.status(200).json(Object.values(baskets));
  });
});


module.exports = router;

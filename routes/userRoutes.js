const express = require('express');
const db = require('../db'); // Database connection module

const router = express.Router();

// Get User Baskets
router.get('/baskets/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT sb.BasketID, sb.OrderDate, c.BookID, b.Title, c.Quantity
    FROM ShoppingBasket sb
    JOIN Contains c ON sb.BasketID = c.BasketID
    JOIN Book b ON c.BookID = b.BookID
    WHERE sb.CustomerID = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
});

// Get User Reservations
router.get('/reservations/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT r.ReservationID, r.ReservationDate, r.PickupTime, sb.BasketID
    FROM Reservation r
    JOIN ShoppingBasket sb ON r.BasketID = sb.BasketID
    WHERE r.CustomerID = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.status(200).json(results);
  });
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db"); // Database connection module (to be created)

const router = express.Router();
const JWT_SECRET = "nihad.tech";

router.post("/create", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, JWT_SECRET);
  const CustomerID = decoded.id;

  const { BasketID, ReservationDate, PickupTime } = req.body;

  if (!BasketID || !ReservationDate || !PickupTime) {
    return res
      .status(400)
      .json({
        message: "BasketID, ReservationDate, and PickupTime are required",
      });
  }

  // Start a transaction to ensure both operations succeed or fail together
  db.beginTransaction((transactionErr) => {
    if (transactionErr)
      return res
        .status(500)
        .json({ message: "Transaction error", error: transactionErr });

    // Step 1: Insert reservations for all books in the basket
    const sqlCreateReservation = `
        INSERT INTO Reservation (BookID, CustomerID, ReservationDate, PickupTime, Status)
        SELECT c.BookID, ?, ?, ?, 'Pending'
        FROM Contains c
        WHERE c.BasketID = ?
      `;

    db.query(
      sqlCreateReservation,
      [CustomerID, ReservationDate, PickupTime, BasketID],
      (reservationErr, reservationResults) => {
        if (reservationErr) {
          return db.rollback(() => {
            res
              .status(500)
              .json({ message: "Database error", error: reservationErr });
          });
        }

        // Step 2: Delete the basket after reservation creation
        const sqlDeleteBasket = `
            DELETE FROM ShoppingBasket
            WHERE BasketID = ?
          `;

        db.query(sqlDeleteBasket, [BasketID], (deleteErr, deleteResults) => {
          if (deleteErr) {
            return db.rollback(() => {
              res
                .status(500)
                .json({
                  message: "Database error while deleting basket",
                  error: deleteErr,
                });
            });
          }

          // Commit transaction if both operations succeed
          db.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                res
                  .status(500)
                  .json({
                    message: "Transaction commit error",
                    error: commitErr,
                  });
              });
            }

            res.status(200).json({
              message: "Reservation created successfully and basket deleted",
              affectedRows: reservationResults.affectedRows,
            });
          });
        });
      }
    );
  });
});

router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, JWT_SECRET);
  const CustomerID = decoded.id;

  const sql = `
      SELECT 
        r.ReservationID, r.ReservationDate, r.PickupTime, r.Status,
        b.Title AS BookTitle, b.Price, b.ISBN, b.Category
      FROM 
        Reservation r
      LEFT JOIN 
        Book b ON r.BookID = b.BookID
      WHERE 
        r.CustomerID = ?
      ORDER BY 
        r.ReservationDate DESC, r.PickupTime DESC
    `;

  db.query(sql, [CustomerID], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    res.status(200).json(results);
  });
});

// Update Reservation Status (Pending, Cancel)
router.put("/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, JWT_SECRET);

  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ message: "Status is required" });

  const sql = `
      UPDATE Reservation
      SET Status = ?
      WHERE ReservationID = ?
    `;

  db.query(sql, [status, id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res
      .status(200)
      .json({ message: "Reservation status updated successfully" });
  });
});

module.exports = router;

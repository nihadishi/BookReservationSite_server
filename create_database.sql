CREATE DATABASE STOREBOOK;
USE STOREBOOK;

CREATE TABLE Author (
    AuthorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL UNIQUE,
    Address VARCHAR(255),
    URL VARCHAR(255)
);

CREATE TABLE Award (
    AwardID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Year INT
);

CREATE TABLE Book (
    BookID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Year INT,
    Price DECIMAL(10, 2) CHECK (Price >= 0),
    ISBN VARCHAR(20) UNIQUE,
    Category VARCHAR(255)
);

CREATE TABLE Written_by (
    AuthorID INT,
    BookID INT,
    FOREIGN KEY (AuthorID) REFERENCES Author(AuthorID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES Book(BookID) ON DELETE CASCADE,
    PRIMARY KEY (AuthorID, BookID)
);

CREATE TABLE Awarded_to (
    AwardID INT,
    BookID INT,
    FOREIGN KEY (AwardID) REFERENCES Award(AwardID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES Book(BookID) ON DELETE CASCADE,
    PRIMARY KEY (AwardID, BookID)
);

CREATE TABLE Received_by (
    AwardID INT,
    AuthorID INT,
    FOREIGN KEY (AwardID) REFERENCES Award(AwardID) ON DELETE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES Author(AuthorID) ON DELETE CASCADE,
    PRIMARY KEY (AwardID, AuthorID)
);

CREATE TABLE Customer (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Role VARCHAR(255) NOT NULL DEFAULT 'CUSTOMER',
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE CHECK (Email LIKE '%_@__%.__%'),
    Phone VARCHAR(15),
    Address VARCHAR(255)
);

CREATE TABLE Warehouse (
    WarehouseID INT AUTO_INCREMENT PRIMARY KEY,
    Address VARCHAR(255),
    Phone VARCHAR(15),
    Code VARCHAR(50) UNIQUE
);

CREATE TABLE Inventory (
    BookID INT,
    WarehouseID INT,
    Number INT DEFAULT 0 CHECK (Number >= 0),
    FOREIGN KEY (BookID) REFERENCES Book(BookID) ON DELETE CASCADE,
    FOREIGN KEY (WarehouseID) REFERENCES Warehouse(WarehouseID) ON DELETE CASCADE,
    PRIMARY KEY (BookID, WarehouseID)
);

CREATE TABLE ShoppingBasket (
     BasketID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    OrderDate DATE NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
);

CREATE TABLE Basket_of (
    BasketID INT,
    CustomerID INT,
    FOREIGN KEY (BasketID) REFERENCES ShoppingBasket(BasketID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
    PRIMARY KEY (BasketID, CustomerID)
);

CREATE TABLE Contains (
    BasketID INT,
    BookID INT,
    Number INT CHECK (Number >= 0),
    FOREIGN KEY (BasketID) REFERENCES ShoppingBasket(BasketID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES Book(BookID) ON DELETE CASCADE,
    PRIMARY KEY (BasketID, BookID)
);

CREATE TABLE Reservation (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    BookID INT,
    CustomerID INT,
    ReservationDate DATE,
    PickupTime TIME,
    Status ENUM('Pending', 'Confirmed', 'Cancelled','Refunded') DEFAULT 'Pending',
    FOREIGN KEY (BookID) REFERENCES Book(BookID) ON DELETE CASCADE,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
);

CREATE INDEX idx_customer_email ON Customer (Email);
CREATE INDEX idx_book_isbn ON Book (ISBN);
CREATE INDEX idx_warehouse_code ON Warehouse (Code);

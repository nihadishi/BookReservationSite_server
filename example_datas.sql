USE STOREBOOK;
-- Insert Authors
INSERT INTO Author (Name, Address, URL)
VALUES 
('Anna White', 'Cambridge, UK', 'https://annawhite.com'),
('Brandon Green', 'Denver, USA', 'https://brandongreen.com'),
('Clara Red', 'Paris, France', NULL),
('David Black', 'Toronto, Canada', NULL),
('Elena Blue', 'Madrid, Spain', 'https://elenablue.com');

-- Insert Awards
INSERT INTO Award (Name, Year)
VALUES
('Fiction Excellence', 2010),
('Literary Star', 2015),
('World Writers Award', 2020);

-- Insert Books
INSERT INTO Book (Title, Year, Price, ISBN, Category)
VALUES 
('The Silent River', 2005, 15.99, '1234567890', 'Thriller'),
('Dreams of the Sky', 2012, 22.50, '0987654321', 'Adventure'),
('Echoes in the Dark', 2018, 18.99, '1122334455', 'Horror'),
('The Last Horizon', 2021, 25.00, '5544332211', 'Science Fiction'),
('Whispers of Time', 2010, 19.99, '6677889900', 'Fantasy');

INSERT INTO Written_by (AuthorID, BookID)
VALUES 
(1, 1), 
(2, 2),
(3, 3), 
(4, 4), 
(5, 5); 

INSERT INTO Customer (Name, Password, Email, Phone, Address)
VALUES 
('Nihad Maharramov', '1234', 'nihadishi@gmail.com', '555-1000', '101 Maple Street'),
('Daisy Sun', '12334', 'daisy@mail.com', '555-2000', '202 Oak Avenue'),
('Liam Cloud', '12334', 'liam@mail.com', '555-3000', '303 Pine Road'),
('Nihad Maharramov','$2b$10$E/XpYSDiPOUtBj1SoK.zYuLaKhD8ayvt/qWFK7.TjdgGHx1prD/oG','nihad@gmail.com','123-4567','Azerbaijan'),
('Nihad Admin','$2b$10$3WIW9FMDZIEfw/hBpWLwaOJk.NNyVa4.cai.BSoiqh94kbairEO6G','nihad@admin.com','000-0000','Admin Location'); 
-- all password is 12345( admin too (Nihad Admin & Nihad))

INSERT INTO Warehouse (Address, Phone, Code)
VALUES 
('Central Warehouse', '555-1111', 'CW001'),
('North Warehouse', '555-2222', 'NW001');

INSERT INTO Inventory (BookID, WarehouseID, Number)
VALUES 
(1, 1, 30),
(2, 1, 20),
(3, 2, 25),
(4, 2, 15),
(5, 1, 40);

-- Insert Shopping Baskets
INSERT INTO ShoppingBasket (CustomerID, OrderDate)
VALUES 
(1, '2024-11-01'),
(2, '2024-11-02'),
(3, '2024-11-03');

-- Insert Contains (Books in Shopping Baskets)
INSERT INTO Contains (BasketID, BookID, Number)
VALUES 
(1, 1, 2), -- "The Silent River" in John Stone's basket
(1, 3, 1), -- "Echoes in the Dark" in John Stone's basket
(2, 2, 1), -- "Dreams of the Sky" in Daisy Sun's basket
(3, 4, 1); -- "The Last Horizon" in Liam Cloud's basket

-- Insert Reservations
INSERT INTO Reservation (BookID, CustomerID, ReservationDate, PickupTime, Status)
VALUES 
(1, 1, '2024-12-05', '10:00:00', 'Pending'), -- John Stone reserved "The Silent River"
(3, 2, '2024-12-06', '15:00:00', 'Confirmed'); -- Daisy Sun reserved "Echoes in the Dark"

-- Insert Awards Linked to Books
INSERT INTO Awarded_to (AwardID, BookID)
VALUES 
(1, 1), -- "The Silent River" won Fiction Excellence
(2, 2), -- "Dreams of the Sky" won Literary Star
(3, 5); -- "Whispers of Time" won World Writers Award

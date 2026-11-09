-- יצירת טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('User', 'Admin') DEFAULT 'User'
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_hash CHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_password_reset_user_id (user_id),
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (first_name, last_name, email, password, role)
VALUES (
    'TripGenius',
    'Admin',
    'admin@tripgenius.com',
    '$2b$10$J0jBB6dSEjtG.xRNgrs6p.sehmb8ecpIYWyHuPN/t2Z2kFhyFDcIe',
    'Admin'
);

-- יצירת טבלת חופשות
CREATE TABLE IF NOT EXISTS vacations (
    vacation_id INT AUTO_INCREMENT PRIMARY KEY,
    destination VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_name VARCHAR(255) NOT NULL
);

-- יצירת טבלת לייקים
CREATE TABLE IF NOT EXISTS likes (
    user_id INT NOT NULL,
    vacation_id INT NOT NULL,
    PRIMARY KEY (user_id, vacation_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (vacation_id) REFERENCES vacations(vacation_id) ON DELETE CASCADE
);

-- הזנת 12 חופשות ראשוניות
INSERT INTO vacations (destination, description, start_date, end_date, price, image_name) VALUES
('Rome', 'Explore the historic Roman Forum, Colosseum, and vibrant street cafes.', '2026-11-01', '2026-11-10', 1250.00, 'rome.jpg'),
('Rhodes', 'Relax by the crystal clear sea and wander through the medieval Old Town.', '2026-11-05', '2026-11-14', 680.00, 'rhodes.jpg'),
('Tokyo', 'Discover ancient shrines nestled between futuristic skyscrapers and food markets.', '2026-11-12', '2026-11-22', 2100.00, 'tokyo.jpg'),
('Paris', 'Stroll along the Seine, visit world-class museums, and enjoy French patisserie.', '2026-11-18', '2026-11-26', 1450.00, 'paris.jpg'),
('New York', 'Experience Broadway shows, Central Park autumn walks, and iconic skyline views.', '2026-11-25', '2026-12-04', 1850.00, 'newyork.jpg'),
('Barcelona', 'Marvel at Gaudi architecture and relax along vibrant Mediterranean beachfronts.', '2026-12-01', '2026-12-09', 920.00, 'barcelona.jpg'),
('London', 'Visit historic palaces, iconic bridges, and world-renowned theater productions.', '2026-12-05', '2026-12-14', 1350.00, 'london.jpg'),
('Amsterdam', 'Cruise historic canals and tour world-class art collections by bicycle.', '2026-12-10', '2026-12-18', 890.00, 'amsterdam.jpg'),
('Prague', 'Cross the scenic Charles Bridge and wander the cobblestones of the Old Town.', '2026-12-15', '2026-12-23', 640.00, 'prague.jpg'),
('Vienna', 'Enjoy imperial palaces, classical concert halls, and traditional coffeehouses.', '2026-12-20', '2026-12-28', 980.00, 'vienna.jpg'),
('Athens', 'Climb up to the Acropolis and immerse yourself in ancient Mediterranean history.', '2027-01-05', '2027-01-14', 710.00, 'athens.jpg'),
('Budapest', 'Relax in famous thermal bath houses and admire architecture along the Danube.', '2027-01-12', '2027-01-20', 580.00, 'budapest.jpg');
-- יצירת טבלת משתמשים
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('User', 'Admin') DEFAULT 'User'
);

INSERT IGNORE INTO users (first_name, last_name, email, password, role)
VALUES (
    'TripSpark',
    'Admin',
    'admin@tripspark.com',
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
('רומא', 'גלו את ההיסטוריה של הפורום הרומי והקולוסיאום, ותיהנו מבתי הקפה התוססים ברחובות.', '2026-11-01', '2026-11-10', 1250.00, 'rome.jpg'),
('רודוס', 'הירגעו לצד הים הצלול וטיילו בעיר העתיקה מימי הביניים.', '2026-11-05', '2026-11-14', 680.00, 'rhodes.jpg'),
('טוקיו', 'גלו מקדשים עתיקים בין גורדי שחקים עתידניים ושווקי אוכל.', '2026-11-12', '2026-11-22', 2100.00, 'tokyo.jpg'),
('פריז', 'טיילו לאורך הסן, בקרו במוזיאונים מובילים ותיהנו ממאפים צרפתיים.', '2026-11-18', '2026-11-26', 1450.00, 'paris.jpg'),
('ניו יורק', 'חוו מופעי ברודוויי, טיולי סתיו בסנטרל פארק ונופים אייקוניים של קו הרקיע.', '2026-11-25', '2026-12-04', 1850.00, 'newyork.jpg'),
('ברצלונה', 'התרשמו מהאדריכלות של גאודי והירגעו לאורך חופי הים התיכון התוססים.', '2026-12-01', '2026-12-09', 920.00, 'barcelona.jpg'),
('לונדון', 'בקרו בארמונות היסטוריים, בגשרים אייקוניים ובהצגות תיאטרון ידועות בעולם.', '2026-12-05', '2026-12-14', 1350.00, 'london.jpg'),
('אמסטרדם', 'שוטו בתעלות ההיסטוריות וסיירו באוספי אמנות מובילים באופניים.', '2026-12-10', '2026-12-18', 890.00, 'amsterdam.jpg'),
('פראג', 'חצו את גשר קארל הציורי וטיילו ברחובות המרוצפים של העיר העתיקה.', '2026-12-15', '2026-12-23', 640.00, 'prague.jpg'),
('וינה', 'תיהנו מארמונות קיסריים, מאולמות קונצרטים קלאסיים ומבתי קפה מסורתיים.', '2026-12-20', '2026-12-28', 980.00, 'vienna.jpg'),
('אתונה', 'טפסו אל האקרופוליס ושקעו בהיסטוריה העתיקה של אגן הים התיכון.', '2027-01-05', '2027-01-14', 710.00, 'athens.jpg'),
('בודפשט', 'הירגעו במרחצאות התרמיים המפורסמים והתפעלו מהאדריכלות לאורך הדנובה.', '2027-01-12', '2027-01-20', 580.00, 'budapest.jpg');
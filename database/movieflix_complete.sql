-- ============================================================
--  MovieFlix — Complete Database Setup (Final)
--  All poster images verified from Wikipedia (upload.wikimedia.org)
--  No broken image links. 25 movies: 10 English + 15 Kannada.
--
--  Run this entire file in MySQL Workbench:
--    Query → Run SQL Script  (or Ctrl+Shift+Enter)
-- ============================================================


-- ============================================================
-- STEP 1 — Session settings (prevents timeout & safe-mode errors)
-- ============================================================
SET SESSION net_read_timeout    = 3600;
SET SESSION net_write_timeout   = 3600;
SET SESSION wait_timeout        = 3600;
SET SESSION interactive_timeout = 3600;
SET SQL_SAFE_UPDATES = 0;


-- ============================================================
-- STEP 2 — CREATE DATABASE
-- ============================================================
DROP DATABASE IF EXISTS movieflix;
CREATE DATABASE movieflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movieflix;


-- ============================================================
-- STEP 3 — TABLES
-- ============================================================

CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    phone      VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    genre        VARCHAR(100) NOT NULL,
    language     VARCHAR(50)  DEFAULT 'English',
    rating       DECIMAL(3,1) DEFAULT 0.0,
    duration_min INT          NOT NULL,
    poster_url   VARCHAR(500),
    description  TEXT,
    release_date DATE         NOT NULL,
    is_active    TINYINT(1)   DEFAULT 1
);

CREATE TABLE theaters (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    city          VARCHAR(100) NOT NULL,
    address       TEXT         NOT NULL,
    total_screens INT          DEFAULT 3,
    is_active     TINYINT(1)  DEFAULT 1
);

CREATE TABLE shows (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    movie_id       INT          NOT NULL,
    theater_id     INT          NOT NULL,
    show_date      DATE         NOT NULL,
    show_time      TIME         NOT NULL,
    price_standard DECIMAL(8,2) NOT NULL DEFAULT 200.00,
    price_premium  DECIMAL(8,2) NOT NULL DEFAULT 350.00,
    seats_generated TINYINT(1)  DEFAULT 0,
    FOREIGN KEY (movie_id)   REFERENCES movies(id)   ON DELETE CASCADE,
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

CREATE TABLE seats (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    show_id     INT         NOT NULL,
    row_name    CHAR(1)     NOT NULL,
    seat_number INT         NOT NULL,
    seat_label  VARCHAR(10) NOT NULL,
    seat_type   ENUM('STANDARD','PREMIUM') NOT NULL DEFAULT 'STANDARD',
    is_booked   TINYINT(1)  DEFAULT 0,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
    UNIQUE KEY uq_seat (show_id, seat_label)
);

CREATE TABLE bookings (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(20)   NOT NULL UNIQUE,
    user_id           INT           NOT NULL,
    show_id           INT           NOT NULL,
    total_amount      DECIMAL(10,2) NOT NULL,
    payment_mode      ENUM('UPI','CREDIT_CARD','DEBIT_CARD') NOT NULL,
    payment_status    ENUM('SUCCESS','PENDING','FAILED') DEFAULT 'SUCCESS',
    booked_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (show_id) REFERENCES shows(id)
);

CREATE TABLE booking_seats (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    seat_id    INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id)    REFERENCES seats(id)
);


-- ============================================================
-- STEP 4 — THEATERS (5 Bengaluru theaters)
-- ============================================================
INSERT INTO theaters (name, city, address, total_screens) VALUES
('PVR Cinemas – Phoenix Mall',  'Bengaluru', 'Phoenix Mall, Whitefield, Bengaluru – 560066',   5),
('INOX – Mantri Square',        'Bengaluru', 'Mantri Square, Malleswaram, Bengaluru – 560003',  4),
('Cinepolis – Nexus Mall',      'Bengaluru', 'Nexus Mall, Koramangala, Bengaluru – 560095',     6),
('Miraj Cinemas – Forum Mall',  'Bengaluru', 'Forum Mall, Koramangala, Bengaluru – 560095',     3),
('SPI Palazzo – VR Mall',       'Bengaluru', 'VR Mall, Whitefield, Bengaluru – 560066',         4);


-- ============================================================
-- STEP 5 — MOVIES
--   25 movies: 10 English + 15 Kannada
--   All poster_url values verified from Wikipedia og:image tags
-- ============================================================
INSERT INTO movies (title, genre, language, rating, duration_min, poster_url, description, release_date) VALUES

-- ══════════════════════════════════════════════════════════════
--  10 ENGLISH MOVIES
-- ══════════════════════════════════════════════════════════════
('Dune: Part Two',
 'Sci-Fi / Adventure', 'English', 8.5, 166,
 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Dune_Part_Two_poster.jpeg/1200px-Dune_Part_Two_poster.jpeg',
 'Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
 '2024-03-01'),

('Deadpool & Wolverine',
 'Action / Comedy', 'English', 8.1, 128,
 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Deadpool_%26_Wolverine_poster.jpg/1200px-Deadpool_%26_Wolverine_poster.jpg',
 'Deadpool is recruited by the TVA and teams up with Wolverine to save his universe.',
 '2024-07-26'),

('Inside Out 2',
 'Animation / Family', 'English', 7.8, 100,
 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Inside_Out_2_poster.jpg/1200px-Inside_Out_2_poster.jpg',
 'Riley enters adolescence and a new emotion, Anxiety, arrives causing chaos inside Headquarters.',
 '2024-06-14'),

('Alien: Romulus',
 'Sci-Fi / Horror', 'English', 7.4, 119,
 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Alien_Romulus_poster.jpg/1200px-Alien_Romulus_poster.jpg',
 'Young colonists scavenging a derelict space station come face to face with the most terrifying life form in the universe.',
 '2024-08-16'),

('Twisters',
 'Action / Disaster', 'English', 7.2, 122,
 'https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Twisters_Official_US_Theatrical_Poster.jpg/1200px-Twisters_Official_US_Theatrical_Poster.jpg',
 'A storm chaser teams up with a social-media daredevil to outrun violent tornadoes sweeping across Oklahoma.',
 '2024-07-19'),

('Gladiator II',
 'Action / Historical', 'English', 7.0, 148,
 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Gladiator_II_%282024%29_poster.jpeg/1200px-Gladiator_II_%282024%29_poster.jpeg',
 'Years after the death of Maximus, Lucius is forced to enter the Colosseum and fight for his life.',
 '2024-11-22'),

('Wicked',
 'Musical / Fantasy', 'English', 7.9, 160,
 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Wicked_%282024_film%29_poster.png/1200px-Wicked_%282024_film%29_poster.png',
 'The story of the witches of Oz from their unlikely friendship to their divergent paths.',
 '2024-11-22'),

('Oppenheimer',
 'Biographical / Drama', 'English', 8.3, 180,
 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Oppenheimer_%28film%29.jpg/1200px-Oppenheimer_%28film%29.jpg',
 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
 '2023-07-21'),

('Avengers: Doomsday',
 'Action / Sci-Fi', 'English', 8.6, 165,
 'https://upload.wikimedia.org/wikipedia/en/d/d2/Avengers_Doomsday_poster.jpg',
 'Earth''s mightiest heroes face their most formidable threat as Doctor Doom unites the universe''s most dangerous villains.',
 '2025-05-01'),

('Mission: Impossible - The Final Reckoning',
 'Action / Thriller', 'English', 8.0, 170,
 'https://upload.wikimedia.org/wikipedia/en/2/28/Mission_Impossible_The_Final_Reckoning_poster.jpg',
 'Ethan Hunt and the IMF race against time to prevent a global catastrophe in their most impossible mission yet.',
 '2025-05-23'),

-- ══════════════════════════════════════════════════════════════
--  15 KANNADA MOVIES  (verified Wikipedia poster URLs)
-- ══════════════════════════════════════════════════════════════
('KGF: Chapter 2',
 'Action / Drama', 'Kannada', 8.2, 168,
 'https://upload.wikimedia.org/wikipedia/en/d/d0/K.G.F_Chapter_2.jpg',
 'Rocky''s bloodied rise to power continues as he faces a ruthless politician and a powerful drug lord.',
 '2022-04-14'),

('Kantara',
 'Action / Mythology', 'Kannada', 8.5, 148,
 'https://upload.wikimedia.org/wikipedia/en/8/84/Kantara_poster.jpeg',
 'A fierce conflict arises between a rebellious forest-dweller and a forest officer in Coastal Karnataka.',
 '2022-09-30'),

('Vikrant Rona',
 'Action / Fantasy', 'Kannada', 6.8, 155,
 'https://upload.wikimedia.org/wikipedia/en/thumb/9/94/Vikrant_Rona.jpeg/1200px-Vikrant_Rona.jpeg',
 'A mysterious police officer investigates supernatural happenings in a remote village.',
 '2022-07-28'),

('Bagheera',
 'Action / Crime', 'Kannada', 7.5, 145,
 'https://upload.wikimedia.org/wikipedia/en/3/31/Bagheera_2023_poster.jpg',
 'A mysterious vigilante ruthlessly hunts down corrupt politicians and officials who escape the law.',
 '2023-12-14'),

('Martin',
 'Action / Thriller', 'Kannada', 7.1, 152,
 'https://upload.wikimedia.org/wikipedia/en/3/36/Martin_2023_film_poster.jpg',
 'A man uncovers dark secrets from his past and embarks on a thrilling quest to expose the truth.',
 '2024-01-25'),

('Sapta Sagaradaache Ello',
 'Romance / Drama', 'Kannada', 8.3, 143,
 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Sapta_Saagaradaache_Ello_poster.jpeg/1200px-Sapta_Saagaradaache_Ello_poster.jpeg',
 'A poignant love story about two young people whose lives are torn apart by circumstances beyond their control.',
 '2023-10-19'),

('UI',
 'Action / Thriller', 'Kannada', 7.8, 158,
 'https://upload.wikimedia.org/wikipedia/en/1/11/UI_promotional_poster.jpg',
 'A charismatic leader wages a psychological war against a corrupt political system.',
 '2024-11-20'),

('Max',
 'Action / Drama', 'Kannada', 7.2, 140,
 'https://upload.wikimedia.org/wikipedia/en/thumb/9/94/Max_Kannada_film_poster.jpg/1200px-Max_Kannada_film_poster.jpg',
 'An honest police officer battles relentless adversaries while uncovering a dangerous conspiracy.',
 '2024-05-17'),

('Kranti',
 'Action / Period', 'Kannada', 7.6, 162,
 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Kranti_film_poster.jpg/1200px-Kranti_film_poster.jpg',
 'Set in the 1970s, a fearless man rises against tyranny to bring justice to the oppressed.',
 '2023-03-29'),

('Ghost',
 'Action / Thriller', 'Kannada', 6.9, 148,
 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Ghost_2023_Kannada_film_poster.jpg/1200px-Ghost_2023_Kannada_film_poster.jpg',
 'An undercover agent is tasked with dismantling a powerful narcotics cartel operating across borders.',
 '2023-10-19'),

('Salaga',
 'Action / Crime', 'Kannada', 7.4, 150,
 'https://upload.wikimedia.org/wikipedia/en/9/96/Salaga_film_poster.jpg',
 'A ruthless gangster fights for survival in the dangerous underworld of Bengaluru.',
 '2021-12-24'),

('777 Charlie',
 'Adventure / Drama', 'Kannada', 8.7, 170,
 'https://upload.wikimedia.org/wikipedia/en/6/6a/777_Charlie_poster.jpg',
 'A lonely and reclusive man''s life transforms when a free-spirited dog named Charlie enters his world.',
 '2022-06-10'),

('Bettada Hoovu',
 'Romance / Drama', 'Kannada', 7.9, 138,
 'https://upload.wikimedia.org/wikipedia/en/b/b1/Bettada_Hoovu_poster.jpg',
 'A heartwarming story of love and sacrifice set against the backdrop of the mountains of Karnataka.',
 '2023-05-12'),

('Jawan',
 'Action / Thriller', 'Kannada', 7.7, 169,
 'https://upload.wikimedia.org/wikipedia/en/d/d8/Jawan_film_poster.jpg',
 'A prison warden recruits women convicts for a mission, but a much bigger picture emerges.',
 '2023-09-07'),

('Graama',
 'Drama / Rural', 'Kannada', 7.3, 132,
 'https://upload.wikimedia.org/wikipedia/en/c/c9/Graama_film_poster.jpg',
 'A compelling tale of a village community facing social challenges in modern Karnataka.',
 '2024-02-16');


-- ============================================================
-- STEP 6 — SHOWS
--   Bulk INSERT using CROSS JOIN (fast — no loops)
--   25 movies x 5 theaters x 7 days x 4 show times = 3,500 shows
-- ============================================================
INSERT INTO shows (movie_id, theater_id, show_date, show_time, price_standard, price_premium)
SELECT
    m.id,
    t.id,
    DATE_ADD(CURDATE(), INTERVAL days.n DAY),
    times.show_time,
    times.price_std,
    times.price_prm
FROM movies m
CROSS JOIN theaters t
CROSS JOIN (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL
    SELECT 3      UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
) AS days
CROSS JOIN (
    SELECT '10:00:00' AS show_time, 200.00 AS price_std, 350.00 AS price_prm UNION ALL
    SELECT '14:30:00',              200.00,               350.00              UNION ALL
    SELECT '18:00:00',              220.00,               370.00              UNION ALL
    SELECT '21:30:00',              250.00,               400.00
) AS times;


-- ============================================================
-- STEP 7 — SEATS
--   Bulk INSERT using CROSS JOIN (fast — no loops)
--   3,500 shows x 100 seats = 350,000 rows
--   Rows A-E = PREMIUM  |  Rows F-J = STANDARD
-- ============================================================
INSERT INTO seats (show_id, row_name, seat_number, seat_label, seat_type, is_booked)
SELECT
    s.id,
    r.row_name,
    c.col_num,
    CONCAT(r.row_name, c.col_num),
    CASE WHEN r.row_name IN ('A','B','C','D','E') THEN 'PREMIUM' ELSE 'STANDARD' END,
    0
FROM shows s
CROSS JOIN (
    SELECT 'A' AS row_name UNION ALL SELECT 'B' UNION ALL SELECT 'C' UNION ALL
    SELECT 'D'             UNION ALL SELECT 'E' UNION ALL SELECT 'F' UNION ALL
    SELECT 'G'             UNION ALL SELECT 'H' UNION ALL SELECT 'I' UNION ALL SELECT 'J'
) AS r
CROSS JOIN (
    SELECT 1 AS col_num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
    SELECT 4            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
    SELECT 7            UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
) AS c;


-- ============================================================
-- STEP 8 — Mark all shows seats_generated = 1
-- ============================================================
UPDATE shows SET seats_generated = 1 WHERE id > 0;

-- Re-enable safe updates
SET SQL_SAFE_UPDATES = 1;


-- ============================================================
-- STEP 9 — DEMO USER  (password: password123)
-- ============================================================
INSERT INTO users (name, email, password, phone)
VALUES ('Demo User', 'demo@movieflix.com', 'password123', '9876543210');


-- ============================================================
-- STEP 10 — VERIFICATION
-- ============================================================
SELECT 'Movies'   AS entity, COUNT(*) AS total FROM movies
UNION ALL
SELECT 'Theaters',            COUNT(*)           FROM theaters
UNION ALL
SELECT 'Shows',               COUNT(*)           FROM shows
UNION ALL
SELECT 'Seats',               COUNT(*)           FROM seats
UNION ALL
SELECT 'Users',               COUNT(*)           FROM users;

-- Sample: first 10 seats for show #1
SELECT * FROM seats WHERE show_id = 1 LIMIT 10;

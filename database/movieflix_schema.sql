-- ============================================================
-- MovieFlix Database Schema
-- Run this entire file in MySQL Workbench
-- ============================================================

-- Step 1: Create and select the database
DROP DATABASE IF EXISTS movieflix;
CREATE DATABASE movieflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movieflix;

-- ============================================================
-- TABLE: users
-- Stores registered user accounts
-- ============================================================
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,   -- store hashed in prod; plain for demo
    phone       VARCHAR(15),
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: movies
-- ============================================================
CREATE TABLE movies (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200)    NOT NULL,
    genre           VARCHAR(100)    NOT NULL,
    language        VARCHAR(50)     DEFAULT 'English',
    rating          DECIMAL(3,1)    DEFAULT 0.0,
    duration_min    INT             NOT NULL,   -- duration in minutes
    poster_url      VARCHAR(500),
    description     TEXT,
    release_date    DATE            NOT NULL,
    is_active       TINYINT(1)      DEFAULT 1
);

-- ============================================================
-- TABLE: theaters
-- ============================================================
CREATE TABLE theaters (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200)    NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    address         TEXT            NOT NULL,
    total_screens   INT             DEFAULT 3,
    is_active       TINYINT(1)      DEFAULT 1
);

-- ============================================================
-- TABLE: shows
-- Each row = one screening (movie + theater + date + time)
-- ============================================================
CREATE TABLE shows (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    movie_id        INT             NOT NULL,
    theater_id      INT             NOT NULL,
    show_date       DATE            NOT NULL,
    show_time       TIME            NOT NULL,
    price_standard  DECIMAL(8,2)    NOT NULL DEFAULT 150.00,
    price_premium   DECIMAL(8,2)    NOT NULL DEFAULT 250.00,
    seats_generated TINYINT(1)      DEFAULT 0,  -- flag: seats pre-generated?
    FOREIGN KEY (movie_id)   REFERENCES movies(id)   ON DELETE CASCADE,
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: seats
-- Pre-generated rows (one per seat per show)
-- seat_type: STANDARD | PREMIUM
-- row A-E = PREMIUM (rows 1-5), row F-J = STANDARD (rows 6-10)
-- 10 columns per row → 100 seats per show
-- ============================================================
CREATE TABLE seats (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    show_id     INT             NOT NULL,
    row_name    CHAR(1)         NOT NULL,   -- A, B, C ... J
    seat_number INT             NOT NULL,   -- 1 .. 10
    seat_label  VARCHAR(10)     NOT NULL,   -- e.g. A1, B5
    seat_type   ENUM('STANDARD','PREMIUM') NOT NULL DEFAULT 'STANDARD',
    is_booked   TINYINT(1)      DEFAULT 0,
    FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
    UNIQUE KEY uq_seat (show_id, seat_label)
);

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE bookings (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference   VARCHAR(20)     NOT NULL UNIQUE,
    user_id             INT             NOT NULL,
    show_id             INT             NOT NULL,
    total_amount        DECIMAL(10,2)   NOT NULL,
    payment_mode        ENUM('UPI','CREDIT_CARD','DEBIT_CARD') NOT NULL,
    payment_status      ENUM('SUCCESS','PENDING','FAILED') DEFAULT 'SUCCESS',
    booked_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (show_id) REFERENCES shows(id)
);

-- ============================================================
-- TABLE: booking_seats  (many-to-many: booking ↔ seats)
-- ============================================================
CREATE TABLE booking_seats (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    booking_id  INT NOT NULL,
    seat_id     INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id)    REFERENCES seats(id)
);

-- ============================================================
-- STORED PROCEDURE: generate_seats_for_show(show_id)
-- Creates 100 seats (rows A-J, cols 1-10) for a given show
-- Rows A-D → PREMIUM  |  Rows E-J → STANDARD
-- ============================================================
DELIMITER $$

CREATE PROCEDURE generate_seats_for_show(IN p_show_id INT)
BEGIN
    DECLARE row_char  CHAR(1);
    DECLARE col_num   INT;
    DECLARE seat_typ  ENUM('STANDARD','PREMIUM');
    DECLARE rows_list VARCHAR(20) DEFAULT 'ABCDEFGHIJ';
    DECLARE i         INT DEFAULT 1;

    -- Clean existing if re-run
    DELETE FROM seats WHERE show_id = p_show_id;

    WHILE i <= 10 DO
        SET row_char = SUBSTRING(rows_list, i, 1);
        IF i <= 4 THEN
            SET seat_typ = 'PREMIUM';
        ELSE
            SET seat_typ = 'STANDARD';
        END IF;

        SET col_num = 1;
        WHILE col_num <= 10 DO
            INSERT INTO seats (show_id, row_name, seat_number, seat_label, seat_type)
            VALUES (p_show_id, row_char, col_num, CONCAT(row_char, col_num), seat_typ);
            SET col_num = col_num + 1;
        END WHILE;

        SET i = i + 1;
    END WHILE;

    -- Mark show as seats generated
    UPDATE shows SET seats_generated = 1 WHERE id = p_show_id;
END$$

DELIMITER ;

-- ============================================================
-- SEED DATA: movies (10 movies)
-- ============================================================
INSERT INTO movies (title, genre, language, rating, duration_min, poster_url, description, release_date) VALUES
('Interstellar',        'Sci-Fi / Drama',   'English', 8.6, 169,
 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIe.jpg',
 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity''s survival.',
 '2014-11-07'),

('Avengers: Endgame',   'Action / Sci-Fi',  'English', 8.4, 181,
 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
 'After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos'' actions.',
 '2019-04-26'),

('RRR',                 'Action / Drama',   'Telugu',  7.8, 187,
 'https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO7vh8I0sQ8OxFdh.jpg',
 'A fictional story about two legendary Indian revolutionaries and their journey away from home.',
 '2022-03-25'),

('Pushpa: The Rise',    'Action / Thriller','Telugu',  7.6, 179,
 'https://image.tmdb.org/t/p/w500/rugyJdeoJm7cSJL1q4jBpTNbxyU.jpg',
 'A labourer rises through the ranks of a red sandalwood smuggling syndicate.',
 '2021-12-17'),

('KGF: Chapter 2',      'Action / Drama',   'Kannada', 8.2, 168,
 'https://image.tmdb.org/t/p/w500/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg',
 'Rocky''s bloodied path to power continues as he faces a ruthless politician and drug lord.',
 '2022-04-14'),

('Dune: Part Two',      'Sci-Fi / Adventure','English',8.5, 166,
 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
 '2024-03-01'),

('Animal',              'Action / Drama',   'Hindi',   7.1, 201,
 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
 'A son takes drastic measures when his father''s life is threatened by his enemies.',
 '2023-12-01'),

('Oppenheimer',         'Biographical / Drama','English',8.3,180,
 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
 'The story of J. Robert Oppenheimer''s role in the development of the atomic bomb during WWII.',
 '2023-07-21'),

('Kalki 2898 AD',       'Sci-Fi / Action',  'Telugu',  7.4, 181,
 'https://image.tmdb.org/t/p/w500/f3VDIGaGVqPNVQ6jRJMeIZpzGSY.jpg',
 'Set in a futuristic world, the story is a mythological retelling of the 10th avatar of Lord Vishnu.',
 '2024-06-27'),

('Stree 2',             'Horror / Comedy',  'Hindi',   7.9, 150,
 'https://image.tmdb.org/t/p/w500/nz8s3JVFkWkMHn6sHRBqcDPEJfv.jpg',
 'The people of Chanderi are terrorized by a new supernatural entity, Sarkata.',
 '2024-08-15');

-- ============================================================
-- SEED DATA: theaters (5 theaters)
-- ============================================================
INSERT INTO theaters (name, city, address, total_screens) VALUES
('PVR Cinemas – Phoenix Mall',  'Mumbai',    'Phoenix Mall, Lower Parel, Mumbai – 400013', 5),
('INOX – Forum Mall',           'Bangalore', 'Forum Mall, Koramangala, Bangalore – 560095', 4),
('Cinepolis – DLF Mall',        'Delhi',     'DLF Promenade, Vasant Kunj, New Delhi – 110070', 6),
('PVR – VR Chennai',            'Chennai',   'VR Mall, Anna Nagar, Chennai – 600040', 4),
('Miraj Cinemas',               'Hyderabad', 'Banjara Hills Road No. 12, Hyderabad – 500034', 3);

-- ============================================================
-- SEED DATA: shows (multiple shows for each movie+theater combo)
-- show_date: today + 0/1/2 days  |  times: 10:00, 14:00, 18:00, 21:30
-- ============================================================
-- We'll create shows for all 10 movies × 5 theaters × 3 dates × 3 times
-- Using a procedure for brevity

DELIMITER $$
CREATE PROCEDURE seed_shows()
BEGIN
    DECLARE mid     INT;
    DECLARE tid     INT;
    DECLARE d_off   INT;  -- date offset (today, +1, +2)
    DECLARE t_str   TIME;
    DECLARE std_p   DECIMAL(8,2);
    DECLARE prm_p   DECIMAL(8,2);
    DECLARE new_sid INT;

    SET mid = 1;
    WHILE mid <= 10 DO
        SET tid = 1;
        WHILE tid <= 5 DO
            -- 3 days: today, tomorrow, day after
            SET d_off = 0;
            WHILE d_off <= 2 DO
                -- Morning show
                INSERT INTO shows (movie_id, theater_id, show_date, show_time, price_standard, price_premium)
                VALUES (mid, tid, DATE_ADD(CURDATE(), INTERVAL d_off DAY), '10:00:00',
                        150.00 + (mid * 10), 250.00 + (mid * 10));
                SET new_sid = LAST_INSERT_ID();
                CALL generate_seats_for_show(new_sid);

                -- Afternoon show
                INSERT INTO shows (movie_id, theater_id, show_date, show_time, price_standard, price_premium)
                VALUES (mid, tid, DATE_ADD(CURDATE(), INTERVAL d_off DAY), '14:30:00',
                        150.00 + (mid * 10), 250.00 + (mid * 10));
                SET new_sid = LAST_INSERT_ID();
                CALL generate_seats_for_show(new_sid);

                -- Evening show
                INSERT INTO shows (movie_id, theater_id, show_date, show_time, price_standard, price_premium)
                VALUES (mid, tid, DATE_ADD(CURDATE(), INTERVAL d_off DAY), '18:00:00',
                        160.00 + (mid * 10), 260.00 + (mid * 10));
                SET new_sid = LAST_INSERT_ID();
                CALL generate_seats_for_show(new_sid);

                -- Night show
                INSERT INTO shows (movie_id, theater_id, show_date, show_time, price_standard, price_premium)
                VALUES (mid, tid, DATE_ADD(CURDATE(), INTERVAL d_off DAY), '21:30:00',
                        180.00 + (mid * 10), 280.00 + (mid * 10));
                SET new_sid = LAST_INSERT_ID();
                CALL generate_seats_for_show(new_sid);

                SET d_off = d_off + 1;
            END WHILE;
            SET tid = tid + 1;
        END WHILE;
        SET mid = mid + 1;
    END WHILE;
END$$
DELIMITER ;

-- Run seed
CALL seed_shows();

-- ============================================================
-- Demo user (password: password123)
-- ============================================================
INSERT INTO users (name, email, password, phone) VALUES
('Demo User', 'demo@movieflix.com', 'password123', '9876543210');

-- ============================================================
-- Verification Queries — run these to confirm setup
-- ============================================================
SELECT 'Movies count:'  AS label, COUNT(*) AS val FROM movies;
SELECT 'Theaters count:'AS label, COUNT(*) AS val FROM theaters;
SELECT 'Shows count:'   AS label, COUNT(*) AS val FROM shows;
SELECT 'Seats count:'   AS label, COUNT(*) AS val FROM seats;
SELECT 'Users count:'   AS label, COUNT(*) AS val FROM users;

-- Sample: seats for show #1
SELECT * FROM seats WHERE show_id = 1 LIMIT 20;

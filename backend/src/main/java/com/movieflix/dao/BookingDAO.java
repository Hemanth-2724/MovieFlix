package com.movieflix.dao;

import com.movieflix.model.Booking;
import com.movieflix.util.DBConnection;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * BookingDAO — creates bookings and fetches booking details.
 * Uses a DB transaction to atomically:
 *   1. Mark seats as booked
 *   2. Insert booking row
 *   3. Insert booking_seats rows
 */
public class BookingDAO {

    private final SeatDAO seatDAO = new SeatDAO();

    /**
     * Create a booking within a single ACID transaction.
     *
     * @param userId      logged-in user id
     * @param showId      show being booked
     * @param seatIds     list of seat IDs (max 5)
     * @param paymentMode "UPI" | "CREDIT_CARD" | "DEBIT_CARD"
     * @return populated Booking object with booking reference
     */
    public Booking createBooking(int userId, int showId,
                                 List<Integer> seatIds, String paymentMode)
            throws SQLException {

        if (seatIds == null || seatIds.isEmpty() || seatIds.size() > 5) {
            throw new IllegalArgumentException("Seat count must be between 1 and 5.");
        }

        Connection conn = DBConnection.getConnection();
        conn.setAutoCommit(false);

        try {
            // 0. Verify user exists to prevent FK violation
            String checkUserSql = "SELECT id FROM users WHERE id = ?";
            try (PreparedStatement psCheck = conn.prepareStatement(checkUserSql)) {
                psCheck.setInt(1, userId);
                try (ResultSet rsCheck = psCheck.executeQuery()) {
                    if (!rsCheck.next()) {
                        throw new IllegalArgumentException("User session is invalid. Please sign out and sign in again.");
                    }
                }
            }

            // 0.1 Verify show exists to prevent FK violation
            String checkShowSql = "SELECT id FROM shows WHERE id = ?";
            try (PreparedStatement psCheck = conn.prepareStatement(checkShowSql)) {
                psCheck.setInt(1, showId);
                try (ResultSet rsCheck = psCheck.executeQuery()) {
                    if (!rsCheck.next()) {
                        throw new IllegalArgumentException("Selected show is no longer available. Please select another show.");
                    }
                }
            }

            // 1. Mark seats booked (with conflict check)
            seatDAO.markSeatsBooked(seatIds, conn);

            // 2. Calculate total amount
            BigDecimal totalAmount = calculateTotal(seatIds, showId, conn);

            // 3. Generate unique booking reference
            String ref = "MF" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

            // 4. Insert booking
            String bookingSql = "INSERT INTO bookings (booking_reference, user_id, show_id, total_amount, payment_mode, payment_status) "
                              + "VALUES (?, ?, ?, ?, ?, 'SUCCESS')";
            int bookingId;
            try (PreparedStatement ps = conn.prepareStatement(bookingSql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, ref);
                ps.setInt(2, userId);
                ps.setInt(3, showId);
                ps.setBigDecimal(4, totalAmount);
                ps.setString(5, paymentMode);
                ps.executeUpdate();
                ResultSet keys = ps.getGeneratedKeys();
                keys.next();
                bookingId = keys.getInt(1);
            }

            // 5. Insert booking_seats
            String bsSql = "INSERT INTO booking_seats (booking_id, seat_id) VALUES (?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(bsSql)) {
                for (int seatId : seatIds) {
                    ps.setInt(1, bookingId);
                    ps.setInt(2, seatId);
                    ps.addBatch();
                }
                ps.executeBatch();
            }

            conn.commit();

            // 6. Build response
            Booking b = getBookingById(bookingId);
            return b;

        } catch (Exception e) {
            conn.rollback();
            throw new SQLException("Booking failed: " + e.getMessage(), e);
        } finally {
            conn.setAutoCommit(true);
            conn.close();
        }
    }

    /** Fetch booking details with joined movie/theater/seat info. */
    public Booking getBookingById(int bookingId) throws SQLException {
        String sql = "SELECT b.*, u.name AS user_name, u.email AS user_email, "
                   + "m.title AS movie_title, t.name AS theater_name, "
                   + "DATE_FORMAT(s.show_date,'%d %b %Y') AS show_date_fmt, "
                   + "TIME_FORMAT(s.show_time,'%h:%i %p') AS show_time_fmt "
                   + "FROM bookings b "
                   + "JOIN users u   ON b.user_id   = u.id "
                   + "JOIN shows  s  ON b.show_id   = s.id "
                   + "JOIN movies m  ON s.movie_id  = m.id "
                   + "JOIN theaters t ON s.theater_id = t.id "
                   + "WHERE b.id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Booking b = mapRow(rs);
                // Fetch seat labels
                List<String> labels = getSeatLabelsForBooking(bookingId, conn);
                b.setSeatLabels(labels);
                return b;
            }
        }
        return null;
    }

    /** Get booking by booking_reference string. */
    public Booking getBookingByReference(String ref) throws SQLException {
        String sql = "SELECT id FROM bookings WHERE booking_reference = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, ref);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return getBookingById(rs.getInt("id"));
        }
        return null;
    }

    // ── Private helpers ─────────────────────────────────────────────────

    /** Calculate total price based on seat types for the show. */
    private BigDecimal calculateTotal(List<Integer> seatIds, int showId, Connection conn) throws SQLException {
        String sql = "SELECT se.seat_type, sh.price_standard, sh.price_premium "
                   + "FROM seats se JOIN shows sh ON se.show_id = sh.id "
                   + "WHERE se.id = ? AND sh.id = ?";
        BigDecimal total = BigDecimal.ZERO;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int sid : seatIds) {
                ps.setInt(1, sid);
                ps.setInt(2, showId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    String type = rs.getString("seat_type");
                    BigDecimal price = "PREMIUM".equals(type)
                            ? rs.getBigDecimal("price_premium")
                            : rs.getBigDecimal("price_standard");
                    total = total.add(price);
                }
            }
        }
        return total;
    }

    private List<String> getSeatLabelsForBooking(int bookingId, Connection conn) throws SQLException {
        List<String> labels = new ArrayList<>();
        String sql = "SELECT s.seat_label FROM booking_seats bs JOIN seats s ON bs.seat_id = s.id WHERE bs.booking_id = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) labels.add(rs.getString("seat_label"));
        }
        return labels;
    }

    /** Get all bookings for a specific user. */
    public List<Booking> getBookingsByUserId(int userId) throws SQLException {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT id FROM bookings WHERE user_id = ? ORDER BY booked_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Booking b = getBookingById(rs.getInt("id"));
                    if (b != null) {
                        list.add(b);
                    }
                }
            }
        }
        return list;
    }

    private Booking mapRow(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setId(rs.getInt("id"));  // not available from all queries
        b.setBookingReference(rs.getString("booking_reference"));
        b.setUserId(rs.getInt("user_id"));
        b.setShowId(rs.getInt("show_id"));
        b.setTotalAmount(rs.getBigDecimal("total_amount"));
        b.setPaymentMode(rs.getString("payment_mode"));
        b.setPaymentStatus(rs.getString("payment_status"));
        b.setBookedAt(rs.getTimestamp("booked_at"));
        b.setUserName(rs.getString("user_name"));
        b.setUserEmail(rs.getString("user_email"));
        b.setMovieTitle(rs.getString("movie_title"));
        b.setTheaterName(rs.getString("theater_name"));
        b.setShowDate(rs.getString("show_date_fmt"));
        b.setShowTime(rs.getString("show_time_fmt"));
        return b;
    }
}

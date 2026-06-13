package com.movieflix.dao;

import com.movieflix.model.Seat;
import com.movieflix.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * SeatDAO — get seats for a show, and mark seats as booked.
 */
public class SeatDAO {

    /** Return all seats (with booking status) for a given show. */
    public List<Seat> getSeatsByShow(int showId) throws SQLException {
        List<Seat> list = new ArrayList<>();
        String sql = "SELECT * FROM seats WHERE show_id = ? ORDER BY row_name, seat_number";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, showId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    /**
     * Mark a list of seat ids as booked.
     * Done within a transaction; throws if any seat is already booked (concurrent conflict).
     *
     * @param seatIds  list of seat IDs to mark booked
     * @param conn     existing connection (caller manages transaction)
     */
    public void markSeatsBooked(List<Integer> seatIds, Connection conn) throws SQLException {
        // Verify none are already booked (optimistic concurrency check)
        String checkSql = "SELECT id FROM seats WHERE id = ? AND is_booked = 1";
        for (int seatId : seatIds) {
            try (PreparedStatement ps = conn.prepareStatement(checkSql)) {
                ps.setInt(1, seatId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    throw new SQLException("Seat " + seatId + " is already booked by another user.");
                }
            }
        }

        // Mark as booked
        String updateSql = "UPDATE seats SET is_booked = 1 WHERE id = ?";
        try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
            for (int seatId : seatIds) {
                ps.setInt(1, seatId);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    /** Get seat labels for a list of seat IDs (used for booking confirmation). */
    public List<String> getSeatLabels(List<Integer> seatIds) throws SQLException {
        List<String> labels = new ArrayList<>();
        if (seatIds.isEmpty()) return labels;

        StringBuilder sb = new StringBuilder("SELECT seat_label FROM seats WHERE id IN (");
        for (int i = 0; i < seatIds.size(); i++) {
            sb.append(i == 0 ? "?" : ",?");
        }
        sb.append(") ORDER BY row_name, seat_number");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sb.toString())) {
            for (int i = 0; i < seatIds.size(); i++) ps.setInt(i + 1, seatIds.get(i));
            ResultSet rs = ps.executeQuery();
            while (rs.next()) labels.add(rs.getString("seat_label"));
        }
        return labels;
    }

    private Seat mapRow(ResultSet rs) throws SQLException {
        Seat s = new Seat();
        s.setId(rs.getInt("id"));
        s.setShowId(rs.getInt("show_id"));
        s.setRowName(rs.getString("row_name"));
        s.setSeatNumber(rs.getInt("seat_number"));
        s.setSeatLabel(rs.getString("seat_label"));
        s.setSeatType(rs.getString("seat_type"));
        s.setBooked(rs.getBoolean("is_booked"));
        return s;
    }
}

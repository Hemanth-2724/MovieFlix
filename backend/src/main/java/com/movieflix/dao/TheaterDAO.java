package com.movieflix.dao;

import com.movieflix.model.Theater;
import com.movieflix.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * TheaterDAO — fetches theaters that have shows for a given movie.
 */
public class TheaterDAO {

    /**
     * Get distinct theaters showing a particular movie.
     * Joins through the shows table so only theaters with upcoming shows appear.
     *
     * @param movieId  the movie id to look for
     * @param showDate  optional date filter ("yyyy-MM-dd"), or null for today+
     */
    public List<Theater> getTheatersForMovie(int movieId, String showDate) throws SQLException {
        List<Theater> list = new ArrayList<>();
        String dateClause = (showDate != null)
                ? "AND s.show_date = ?"
                : "AND s.show_date >= CURDATE()";

        String sql = "SELECT DISTINCT t.* FROM theaters t "
                   + "JOIN shows s ON t.id = s.theater_id "
                   + "WHERE s.movie_id = ? AND t.is_active = 1 " + dateClause
                   + " ORDER BY t.name";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, movieId);
            if (showDate != null) ps.setString(2, showDate);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    /** Get all active theaters. */
    public List<Theater> getAllTheaters() throws SQLException {
        List<Theater> list = new ArrayList<>();
        String sql = "SELECT * FROM theaters WHERE is_active = 1 ORDER BY name";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    private Theater mapRow(ResultSet rs) throws SQLException {
        Theater t = new Theater();
        t.setId(rs.getInt("id"));
        t.setName(rs.getString("name"));
        t.setCity(rs.getString("city"));
        t.setAddress(rs.getString("address"));
        t.setTotalScreens(rs.getInt("total_screens"));
        t.setActive(rs.getBoolean("is_active"));
        return t;
    }
}

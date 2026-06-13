package com.movieflix.dao;

import com.movieflix.model.Show;
import com.movieflix.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * ShowDAO — fetches shows filtered by movie and/or theater.
 */
public class ShowDAO {

    /**
     * Get shows for a movie at a specific theater on a specific date.
     * All params are optional (pass 0 / null to skip).
     */
    public List<Show> getShows(int movieId, int theaterId, String showDate) throws SQLException {
        List<Show> list = new ArrayList<>();

        StringBuilder sql = new StringBuilder(
            "SELECT s.*, m.title AS movie_title, t.name AS theater_name, t.city AS theater_city "
          + "FROM shows s "
          + "JOIN movies m ON s.movie_id = m.id "
          + "JOIN theaters t ON s.theater_id = t.id "
          + "WHERE 1=1 "
        );

        if (movieId > 0)   sql.append("AND s.movie_id = ? ");
        if (theaterId > 0) sql.append("AND s.theater_id = ? ");
        if (showDate != null && !showDate.isEmpty())
                           sql.append("AND s.show_date = ? ");
        else               sql.append("AND s.show_date >= CURDATE() ");

        sql.append("ORDER BY s.show_date, s.show_time");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            int idx = 1;
            if (movieId > 0)   ps.setInt(idx++, movieId);
            if (theaterId > 0) ps.setInt(idx++, theaterId);
            if (showDate != null && !showDate.isEmpty()) ps.setString(idx, showDate);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    /** Get single show by id. */
    public Show getShowById(int showId) throws SQLException {
        String sql = "SELECT s.*, m.title AS movie_title, t.name AS theater_name, t.city AS theater_city "
                   + "FROM shows s "
                   + "JOIN movies m ON s.movie_id = m.id "
                   + "JOIN theaters t ON s.theater_id = t.id "
                   + "WHERE s.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, showId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapRow(rs);
        }
        return null;
    }

    private Show mapRow(ResultSet rs) throws SQLException {
        Show s = new Show();
        s.setId(rs.getInt("id"));
        s.setMovieId(rs.getInt("movie_id"));
        s.setTheaterId(rs.getInt("theater_id"));
        s.setShowDate(rs.getDate("show_date"));
        s.setShowTime(rs.getTime("show_time"));
        s.setPriceStandard(rs.getBigDecimal("price_standard"));
        s.setPricePremium(rs.getBigDecimal("price_premium"));
        s.setSeatsGenerated(rs.getBoolean("seats_generated"));
        s.setMovieTitle(rs.getString("movie_title"));
        s.setTheaterName(rs.getString("theater_name"));
        s.setTheaterCity(rs.getString("theater_city"));
        return s;
    }
}

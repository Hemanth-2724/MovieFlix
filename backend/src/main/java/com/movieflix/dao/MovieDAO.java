package com.movieflix.dao;

import com.movieflix.model.Movie;
import com.movieflix.util.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * MovieDAO — handles all DB operations for the movies table.
 */
public class MovieDAO {

    /** Return all active movies, ordered by release_date descending. */
    public List<Movie> getAllMovies() throws SQLException {
        List<Movie> list = new ArrayList<>();
        String sql = "SELECT * FROM movies WHERE is_active = 1 ORDER BY release_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    /** Return one movie by id. */
    public Movie getMovieById(int id) throws SQLException {
        String sql = "SELECT * FROM movies WHERE id = ? AND is_active = 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapRow(rs);
        }
        return null;
    }

    /** Search movies by title (partial match) or genre. */
    public List<Movie> searchMovies(String query) throws SQLException {
        List<Movie> list = new ArrayList<>();
        String sql = "SELECT * FROM movies WHERE is_active = 1 "
                   + "AND (title LIKE ? OR genre LIKE ? OR language LIKE ?) "
                   + "ORDER BY rating DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            String like = "%" + query + "%";
            ps.setString(1, like);
            ps.setString(2, like);
            ps.setString(3, like);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    private Movie mapRow(ResultSet rs) throws SQLException {
        Movie m = new Movie();
        m.setId(rs.getInt("id"));
        m.setTitle(rs.getString("title"));
        m.setGenre(rs.getString("genre"));
        m.setLanguage(rs.getString("language"));
        m.setRating(rs.getBigDecimal("rating"));
        m.setDurationMin(rs.getInt("duration_min"));
        m.setPosterUrl(rs.getString("poster_url"));
        m.setDescription(rs.getString("description"));
        m.setReleaseDate(rs.getDate("release_date"));
        m.setActive(rs.getBoolean("is_active"));
        return m;
    }
}

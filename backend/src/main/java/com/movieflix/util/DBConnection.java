package com.movieflix.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    public static Connection getConnection() throws SQLException {
        // Read from environment variables (Railway/Render sets these)
        // Falls back to localhost for local development
        String url  = System.getenv("DB_URL");
        String user = System.getenv("DB_USER");
        String pass = System.getenv("DB_PASSWORD");

        if (url  == null) url  = "jdbc:mysql://localhost:3306/movieflix?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        if (user == null) user = "root";
        if (pass == null) pass = "Hemanth@2724";

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            return DriverManager.getConnection(url, user, pass);
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC Driver not found", e);
        }
    }
}

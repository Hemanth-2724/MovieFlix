package com.movieflix.listener;

import com.movieflix.util.DBConnection;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Connection;
import java.sql.Statement;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * DatabaseCleanupListener — runs a daily background task to:
 * 1. Shift all show dates dynamically to start from today.
 * 2. Reset all seat bookings to available.
 * Also runs immediately on application startup to ensure fresh show data.
 */
@WebListener
public class DatabaseCleanupListener implements ServletContextListener {

    private ScheduledExecutorService scheduler;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        scheduler = Executors.newSingleThreadScheduledExecutor();
        // Run immediately on startup, and then run every 24 hours
        scheduler.scheduleAtFixedRate(new CleanupTask(), 0, 24, TimeUnit.HOURS);
        System.out.println("[DatabaseCleanupListener] Initialized daily database cleanup scheduler.");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if (scheduler != null) {
            scheduler.shutdownNow();
        }
        // Close DBConnection pool
        DBConnection.closePool();
        System.out.println("[DatabaseCleanupListener] Destroyed database cleanup scheduler and closed connection pool.");
    }

    private static class CleanupTask implements Runnable {
        @Override
        public void run() {
            System.out.println("[DatabaseCleanupListener] Starting database cleanup task...");
            try (Connection conn = DBConnection.getConnection();
                 Statement stmt = conn.createStatement()) {

                // Disable safe updates temporarily
                stmt.execute("SET SQL_SAFE_UPDATES = 0;");

                // Shift show dates to start from today
                String shiftDatesSql =
                    "UPDATE shows SET show_date = DATE_ADD(show_date, " +
                    "INTERVAL DATEDIFF(CURDATE(), (SELECT min_date FROM (SELECT MIN(show_date) AS min_date FROM shows) AS temp)) DAY);";
                int showsUpdated = stmt.executeUpdate(shiftDatesSql);
                System.out.println("[DatabaseCleanupListener] Shifted show dates starting from today. Shows updated: " + showsUpdated);

                // Reset all seat bookings
                int seatsReset = stmt.executeUpdate("UPDATE seats SET is_booked = 0;");
                System.out.println("[DatabaseCleanupListener] Reset all seat bookings to available. Seats reset: " + seatsReset);

                // Re-enable safe updates
                stmt.execute("SET SQL_SAFE_UPDATES = 1;");

                System.out.println("[DatabaseCleanupListener] Database cleanup task completed successfully.");
            } catch (Exception e) {
                System.err.println("[DatabaseCleanupListener] Error executing database cleanup: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}

package com.movieflix.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieflix.dao.BookingDAO;
import com.movieflix.model.Booking;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * BookingServlet — handles /api/bookings/*
 *
 * POST /api/bookings              → create booking
 * GET  /api/bookings/{id}         → get booking by id
 * GET  /api/bookings?ref={ref}    → get booking by reference
 */
@WebServlet(urlPatterns = {"/api/bookings/*", "/api/bookings"})
public class BookingServlet extends HttpServlet {

    private final BookingDAO   bookingDAO = new BookingDAO();
    private final ObjectMapper mapper     = new ObjectMapper();

    // ── POST — Create Booking ─────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String body = req.getReader().lines().collect(Collectors.joining());

            @SuppressWarnings("unchecked")
            Map<String, Object> data = mapper.readValue(body, Map.class);

            int    userId      = ((Number) data.get("userId")).intValue();
            int    showId      = ((Number) data.get("showId")).intValue();
            String paymentMode = (String) data.get("paymentMode");

            @SuppressWarnings("unchecked")
            List<Integer> seatIds = ((List<Number>) data.get("seatIds"))
                    .stream().map(Number::intValue).collect(Collectors.toList());

            // Validation
            if (seatIds.isEmpty() || seatIds.size() > 5) {
                resp.setStatus(400);
                out.print("{\"error\":\"You can select 1 to 5 seats only.\"}");
                return;
            }

            Booking booking = bookingDAO.createBooking(userId, showId, seatIds, paymentMode);
            resp.setStatus(201);
            out.print(mapper.writeValueAsString(booking));

        } catch (IllegalArgumentException e) {
            resp.setStatus(400);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"Booking failed: " + e.getMessage() + "\"}");
        }
    }

    // ── GET — Retrieve Booking ─────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String pathInfo = req.getPathInfo();
        String refParam = req.getParameter("ref");

        try {
            if (pathInfo != null && pathInfo.length() > 1) {
                // GET /api/bookings/{id}
                int id = Integer.parseInt(pathInfo.substring(1));
                Booking b = bookingDAO.getBookingById(id);
                if (b == null) { resp.setStatus(404); out.print("{\"error\":\"Booking not found\"}"); return; }
                out.print(mapper.writeValueAsString(b));

            } else if (refParam != null) {
                // GET /api/bookings?ref=MFxxxx
                Booking b = bookingDAO.getBookingByReference(refParam);
                if (b == null) { resp.setStatus(404); out.print("{\"error\":\"Booking not found\"}"); return; }
                out.print(mapper.writeValueAsString(b));

            } else {
                resp.setStatus(400);
                out.print("{\"error\":\"Provide booking id or ref parameter\"}");
            }

        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

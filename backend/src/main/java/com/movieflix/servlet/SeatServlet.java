package com.movieflix.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieflix.dao.SeatDAO;
import com.movieflix.model.Seat;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * SeatServlet — handles /api/seats/*
 *
 * GET /api/seats?showId={id}  → all seats for a show (with booking status)
 */
@WebServlet(urlPatterns = {"/api/seats/*", "/api/seats"})
public class SeatServlet extends HttpServlet {

    private final SeatDAO      seatDAO = new SeatDAO();
    private final ObjectMapper mapper  = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String showIdParam = req.getParameter("showId");

        try {
            if (showIdParam == null || showIdParam.isBlank()) {
                resp.setStatus(400);
                out.print("{\"error\":\"showId parameter is required\"}");
                return;
            }
            int showId = Integer.parseInt(showIdParam);
            List<Seat> seats = seatDAO.getSeatsByShow(showId);
            out.print(mapper.writeValueAsString(seats));

        } catch (NumberFormatException e) {
            resp.setStatus(400);
            out.print("{\"error\":\"Invalid showId\"}");
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

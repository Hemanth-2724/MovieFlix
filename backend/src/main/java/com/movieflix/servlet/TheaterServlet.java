package com.movieflix.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieflix.dao.TheaterDAO;
import com.movieflix.model.Theater;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * TheaterServlet — handles /api/theaters/*
 *
 * GET /api/theaters                        → all theaters
 * GET /api/theaters?movieId={id}           → theaters showing this movie
 * GET /api/theaters?movieId={id}&date={d}  → theaters showing movie on date
 */
@WebServlet(urlPatterns = {"/api/theaters/*", "/api/theaters"})
public class TheaterServlet extends HttpServlet {

    private final TheaterDAO   theaterDAO = new TheaterDAO();
    private final ObjectMapper mapper     = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String movieIdParam = req.getParameter("movieId");
        String dateParam    = req.getParameter("date");

        try {
            if (movieIdParam != null) {
                int movieId = Integer.parseInt(movieIdParam);
                List<Theater> theaters = theaterDAO.getTheatersForMovie(movieId, dateParam);
                out.print(mapper.writeValueAsString(theaters));
            } else {
                List<Theater> all = theaterDAO.getAllTheaters();
                out.print(mapper.writeValueAsString(all));
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

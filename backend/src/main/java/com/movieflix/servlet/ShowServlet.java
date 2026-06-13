package com.movieflix.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.movieflix.dao.ShowDAO;
import com.movieflix.model.Show;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * ShowServlet — handles /api/shows/*
 *
 * GET /api/shows/{id}                                → single show
 * GET /api/shows?movieId={m}&theaterId={t}&date={d}  → filtered shows
 */
@WebServlet(urlPatterns = {"/api/shows/*", "/api/shows"})
public class ShowServlet extends HttpServlet {

    private final ShowDAO      showDAO = new ShowDAO();
    private final ObjectMapper mapper  = new ObjectMapper()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String pathInfo = req.getPathInfo();

        try {
            if (pathInfo != null && pathInfo.length() > 1) {
                // GET /api/shows/{id}
                int id   = Integer.parseInt(pathInfo.substring(1));
                Show show = showDAO.getShowById(id);
                if (show == null) { resp.setStatus(404); out.print("{\"error\":\"Show not found\"}"); return; }
                out.print(mapper.writeValueAsString(show));
            } else {
                // GET /api/shows?movieId=&theaterId=&date=
                int    movieId   = parseIntParam(req.getParameter("movieId"));
                int    theaterId = parseIntParam(req.getParameter("theaterId"));
                String date      = req.getParameter("date");
                List<Show> shows = showDAO.getShows(movieId, theaterId, date);
                out.print(mapper.writeValueAsString(shows));
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private int parseIntParam(String param) {
        if (param == null || param.isBlank()) return 0;
        try { return Integer.parseInt(param); }
        catch (NumberFormatException e) { return 0; }
    }
}

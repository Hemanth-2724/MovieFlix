package com.movieflix.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.movieflix.dao.MovieDAO;
import com.movieflix.model.Movie;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * MovieServlet — handles /api/movies/*
 *
 * GET /api/movies              → list all active movies
 * GET /api/movies?search=query → search movies
 * GET /api/movies/{id}         → get single movie
 */
@WebServlet(urlPatterns = {"/api/movies/*", "/api/movies"})
public class MovieServlet extends HttpServlet {

    private final MovieDAO     movieDAO = new MovieDAO();
    private final ObjectMapper mapper   = new ObjectMapper()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String pathInfo = req.getPathInfo();     // null or "/{id}"
        String search   = req.getParameter("search");

        try {
            if (pathInfo != null && pathInfo.length() > 1) {
                // GET /api/movies/{id}
                int id    = Integer.parseInt(pathInfo.substring(1));
                Movie mov = movieDAO.getMovieById(id);
                if (mov == null) { resp.setStatus(404); out.print("{\"error\":\"Movie not found\"}"); return; }
                out.print(mapper.writeValueAsString(mov));

            } else if (search != null && !search.isBlank()) {
                // GET /api/movies?search=...
                List<Movie> results = movieDAO.searchMovies(search.trim());
                out.print(mapper.writeValueAsString(results));

            } else {
                // GET /api/movies  — return all
                List<Movie> movies = movieDAO.getAllMovies();
                out.print(mapper.writeValueAsString(movies));
            }

        } catch (NumberFormatException e) {
            resp.setStatus(400);
            out.print("{\"error\":\"Invalid movie id\"}");
        } catch (Exception e) {
            resp.setStatus(500);
            out.print("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

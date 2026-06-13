package com.movieflix.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movieflix.dao.UserDAO;
import com.movieflix.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * UserServlet — handles /api/users/*
 *
 * POST /api/users/register  → register new user
 * POST /api/users/login     → login with email + password
 * GET  /api/users/{id}      → get user profile
 */
@WebServlet(urlPatterns = {"/api/users/*", "/api/users"})
public class UserServlet extends HttpServlet {

    private final UserDAO      userDAO = new UserDAO();
    private final ObjectMapper mapper  = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        String path = req.getPathInfo();          // e.g. "/register" or "/login"
        String body = req.getReader().lines().collect(Collectors.joining());

        try {
            if ("/register".equals(path)) {
                handleRegister(body, resp, out);
            } else if ("/login".equals(path)) {
                handleLogin(body, resp, out);
            } else {
                resp.setStatus(404);
                out.print(json("error", "Endpoint not found"));
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.print(json("error", "Server error: " + e.getMessage()));
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {

        resp.setContentType("application/json;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            String path = req.getPathInfo();   // "/{id}"
            if (path != null && path.length() > 1) {
                int userId = Integer.parseInt(path.substring(1));
                User user = userDAO.findById(userId);
                if (user == null) { resp.setStatus(404); out.print(json("error", "User not found")); return; }
                user.setPassword(null);   // never return password
                out.print(mapper.writeValueAsString(user));
            } else {
                resp.setStatus(400);
                out.print(json("error", "User id required"));
            }
        } catch (Exception e) {
            resp.setStatus(500);
            out.print(json("error", e.getMessage()));
        }
    }

    // ── Private handlers ──────────────────────────────────────────────

    private void handleRegister(String body, HttpServletResponse resp, PrintWriter out)
            throws Exception {

        @SuppressWarnings("unchecked")
        Map<String, Object> data = mapper.readValue(body, Map.class);

        String name  = (String) data.get("name");
        String email = (String) data.get("email");
        String pass  = (String) data.get("password");
        String phone = (String) data.getOrDefault("phone", "");

        // Validation
        if (name == null || email == null || pass == null || name.isBlank() || email.isBlank() || pass.isBlank()) {
            resp.setStatus(400);
            out.print(json("error", "Name, email, and password are required."));
            return;
        }
        if (pass.length() < 6) {
            resp.setStatus(400);
            out.print(json("error", "Password must be at least 6 characters."));
            return;
        }

        if (userDAO.emailExists(email)) {
            resp.setStatus(409);   // Conflict
            out.print(json("error", "Email is already registered."));
            return;
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setPassword(pass);    // plain for demo; hash with BCrypt in prod
        newUser.setPhone(phone);

        int newId = userDAO.register(newUser);
        if (newId == -1) {
            resp.setStatus(500);
            out.print(json("error", "Registration failed. Try again."));
            return;
        }

        resp.setStatus(201);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Account created successfully!");
        result.put("userId", newId);
        out.print(mapper.writeValueAsString(result));
    }

    private void handleLogin(String body, HttpServletResponse resp, PrintWriter out)
            throws Exception {

        @SuppressWarnings("unchecked")
        Map<String, Object> data = mapper.readValue(body, Map.class);

        String email = (String) data.get("email");
        String pass  = (String) data.get("password");

        if (email == null || pass == null) {
            resp.setStatus(400);
            out.print(json("error", "Email and password are required."));
            return;
        }

        User user = userDAO.login(email, pass);
        if (user == null) {
            resp.setStatus(401);
            out.print(json("error", "Invalid email or password."));
            return;
        }

        user.setPassword(null);   // never return password
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Login successful!");
        result.put("user", user);
        out.print(mapper.writeValueAsString(result));
    }

    /** Convenience: build a simple {"key": "value"} JSON string. */
    private String json(String key, Object value) {
        try { return mapper.writeValueAsString(Map.of(key, value)); }
        catch (Exception e) { return "{\"" + key + "\":\"" + value + "\"}"; }
    }
}

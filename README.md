# 🎬 MovieFlix — Full-Stack Movie Ticket Booking App

A production-style movie ticket booking web application built with **React**, **Java EE/JSP/JDBC**, **Apache Tomcat**, and **MySQL**.

---

## 🚀 Getting Started — Step-by-Step Setup

### Step 1 — MySQL Database Setup

1. Open **MySQL Workbench**
2. Connect to your local MySQL server (`localhost:3306`)
3. Open the file: `database/movieflix_schema.sql`
4. Click **Run All (⚡)** to execute
5. You should see output:
   ```
   Movies count:   10
   Theaters count:  5
   Shows count:   600
   Seats count: 60000
   Users count:     1
   ```

> **Note:** Change the MySQL password in `backend/src/main/java/com/movieflix/util/DBConnection.java`:
> ```java
> private static final String DB_PASSWORD = "root"; // ← your password
> ```

---

### Step 2 — Java Backend (Apache Tomcat)

#### Prerequisites
- Java 17+
- Apache Maven 3.8+
- Apache Tomcat 10.x

#### Build the WAR
```bash
cd backend
mvn clean package
```
This produces `backend/target/movieflix.war`

#### Deploy to Tomcat
1. Copy `movieflix.war` to `{TOMCAT_HOME}/webapps/`
2. Start Tomcat: `{TOMCAT_HOME}/bin/startup.bat`
3. Access: `http://localhost:8080/movieflix/api/movies`

You should see JSON with 10 movies.

---

### Step 3 — React Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:3000**

---

## 📱 Application Pages

| Page | URL | Description |
|---|---|---|
| Login | `/login` | Sign in with email/password |
| Register | `/register` | Create new account |
| Home | `/` | Movie listing with search & genre filter |
| Theater Select | `/movie/:id/theaters` | Select theater + showtime |
| Seat Select | `/show/:id/seats` | Interactive seat map (max 5) |
| Payment | `/payment` | UPI or Credit Card (dummy) |
| Confirmation | `/confirmation/:ref` | Animated ticket + booking details |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login |
| GET  | `/api/movies` | All movies |
| GET  | `/api/movies?search=query` | Search movies |
| GET  | `/api/movies/{id}` | Single movie |
| GET  | `/api/theaters?movieId={id}` | Theaters for movie |
| GET  | `/api/shows?movieId=&theaterId=&date=` | Showtimes |
| GET  | `/api/seats?showId={id}` | Seat availability |
| POST | `/api/bookings` | Create booking |
| GET  | `/api/bookings/{id}` | Get booking |
| GET  | `/api/bookings?ref={ref}` | Get by reference |

---

## 🗂️ Project Structure

```
MovieTicketBookingApp/
├── database/
│   └── movieflix_schema.sql     ← Run in MySQL Workbench
├── backend/                     ← Maven WAR → Deploy to Tomcat
│   ├── pom.xml
│   └── src/main/java/com/movieflix/
│       ├── util/DBConnection.java
│       ├── filter/CORSFilter.java
│       ├── model/               ← POJOs
│       ├── dao/                 ← JDBC Data Access
│       └── servlet/             ← HTTP Endpoints
└── frontend/                    ← React + Vite (port 3000)
    └── src/
        ├── pages/               ← 7 page components
        ├── components/          ← Navbar
        ├── api.js               ← Axios API calls
        ├── App.jsx              ← Router
        └── index.css            ← Design system
```

---

## 🎨 Design Features

- 🌑 **Dark cinema theme** with glassmorphism cards
- ✨ **Animated hero** with radial gradient glow
- 🎭 **Movie cards** with poster zoom + overlay on hover
- 🗺️ **Interactive seat map** with animated selection (max 5 seats)
- 💳 **Live card preview** that updates as you type
- 🎊 **Confetti burst** on booking confirmation
- 🎫 **Ticket card** with perforated edge design
- 📱 Fully **responsive** layout

---

## 👤 Demo Credentials

```
Email:    demo@movieflix.com
Password: password123
```

---

## ⚠️ Troubleshooting

| Issue | Fix |
|---|---|
| CORS errors | Ensure Tomcat is on port 8080 and React on 3000 |
| DB connection failed | Update `DB_PASSWORD` in `DBConnection.java` |
| Movies not loading | Start Tomcat first, then React |
| Seats not showing | Verify `seed_shows()` ran successfully in MySQL |

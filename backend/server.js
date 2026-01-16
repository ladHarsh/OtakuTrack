const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://otaku-track.vercel.app",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle common browser requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

app.get('/manifest.json', (req, res) => {
  res.json({
    name: "OtakuTrack",
    short_name: "OtakuTrack",
    description: "Anime tracking and fan community platform",
    start_url: "/",
    display: "standalone",
    theme_color: "#000000",
    background_color: "#ffffff"
  });
});

app.get('/robots.txt', (req, res) => {
  res.status(204).end(); // No content response
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/shows", require("./routes/showRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));
app.use("/api/clubs", require("./routes/clubRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));

  // Any unknown route → return React index.html
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(frontendPath, "index.html"))
  );
} else {
  // Home route in dev mode
  app.get("/", (req, res) => {
    res.json({
      message: "Welcome to OtakuTrack API (Development Mode)",
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        shows: "/api/shows",
        watchlist: "/api/watchlist",
        clubs: "/api/clubs",
        reviews: "/api/reviews",
        admin: "/api/admin",
        analytics: "/api/analytics",
      },
    });
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🎨 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
    );
  }
});

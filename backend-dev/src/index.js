const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { getCorsOptions } = require("./config/cors");
const logger = require("./utils/logger");
const { NODE_ENV } = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const componentRoutes = require("./routes/componentRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const downloadRoutes = require("./routes/downloadRoutes");
const otherComponentRoutes = require("./routes/otherComponentRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const materialPriceRoutes = require("./routes/materialPriceRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Apply CORS middleware
app.use(cors(getCorsOptions(NODE_ENV)));
logger.info('CORS middleware applied');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

logger.info('Loaded environment variables:');
logger.info('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
logger.info('NODE_ENV:', NODE_ENV);

// Enhanced Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `
    =======================
    METHOD: ${req.method}
    URL: ${req.originalUrl}
    STATUS: ${res.statusCode}
    DURATION: ${duration}ms
    HEADERS: ${JSON.stringify(req.headers, null, 2)}
    BODY: ${JSON.stringify(req.body, null, 2)}
    =======================
    `;
    logger.info(logMessage);
  });
  next();
});

// Route handling
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/other-components", otherComponentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/materials", materialPriceRoutes);
app.use("/api/ai", aiRoutes);

// CORS Test Route
app.get('/cors-test', (req, res) => {
  res.json({ message: 'CORS is working' });
});

// 404 Handling
app.use("*", (req, res) => {
  const logMessage = `
  =======================
  404 - Route not found
  METHOD: ${req.method}
  URL: ${req.originalUrl}
  HEADERS: ${JSON.stringify(req.headers, null, 2)}
  BODY: ${JSON.stringify(req.body, null, 2)}
  =======================
  `;
  logger.warn(logMessage);
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const logMessage = `
  =======================
  ERROR: ${err.message}
  STACK: ${err.stack}
  METHOD: ${req.method}
  URL: ${req.originalUrl}
  HEADERS: ${JSON.stringify(req.headers, null, 2)}
  BODY: ${JSON.stringify(req.body, null, 2)}
  =======================
  `;
  logger.error(logMessage);
  res.status(500).json({ error: "An unexpected error occurred", message: err.message });
});

module.exports = app;
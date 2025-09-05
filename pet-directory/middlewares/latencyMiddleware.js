// middlewares/latencyMiddleware.js
module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6; // ms
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${durationMs.toFixed(2)}ms`;

    if (durationMs > 300) {
      console.warn("⚠️ SLOW REQUEST:", logLine); // highlight long-tail requests
    } else {
      console.log(logLine);
    }
  });

  next();
};

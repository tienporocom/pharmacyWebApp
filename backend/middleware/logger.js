// Middleware ghi log request
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next(); // Chuyển tiếp
  };
  
module.exports = loggerMiddleware;
// Middleware ghi log request
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    // bỏ qua log GET /api/chat/messages - 304 SO SÁNH 
    if (req.method == 'GET' && req.originalUrl == '/api/chat/messages') {
      return next(); // Bỏ qua log cho request này
    }
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next(); // Chuyển tiếp
  };
  
module.exports = loggerMiddleware;
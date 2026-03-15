const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://13.251.248.92',
      'https://13.251.248.92',
      'http://www.sfcpcsystem.com',
      'https://www.sfcpcsystem.com',
      'http://sfcpcsystem.com',
      'https://sfcpcsystem.com',
      'http://localhost:5173',
      'https://demo-sfcmes-k2bp-lh2zbrx8x-nusapbs-projects.vercel.app'
    ];

const log = (message, origin) => {
};

const isAllowedOrigin = (origin) => {
  return allowedOrigins.includes(origin);
};

log('Allowed origins:', allowedOrigins);

const corsOptions = {
  origin: true, // Allow all origins for demo/Vercel - can be restricted later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'If-None-Match',
    'If-Match',
    'ETag',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: ['ETag'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 3600 // 1 hour
};

// Helper function to add cache control headers to responses
const addCacheHeaders = (req, res, next) => {
  if (req.method === 'GET') {
    res.set({
      'Cache-Control': 'private, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
};

module.exports = {
  corsOptions,
  addCacheHeaders,
  getCorsOptions: (env) => corsOptions
};
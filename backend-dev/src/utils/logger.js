const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logTransports = [new transports.Console()];

// Only add file transports if not running on Vercel (read-only filesystem)
if (!process.env.VERCEL) {
  logTransports.push(new transports.File({ filename: 'app.log' }));
  logTransports.push(new transports.File({ filename: 'error.log', level: 'error' }));
}

const logger = createLogger({
  format: combine(
    label({ label: 'SFC-MES' }),
    timestamp(),
    colorize(),
    logFormat
  ),
  transports: logTransports
});

module.exports = logger;

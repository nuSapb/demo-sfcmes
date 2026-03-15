require('dotenv').config();
const { createTablesIfNotExist } = require('./src/config/databaseInit');
const logger = require('./src/utils/logger');
const app = require('./src/index');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    await createTablesIfNotExist();
    logger.info('Database tables verified/created successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Database host: ${process.env.DB_HOST}`);

      // Log registered routes
      app._router.stack
        .filter((r) => r.route)
        .forEach((r) => {
          Object.keys(r.route.methods).forEach((method) => {
            logger.info(
              `Route registered: ${method.toUpperCase()} ${r.route.path}`
            );
          });
        });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

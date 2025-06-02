const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor(context) {
    this.context = context;
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
  }

  _log(level, message, data = {}) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level: Object.keys(LOG_LEVELS)[level],
      context: this.context,
      message,
      ...data
    };

    if (level >= LOG_LEVELS.ERROR) {
      console.error(JSON.stringify(logData, null, 2));
    } else if (level >= LOG_LEVELS.WARN) {
      console.warn(JSON.stringify(logData, null, 2));
    } else {
      console.log(JSON.stringify(logData, null, 2));
    }

    // In development, also log to file for debugging
    if (process.env.NODE_ENV === 'development') {
      // You might want to implement file logging here
    }
  }

  debug(message, data = {}) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = {}) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = {}) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error = null, data = {}) {
    const errorData = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        ...error
      }
    } : {};
    
    this._log(LOG_LEVELS.ERROR, message, { ...data, ...errorData });
  }

  // Performance logging
  time(label) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.time(`${this.context}:${label}`);
    }
  }

  timeEnd(label) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.timeEnd(`${this.context}:${label}`);
    }
  }
}

// Create loggers for different contexts
export const createLogger = (context) => new Logger(context);

// Default logger
export default new Logger('app'); 
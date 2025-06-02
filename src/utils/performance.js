import logger from './logger';

const performanceLogger = logger.createLogger('performance');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.marks = new Map();
  }

  // Mark the start of an operation
  mark(name) {
    this.marks.set(name, performance.now());
    performanceLogger.debug(`Mark: ${name}`);
  }

  // Measure time between two marks
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (!start || !end) {
      performanceLogger.warn('Missing marks for measurement', { name, startMark, endMark });
      return;
    }

    const duration = end - start;
    this.metrics.set(name, duration);

    performanceLogger.info(`Measure: ${name}`, {
      duration,
      startMark,
      endMark
    });

    return duration;
  }

  // Track a specific operation with timing
  async trackOperation(name, operation) {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.metrics.set(name, duration);
      performanceLogger.info(`Operation completed: ${name}`, { duration });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceLogger.error(`Operation failed: ${name}`, error, { duration });
      throw error;
    }
  }

  // Get metrics for analysis
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
    this.marks.clear();
  }
}

export const performance = new PerformanceMonitor();

// Decorator for tracking method performance
export function track(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args) {
    const methodName = `${target.constructor.name}.${propertyKey}`;
    return performance.trackOperation(methodName, () => originalMethod.apply(this, args));
  };

  return descriptor;
}

export default performance; 
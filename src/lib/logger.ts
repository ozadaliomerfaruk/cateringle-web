// ==============================================
// STRUCTURED LOGGER
// Production'da log aggregation ile kullanılır
// ==============================================

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  requestId?: string;
  userId?: string;
  vendorId?: string;
  action?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Environment'a göre minimum log level
const MIN_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const logObject = {
    timestamp,
    level,
    message,
    ...context,
  };

  // Production'da JSON format (log aggregation için)
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(logObject);
  }

  // Development'ta okunabilir format
  const contextStr = context ? ` ${JSON.stringify(context, null, 0)}` : "";
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (shouldLog("debug")) {
      console.debug(formatLog("debug", message, context));
    }
  },

  info(message: string, context?: LogContext) {
    if (shouldLog("info")) {
      console.info(formatLog("info", message, context));
    }
  },

  warn(message: string, context?: LogContext) {
    if (shouldLog("warn")) {
      console.warn(formatLog("warn", message, context));
    }
  },

  error(message: string, error?: unknown, context?: LogContext) {
    if (shouldLog("error")) {
      const errorContext = {
        ...context,
        error:
          error instanceof Error
            ? {
                message: error.message,
                name: error.name,
                stack:
                  process.env.NODE_ENV !== "production"
                    ? error.stack
                    : undefined,
              }
            : error,
      };
      console.error(formatLog("error", message, errorContext));
    }
  },
};

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// ==============================================
// USAGE EXAMPLES:
// ==============================================
//
// import { logger, generateRequestId } from "@/lib/logger";
//
// // API Route'ta:
// const requestId = generateRequestId();
// logger.info("Lead created", { requestId, leadId, vendorId });
//
// // Error handling:
// try {
//   await doSomething();
// } catch (error) {
//   logger.error("Failed to create lead", error, { requestId, userId });
// }
//
// // Development'ta debug:
// logger.debug("Query params", { params });

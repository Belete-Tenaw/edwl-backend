/**
 * metricsService.js
 *
 * Prometheus-compatible metrics for the EDWL backend.
 * Exposes the /metrics endpoint consumed by Prometheus scraper.
 * Uses prom-client with default process + Node.js metrics enabled.
 *
 * Usage:
 *   const metrics = require('./metricsService');
 *   app.use(metrics.httpMiddleware);      // instrument all requests
 *   app.get('/metrics', metrics.handler); // expose scrape endpoint
 */

let client;
try {
    client = require('prom-client');
} catch {
    // prom-client not yet installed — provide a no-op stub so the server
    // still starts during development without the package.
    console.warn('[Metrics] prom-client not installed. Metrics disabled.');
    module.exports = {
        httpMiddleware: (_req, _res, next) => next(),
        handler: (_req, res) => res.status(503).send('# Metrics unavailable: prom-client not installed\n'),
        incrementActiveConnections: () => {},
        decrementActiveConnections: () => {},
    };
    return;
}

// ── Collect default Node.js process metrics (heap, CPU, event loop lag) ──────
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'edwl_node_' });

// ── Custom Metrics ─────────────────────────────────────────────────────────────

/** Total HTTP requests, labelled by method, route, and status code */
const httpRequestsTotal = new client.Counter({
    name: 'edwl_http_requests_total',
    help: 'Total number of HTTP requests received',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

/** HTTP request duration histogram (bucketed in ms) */
const httpRequestDuration = new client.Histogram({
    name: 'edwl_http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
    registers: [register],
});

/** Active Socket.IO connections */
const activeSocketConnections = new client.Gauge({
    name: 'edwl_socket_connections_active',
    help: 'Number of currently active Socket.IO connections',
    registers: [register],
});

/** API errors total */
const apiErrorsTotal = new client.Counter({
    name: 'edwl_api_errors_total',
    help: 'Total number of API errors (4xx and 5xx)',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

/** Business events: logins, verifications, subscriptions */
const businessEvents = new client.Counter({
    name: 'edwl_business_events_total',
    help: 'Count of key business events (logins, verifications, subscriptions)',
    labelNames: ['event_type'],
    registers: [register],
});

// ── Express Middleware ─────────────────────────────────────────────────────────

/**
 * Attach to app with: app.use(metricsService.httpMiddleware)
 * Instruments every request for duration and count.
 */
const httpMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        // Normalise dynamic route segments (:id, UUIDs, numbers) for cardinality control
        const route = req.route
            ? req.baseUrl + req.route.path
            : req.path.replace(/\/[0-9a-f-]{8,}/gi, '/:id').replace(/\/\d+/g, '/:id');

        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode,
        };

        httpRequestsTotal.inc(labels);
        httpRequestDuration.observe(labels, Date.now() - start);

        if (res.statusCode >= 400) {
            apiErrorsTotal.inc(labels);
        }
    });

    next();
};

// ── Scrape Endpoint Handler ────────────────────────────────────────────────────

/**
 * Attach to app with: app.get('/metrics', metricsService.handler)
 * Should be protected from public internet in production (add IP whitelist or
 * internal network restriction via reverse proxy).
 */
const handler = async (_req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err.message);
    }
};

// ── Socket.IO Helpers ──────────────────────────────────────────────────────────

const incrementActiveConnections = () => activeSocketConnections.inc();
const decrementActiveConnections = () => activeSocketConnections.dec();

// ── Business Event Helper ──────────────────────────────────────────────────────

/**
 * Call from controllers to track business events.
 * @param {'LOGIN'|'VERIFICATION'|'SUBSCRIPTION'|'CODE_REDEEMED'|'ESCROW_FUNDED'|'ESCROW_RELEASED'} eventType
 */
const trackEvent = (eventType) => businessEvents.inc({ event_type: eventType });

module.exports = {
    httpMiddleware,
    handler,
    incrementActiveConnections,
    decrementActiveConnections,
    trackEvent,
    register,
};

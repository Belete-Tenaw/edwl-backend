import { API_HEALTH_URL } from './api';

const HEALTH_TIMEOUT_MS = 4500;

export const checkPlatformHealth = async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return { ok: false, reason: 'offline' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    try {
        const response = await fetch(API_HEALTH_URL, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
        });

        return {
            ok: response.ok,
            reason: response.ok ? 'ok' : 'unhealthy',
            status: response.status,
        };
    } catch (error) {
        return {
            ok: false,
            reason: error.name === 'AbortError' ? 'timeout' : 'unreachable',
        };
    } finally {
        clearTimeout(timeoutId);
    }
};

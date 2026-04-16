import api from './api';

export type TrackingEventType = 'LOGIN' | 'CART_ADD' | 'CART_CHECKOUT' | 'PAGE_VIEW';

let sessionId = localStorage.getItem('cyna_session_id');
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('cyna_session_id', sessionId);
}

export function trackEvent(
    type: TrackingEventType,
    userId?: string | number,
    metadata?: Record<string, any>,
) {
    api
        .post('/tracking/event', {
            type,
            userId: userId ? String(userId) : undefined,
            sessionId,
            metadata,
        })
        .catch(() => {
            // Tracking is fire-and-forget
        });
}

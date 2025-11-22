/**
 * API endpoints configuration
 * Centralizes all backend API URLs
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const APIS = {
    CHAT: {
        SEND_MESSAGE: `${BACKEND_URL}/api/chat/`
    }
};

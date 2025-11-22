/**
 * Chat service - handles all chat-related API calls
 */

import sendRequest from '../utils/sendRequest';
import { APIS } from '../constants/apis';

/**
 * Sends a message to the chatbot backend
 * @param {Object} params - Request parameters
 * @param {Array} params.chatHistory - Array of chat messages
 * @param {Function} params.onSuccess - Success callback with response data
 * @param {Function} params.onError - Error callback with error message
 */
export const sendMessage = ({ chatHistory, onSuccess, onError }) => {
    // Format chat history for backend API
    const contents = chatHistory.map(({ role, text }) => ({
        role,
        parts: [{ text }]
    }));

    sendRequest({
        url: APIS.CHAT.SEND_MESSAGE,
        method: 'post',
        data: { contents },
        thenFunction(response) {
            try {
                // Extract the AI response from the backend response
                const apiResponseText = response.data.candidates[0].content.parts[0].text
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .trim();

                onSuccess(apiResponseText);
            } catch (error) {
                onError('Error al procesar la respuesta del servidor');
            }
        },
        catchFunction(error) {
            const errorMessage = error.response?.data?.error ||
                error.message ||
                'Error al comunicarse con el servidor';
            onError(errorMessage);
        }
    });
};

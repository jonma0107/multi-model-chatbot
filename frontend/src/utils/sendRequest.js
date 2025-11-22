/**
 * Generic HTTP request utility using axios
 * Simplified version inspired by the provided example
 */

import axios from 'axios';

/**
 * Sends an HTTP request with standardized configuration
 * @param {Object} config - Request configuration
 * @param {string} config.url - Request URL
 * @param {string} [config.method='get'] - HTTP method
 * @param {Object} [config.data={}] - Request body data
 * @param {Object} [config.params={}] - URL query parameters
 * @param {Function} config.thenFunction - Success callback
 * @param {Function} [config.catchFunction] - Error callback
 * @param {Function} [config.finallyFunction] - Finally callback
 * @param {Object} [config.extraConfig={}] - Additional axios config
 */
const sendRequest = async ({
    url,
    method = 'get',
    data = {},
    params = {},
    extraConfig = {},
    thenFunction,
    catchFunction,
    finallyFunction
}) => {
    const axiosConfig = {
        url,
        method,
        data,
        params,
        headers: {
            'Content-Type': 'application/json'
        },
        ...extraConfig
    };

    await axios(axiosConfig)
        .then((response) => thenFunction(response))
        .catch((error) => {
            console.error('Request error:', error);
            if (catchFunction) {
                catchFunction(error);
            }
        })
        .finally(() => {
            if (finallyFunction) {
                finallyFunction();
            }
        });
};

export default sendRequest;

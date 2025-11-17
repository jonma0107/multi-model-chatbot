// Archivo de ejemplo de configuración
// Copia este archivo como 'config.js' y añade tu configuración real

const CONFIG = {
    // Obtén tu API key de Google Gemini en: https://makersuite.google.com/app/apikey
    GEMINI_API_KEY: "TU_API_KEY_AQUI",
    
    // Configuración de Ollama (modelo local)
    // Si tienes Ollama instalado localmente, configura estos valores
    OLLAMA_URL: "http://localhost:11434/api/generate",
    OLLAMA_MODEL: "mistral:latest", // Cambia según tu modelo (ejecuta 'ollama list' para ver modelos disponibles)
    
    // Modelo por defecto: 'gemini' o 'ollama'
    DEFAULT_MODEL: "gemini"
};


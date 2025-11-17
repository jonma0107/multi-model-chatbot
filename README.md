# Chatbot AI con Google Gemini y Ollama

Un chatbot interactivo que puede utilizar:
- **Google Gemini API** - Modelo en la nube (requiere conexión a internet)
- **Ollama** - Modelos locales (funciona offline)

## 🚀 Configuración

### 1. Clonar el repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd Chatbot-AI
```

### 2. Configurar la API Key de Gemini

1. Copia el archivo de ejemplo de configuración:
   ```bash
   cp config.example.js config.js
   ```

2. Obtén tu API key de Google Gemini:
   - Visita: https://makersuite.google.com/app/apikey
   - Crea una nueva API key

3. Edita el archivo `config.js` y reemplaza `TU_API_KEY_AQUI` con tu API key real

### 3. (Opcional) Configurar Ollama para uso local

Si quieres usar modelos locales sin internet:

1. Instala Ollama desde: https://ollama.ai/download

2. Descarga un modelo (por ejemplo, Mistral):
   ```bash
   ollama pull mistral
   ```

3. Verifica tus modelos disponibles:
   ```bash
   ollama list
   ```

4. Asegúrate de que Ollama esté ejecutándose:
   ```bash
   ollama serve
   ```

5. Actualiza `config.js` con el nombre de tu modelo:
   ```javascript
   OLLAMA_MODEL: "mistral:latest"  // o el modelo que hayas descargado
   ```

### 4. Ejecutar el proyecto

Simplemente abre el archivo `index.html` en tu navegador web.

## ⚠️ Seguridad

**IMPORTANTE:** Nunca subas el archivo `config.js` al repositorio. Este archivo contiene tu API key personal y está incluido en `.gitignore`.

## 📁 Estructura del proyecto

```
Chatbot-AI/
├── index.html          # Estructura HTML del chatbot
├── style.css           # Estilos del chatbot
├── script.js           # Lógica del chatbot
├── config.js           # Configuración (NO SUBIR - local)
├── config.example.js   # Plantilla de configuración
├── .gitignore          # Archivos a ignorar por git
└── README.md           # Este archivo
```

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Google Gemini API
- Ollama (opcional)
- Emoji Mart

## 💡 Uso

1. Abre el chatbot en tu navegador
2. Usa el selector en la parte superior derecha para elegir el modelo:
   - **Gemini (API)**: Usa el modelo en la nube de Google
   - **Ollama (Local)**: Usa tu modelo local (requiere Ollama ejecutándose)
3. Escribe tu mensaje y presiona Enter o el botón de enviar

## 📝 Notas

- El archivo `config.js` debe ser creado manualmente después de clonar el repositorio
- **Para usar Gemini**: Requiere conexión a internet y API key válida
- **Para usar Ollama**: Requiere Ollama instalado y ejecutándose localmente
- Puedes cambiar entre modelos en cualquier momento durante la conversación
- El historial del chat se mantiene al cambiar de modelo


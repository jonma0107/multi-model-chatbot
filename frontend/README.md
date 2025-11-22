# Chatbot AI - Frontend

Una interfaz de chatbot moderna y hermosa construida con React y Vite, integrada con un backend Django para conversaciones impulsadas por IA.

## Características

- **Diseño UI Moderno**: Interfaz hermosa con gradientes y efectos de ondas de agua
- **Impulsado por IA**: Integrado con Google Gemini AI a través del backend Django
- **Rápido y Responsivo**: Construido con Vite para un desarrollo ultrarrápido
- **Arquitectura Limpia**: Patrón profesional de capa de servicios para comunicación API
- **Listo para Docker**: Completamente containerizado para fácil despliegue

## Arquitectura

### Capa de Servicios

El frontend usa una arquitectura de capa de servicios limpia y mantenible:

```
src/
├── components/          # Componentes React
│   ├── ChatbotIcon.jsx
│   ├── ChatForm.jsx
│   └── ChatMessage.jsx
├── constants/
│   └── apis.js         # Endpoints API centralizados
├── services/
│   └── chatService.js  # Llamadas API específicas del chat
├── utils/
│   └── sendRequest.js  # Utilidad genérica de peticiones HTTP
└── App.jsx             # Componente principal de la aplicación
```

#### Archivos Clave

- **`constants/apis.js`**: Configuración centralizada de endpoints API
- **`utils/sendRequest.js`**: Utilidad genérica de peticiones HTTP usando axios
- **`services/chatService.js`**: Capa de servicio específica del chat que maneja el formateo de mensajes y comunicación API
- **`App.jsx`**: Componente principal que usa la capa de servicios para una separación limpia de responsabilidades

### Integración con Backend

El frontend se comunica con el backend Django en `http://localhost:8000/api/chat/`:

```javascript
// Ejemplo: Enviando un mensaje
import { sendMessage } from './services/chatService';

sendMessage({
  chatHistory: history,
  onSuccess: (responseText) => {
    // Manejar respuesta exitosa
  },
  onError: (errorMessage) => {
    // Manejar error
  }
});
```

## Primeros Pasos

### Prerequisitos

- Node.js 18+
- npm o yarn
- Docker (opcional, para despliegue containerizado)

### Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   
   Crear un archivo `.env` en el directorio frontend:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```

3. **Ejecutar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

### Despliegue con Docker

Ejecutar con Docker Compose (desde la raíz del proyecto):

```bash
docker-compose up
```

Esto iniciará tanto el frontend como el backend.

## Desarrollo

### Scripts Disponibles

- `npm run dev` - Iniciar servidor de desarrollo con recarga en caliente
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar ESLint

### Estructura del Proyecto

```
frontend/
├── public/              # Recursos estáticos
├── src/
│   ├── components/      # Componentes React reutilizables
│   ├── constants/       # Constantes de configuración
│   ├── services/        # Capa de servicios API
│   ├── utils/           # Funciones utilitarias
│   ├── App.jsx          # Aplicación principal
│   ├── index.css        # Estilos globales
│   └── main.jsx         # Punto de entrada de la aplicación
├── .env                 # Variables de entorno
├── Dockerfile           # Configuración Docker
├── package.json         # Dependencias y scripts
└── vite.config.js       # Configuración Vite
```

## Dependencias

### Core
- **React 19.2.0** - Librería UI
- **Vite 7.2.2** - Herramienta de construcción y servidor de desarrollo

### Cliente HTTP
- **axios** - Cliente HTTP basado en promesas para peticiones API

### Desarrollo
- **ESLint** - Linting de código
- **@vitejs/plugin-react** - Soporte React para Vite

## Integración API

El frontend usa un patrón de capa de servicios profesional inspirado en aplicaciones empresariales:

1. **Endpoints Centralizados** (`constants/apis.js`):
   ```javascript
   export const APIS = {
     CHAT: {
       SEND_MESSAGE: `${BACKEND_URL}/api/chat/`
     }
   };
   ```

2. **Utilidad Genérica de Peticiones** (`utils/sendRequest.js`):
   - Maneja todos los métodos HTTP
   - Manejo centralizado de errores
   - API basada en callbacks

3. **Servicios Específicos por Funcionalidad** (`services/chatService.js`):
   - API limpia para componentes
   - Formateo de peticiones/respuestas
   - Encapsulación de lógica de negocio

### Beneficios

- ✅ **Separación de Responsabilidades**: Lógica API separada de componentes UI
- ✅ **Mantenibilidad**: Fácil actualizar endpoints o agregar nuevos servicios
- ✅ **Reutilización**: Utilidades genéricas pueden usarse en todas las funcionalidades
- ✅ **Testabilidad**: Los servicios pueden probarse de forma independiente
- ✅ **Escalabilidad**: Fácil agregar autenticación, interceptores o middleware

## Variables de Entorno

| Variable | Descripción | Por Defecto |
|----------|-------------|-------------|
| `VITE_BACKEND_URL` | URL del backend Django | `http://localhost:8000` |

## Características de Diseño

- **Encabezado con Gradiente**: Gradiente púrpura con branding del chatbot
- **Efecto de Ondas de Agua**: Fondo interactivo usando jQuery Ripples
- **Animaciones Suaves**: Experiencia de usuario pulida con transiciones CSS
- **Diseño Responsivo**: Funciona en dispositivos de escritorio y móviles
- **Burbujas de Mensaje Limpias**: Estilos distintos para mensajes de usuario y bot

## Solución de Problemas

### Problemas Comunes

1. **Error "Axios not found"**:
   ```bash
   # Instalar dependencias en el contenedor Docker
   docker-compose exec frontend npm install
   ```

2. **Conexión rechazada con el backend**:
   - Asegúrate de que el backend esté corriendo en el puerto 8000
   - Verifica `VITE_BACKEND_URL` en `.env`
   - Verifica la configuración CORS en el backend Django

3. **La página no carga**:
   - Limpia el caché del navegador
   - Revisa la consola del navegador para errores
   - Reinicia el servidor de desarrollo

## Contribuir

1. Sigue la estructura de código existente
2. Usa la capa de servicios para todas las llamadas API
3. Mantén estilos consistentes
4. Prueba los cambios tanto en desarrollo como en entornos Docker

## Licencia

Este proyecto es parte de un ejercicio de aprendizaje de chatbot.

## Documentación Relacionada

- [README Backend](../backend/README.md)
- [Configuración Docker](../DOCKER_README.md)

// ============================================
// SELECTORES DEL DOM - Para acceder a elementos HTML
// ============================================
const chatBody = document.querySelector('.chat-body'); // Contenedor donde se muestran los mensajes
const messageInput = document.querySelector('.message-input'); // Campo de texto donde el usuario escribe
const sendMessageButton = document.querySelector('#send-message'); // Botón para enviar mensajes
const modelSelect = document.querySelector('#model-select'); // Selector para cambiar entre Gemini y Ollama

// ============================================
// CONFIGURACIÓN DE APIs - URLs para conectar con los modelos
// ============================================
// URL completa de Gemini API con la clave de autenticación
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

// ============================================
// ESTADO DE LA APLICACIÓN - Datos que se mantienen durante la sesión
// ============================================
const userData = {
    message: null, // Almacena el mensaje actual del usuario antes de enviarlo
    currentModel: CONFIG.DEFAULT_MODEL || 'gemini' // Modelo seleccionado actualmente (gemini u ollama)
}

// Historial de conversación - Guarda todos los mensajes para mantener contexto
// Formato: [{role: 'user', parts: [{text: '...'}]}, {role: 'model', parts: [{text: '...'}]}]
const chatHistory = [];

// ============================================
// INICIALIZACIÓN - Configurar valores por defecto
// ============================================
// Sincronizar el selector visual con el modelo configurado
modelSelect.value = userData.currentModel;

// ============================================
// MANEJO DE CAMBIO DE MODELO - Para evitar confusión de contexto
// ============================================
// Cuando el usuario cambia de Gemini a Ollama (o viceversa), preguntar si limpiar historial
// Esto evita que un modelo "piense" que es el otro por el contexto previo
modelSelect.addEventListener('change', (e) => {
    const previousModel = userData.currentModel;
    userData.currentModel = e.target.value;
    
    console.log(`Modelo cambiado de ${previousModel} a ${userData.currentModel}`);
    
    // Preguntar si desea limpiar el historial
    if (chatHistory.length > 0) {
        const clearHistory = confirm('¿Deseas limpiar el historial de conversación al cambiar de modelo?\n\nEsto puede evitar confusión de contexto entre modelos diferentes.');
        
        if (clearHistory) {
            chatHistory.length = 0; // Limpiar el array
            console.log('Historial limpiado');
            
            // Limpiar visualmente el chat (mantener solo el mensaje de bienvenida)
            const messages = chatBody.querySelectorAll('.message');
            messages.forEach((msg, index) => {
                if (index > 0) { // Mantener el primer mensaje (bienvenida)
                    msg.remove();
                }
            });
        }
    }
});

// ============================================
// UTILIDADES - Funciones auxiliares reutilizables
// ============================================
// Crea elementos HTML para mensajes (del usuario o del bot)
// Recibe el contenido HTML y clases CSS adicionales para estilizar
const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// ============================================
// GENERACIÓN DE RESPUESTAS - Lógica para cada modelo
// ============================================
// Genera respuesta usando Gemini API (modelo en la nube de Google)
// No modifica chatHistory directamente, solo retorna la respuesta
const generateGeminiResponse = async (messageElement, userMessage) => {
    // Crear copia temporal del historial con el nuevo mensaje
    // Esto permite enviar el contexto completo a Gemini sin modificar el historial original
    const tempHistory = [...chatHistory, { 
        role: 'user',
        parts: [{ text: userMessage }]
    }];

    // Configurar petición HTTP POST a la API de Gemini
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Indicar que enviamos JSON
        },
        body: JSON.stringify({
            contents: tempHistory // Enviar todo el historial para mantener contexto
        })
    }

    try {
        // Enviar petición y esperar respuesta
        const response = await fetch(GEMINI_API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Extraer el texto de la respuesta del bot desde la estructura JSON de Gemini
        const apiResponseText = data.candidates[0].content.parts[0].text.trim();
        messageElement.innerText = apiResponseText; // Mostrar respuesta en la UI

        // Retornar la respuesta para que pueda ser guardada en el historial
        return apiResponseText;

    } catch (error) {
        console.log(error);
        messageElement.innerText = 'Error: No se pudo obtener respuesta de Gemini.';
        messageElement.style.color = '#e55865';
        throw error;
    }
}

// Genera respuesta usando Ollama (modelo local instalado en tu computadora)
// Ollama usa un formato de prompt diferente a Gemini (texto plano en lugar de JSON estructurado)
const generateOllamaResponse = async (messageElement, userMessage) => {
    // Construir el prompt con el historial en formato texto
    // Ollama necesita el contexto como texto plano, no como JSON estructurado
    let prompt = '';
    
    // Convertir el historial JSON a formato de conversación texto
    chatHistory.forEach(entry => {
        if (entry.role === 'user') {
            prompt += `Usuario: ${entry.parts[0].text}\n`;
        } else {
            prompt += `Asistente: ${entry.parts[0].text}\n`;
        }
    });
    
    // Agregar el mensaje actual del usuario y preparar para la respuesta del asistente
    prompt += `Usuario: ${userMessage}\nAsistente:`;

    // Configurar petición HTTP POST a Ollama local (localhost:11434)
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: CONFIG.OLLAMA_MODEL, // Nombre del modelo (ej: "mistral:latest")
            prompt: prompt, // El prompt completo con historial
            stream: false // false = respuesta completa, true = streaming (respuesta en tiempo real)
        })
    }

    try {
        // Enviar petición al servidor Ollama local
        const response = await fetch(CONFIG.OLLAMA_URL, requestOptions);
        const data = await response.json();
        
        if (!response.ok) throw new Error('Error en la respuesta de Ollama');

        // Ollama retorna la respuesta en data.response (diferente estructura que Gemini)
        const apiResponseText = data.response.trim();
        messageElement.innerText = apiResponseText; // Mostrar respuesta en la UI

        // Retornar la respuesta para que pueda ser guardada en el historial
        return apiResponseText;

    } catch (error) {
        console.log(error);
        messageElement.innerText = 'Error: No se pudo conectar con Ollama. Asegúrate de que Ollama esté ejecutándose.';
        messageElement.style.color = '#e55865';
        throw error;
    }
}

// ============================================
// ROUTER DE RESPUESTAS - Decide qué modelo usar y maneja el historial
// ============================================
// Función principal que coordina la generación de respuestas
// Actúa como "router": decide si usar Gemini u Ollama según la selección del usuario
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector('.message-text');
    const userMessage = userData.message;

    try {
        let botResponse;
        
        // Log para debugging: saber qué modelo está procesando
        const modelName = userData.currentModel === 'ollama' ? 'Ollama (Mistral)' : 'Gemini';
        console.log(`Generando respuesta con: ${modelName}`);
        
        // Decidir qué función llamar según el modelo seleccionado
        if (userData.currentModel === 'ollama') {
            botResponse = await generateOllamaResponse(messageElement, userMessage);
        } else {
            botResponse = await generateGeminiResponse(messageElement, userMessage);
        }

        // IMPORTANTE: Agregar AMBOS mensajes al historial SOLO después de obtener respuesta exitosa
        // Esto evita duplicaciones y mantiene el historial limpio
        chatHistory.push({ 
            role: 'user',
            parts: [{ text: userMessage }]
        });
        chatHistory.push({
            role: 'model',
            parts: [{ text: botResponse }]
        });
        
        // Remover la clase "thinking" para ocultar la animación de carga
        incomingMessageDiv.classList.remove('thinking');

    } catch (error) {
        // Si hay error, no agregamos nada al historial
        console.error('Error al generar respuesta:', error);
        incomingMessageDiv.classList.remove('thinking');
    }
}

// ============================================
// MANEJO DE MENSAJES DEL USUARIO - Procesa cuando el usuario envía un mensaje
// ============================================
// Se ejecuta cuando el usuario presiona Enter o hace clic en enviar
const handleOutgoingMessage = (e) => {
    e.preventDefault(); // Prevenir recarga de página si es un formulario
    userData.message = messageInput.value.trim(); // Guardar mensaje y eliminar espacios
    messageInput.value = ''; // Limpiar el campo de texto

    // Crear y mostrar el mensaje del usuario en la UI (burbuja azul a la derecha)
    const messageContent = `<div class="message-text"></div>`;

    const outgoingMessageDiv = createMessageElement(messageContent,'user-message');
    outgoingMessageDiv.querySelector('.message-text').textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv); // Agregar al contenedor de mensajes


    // Simular que el bot está "pensando" antes de responder
    // El delay de 600ms da una sensación más natural (no responde instantáneamente)
    setTimeout(() => {
        const messageContent = `<svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                    <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                </svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>

                    </div>
                </div>`;

        // Crear elemento de mensaje del bot con animación de "pensando" (tres puntos animados)
        const incomingMessageDiv = createMessageElement(messageContent,'bot-message', 'thinking');        
        chatBody.appendChild(incomingMessageDiv);

        // Llamar a la función que genera la respuesta real del bot
        // Esta función actualizará el contenido del mensaje cuando tenga la respuesta
        generateBotResponse(incomingMessageDiv);
    }, 600);
}

// ============================================
// EVENT LISTENERS - Escuchar acciones del usuario
// ============================================
// Permitir enviar mensaje presionando Enter (en lugar de solo hacer clic en el botón)
messageInput.addEventListener('keydown', (e) => {
    const userMessage = e.target.value.trim();
    if (e.key === 'Enter' && userMessage) { // Solo enviar si hay texto
        handleOutgoingMessage(e);
    }
});

// ============================================
// EMOJI PICKER - Selector de emojis para enriquecer los mensajes
// ============================================
// Inicializar el selector de emojis usando la librería EmojiMart
const picker = new EmojiMart.Picker({
    theme: 'light', // Tema claro
    skinTonePosition: 'none', // No mostrar selector de tono de piel
    previewPosition: 'none', // No mostrar vista previa
    onEmojiSelect: (emoji) => {
        // Cuando se selecciona un emoji, insertarlo en la posición del cursor
        const {selectionStart: start, selectionEnd: end} = messageInput;
        messageInput.setRangeText(emoji.native, start, end, 'end');
        messageInput.focus(); // Mantener el foco en el campo de texto
    },
    onClickOutside: (e) => {
        // Mostrar/ocultar el selector al hacer clic fuera o en el botón
        if(e.target.id === 'open-emoji-picker') {
            document.body.classList.toggle('show-emoji-picker');            
        } else {
            document.body.classList.remove('show-emoji-picker');
        }
    }
});

// Agregar el selector de emojis al formulario del chat
document.querySelector('.chat-form').appendChild(picker);

// Permitir enviar mensaje haciendo clic en el botón de enviar (flecha hacia arriba)
sendMessageButton.addEventListener('click', (e) => handleOutgoingMessage(e))


$('#ripple').ripples({
	resolution: 512,
	dropRadius: 20,
	perturbance: 0.04,
});
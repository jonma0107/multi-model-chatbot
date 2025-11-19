import { useState, useEffect } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);

  const generateBotResponse = async (history) => {
    // Update chat history with bot's response
    const updateHistory = (text) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text !== "Thinking..."), {role: "model", text}]);
    };
     
    // Format chat history for API request
    history = history.map(({role, text}) => ({role, parts: [{text}]}));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({contents: history})
    };

    try {
      // Send request to API
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      const data = await response.json();
      if(!response.ok) throw new Error(data.error.message || "Something went wrong!");
      // Clean and update chat history with bot's response
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      updateHistory(apiResponseText);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Inicializar ripples después de que el componente se monte
    const initRipples = () => {
      if (window.$ && window.$.fn.ripples) {
        const $container = window.$('.main');
        if ($container.length) {
          $container.ripples({
            resolution: 512,
            dropRadius: 20,
            perturbance: 0.04,
          });
        }
      } else {
        // Si jQuery aún no está disponible, intentar de nuevo después de un breve delay
        setTimeout(initRipples, 100);
      }
    };

    // Esperar un momento para asegurar que los scripts se hayan cargado
    setTimeout(initRipples, 100);
  }, []);

  return (
    <div className="container main">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
        </div>
        {/* Chatbot Body */}
        <div className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there 👋 <br /> How can I help you today?
            </p>
          </div>

          {/* Chat History */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
          
        </div>

        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};

export default App;
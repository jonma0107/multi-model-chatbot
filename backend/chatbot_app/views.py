from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import requests


class ChatAPIView(APIView):
    """
    API View para manejar las peticiones del chatbot.
    Recibe el historial de chat y devuelve la respuesta del modelo Gemini.
    """
    
    def post(self, request):
        """
        Procesa mensajes del chatbot y retorna respuestas del modelo Gemini.
        
        Request body format:
        {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": "mensaje del usuario"}]
                }
            ]
        }
        
        Returns:
            Response: Respuesta del modelo Gemini o mensaje de error
        """
        try:
            # Validar que se recibió el contenido
            contents = request.data.get('contents')
            if not contents:
                return Response(
                    {'error': 'El campo "contents" es requerido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar que la API key esté configurada
            if not settings.GEMINI_API_KEY:
                return Response(
                    {'error': 'API key no configurada en el servidor'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Obtener respuesta del modelo
            gemini_response = self._call_gemini_api(contents)
            
            # Limpiar y retornar la respuesta
            cleaned_response = self._clean_response(gemini_response)
            return Response(cleaned_response, status=status.HTTP_200_OK)
            
        except requests.exceptions.Timeout:
            return Response(
                {'error': 'Tiempo de espera agotado al comunicarse con el modelo de IA'},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Error de conexión: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _call_gemini_api(self, contents):
        """
        Realiza la petición a la API de Gemini.
        
        Args:
            contents: Historial de conversación
            
        Returns:
            dict: Respuesta de la API de Gemini
            
        Raises:
            requests.exceptions.RequestException: Si hay error en la petición
        """
        api_url = f"{settings.GEMINI_API_URL}?key={settings.GEMINI_API_KEY}"
        
        headers = {
            'Content-Type': 'application/json'
        }
        
        payload = {
            'contents': contents
        }
        
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Verificar si la petición fue exitosa
        if not response.ok:
            error_data = response.json()
            error_message = error_data.get('error', {}).get('message', 'Error al comunicarse con el modelo de IA')
            raise requests.exceptions.RequestException(error_message)
        
        return response.json()
    
    def _clean_response(self, data):
        """
        Limpia el formato markdown de la respuesta del modelo.
        
        Args:
            data: Respuesta de la API de Gemini
            
        Returns:
            dict: Respuesta con texto limpio
        """
        if 'candidates' in data and len(data['candidates']) > 0:
            try:
                text = data['candidates'][0]['content']['parts'][0]['text']
                # Remover formato markdown de negritas
                cleaned_text = text.replace('**', '').strip()
                data['candidates'][0]['content']['parts'][0]['text'] = cleaned_text
            except (KeyError, IndexError):
                # Si la estructura no es la esperada, retornar sin modificar
                pass
        
        return data

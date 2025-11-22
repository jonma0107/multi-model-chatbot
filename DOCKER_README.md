# 🐳 Docker Setup for Chatbot AI

Este proyecto usa Docker y Docker Compose para ejecutar el backend (Django) y frontend (Vite React) en contenedores.

## 📋 Requisitos Previos

- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido con Docker Desktop)

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```bash
# Backend environment variables
GEMINI_API_KEY=tu_api_key_aqui
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### 2. Levantar los Servicios

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo del frontend
docker-compose logs -f frontend
```

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 🛠️ Comandos Útiles

### Atajos con VS Code Tasks

Si usas VS Code, ya tienes tareas configuradas en `.vscode/tasks.json`:

- **Ctrl+Shift+P** → `Tasks: Run Task`
- Selecciona:
  - `compose_up` - Levantar servicios
  - `compose_down` - Detener servicios
  - `compose_build` - Reconstruir sin caché
  - `backend_logs` - Ver logs del backend
  - `backend_shell` - Acceder al shell del backend

### Gestión de Contenedores

```bash
# Detener todos los servicios
docker-compose down

# Reconstruir las imágenes (después de cambiar dependencias)
docker-compose build --no-cache

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend

# Ver estado de los contenedores
docker-compose ps
```

### Ejecutar Comandos en los Contenedores

```bash
# Acceder al shell del backend
docker exec -it backend bash

# Ejecutar migraciones de Django
docker exec -it backend python manage.py migrate

# Crear superusuario de Django
docker exec -it backend python manage.py createsuperuser

# Acceder al shell del frontend
docker exec -it frontend sh

# Instalar nueva dependencia en frontend
docker exec -it frontend npm install <paquete>
```

### Limpieza

```bash
# Detener y eliminar contenedores, redes
docker-compose down

# Eliminar también los volúmenes
docker-compose down -v

# Limpiar imágenes no utilizadas
docker system prune -a
```

## 🔥 Hot-Reload en Desarrollo

Ambos servicios están configurados con **hot-reload**:

- **Backend**: Los cambios en archivos `.py` se reflejan automáticamente
- **Frontend**: Los cambios en componentes React se reflejan instantáneamente gracias a Vite HMR

No necesitas reconstruir las imágenes para ver cambios en el código.

## 📦 Agregar Nuevas Dependencias

### Backend (Python)

1. Edita `backend/pyproject.toml` y agrega la dependencia en la sección `dependencies`
2. Actualiza el lockfile (opcional, UV lo hará automáticamente):
   ```bash
   cd backend
   uv lock
   ```
3. Reconstruye el contenedor:
   ```bash
   docker-compose build --no-cache backend
   docker-compose up -d backend
   ```

### Frontend (Node)

1. Ejecuta dentro del contenedor:
   ```bash
   docker exec -it frontend npm install <paquete>
   ```
2. O edita `frontend/package.json` y reconstruye:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError: No module named 'django'"

Este error ocurre cuando UV no instaló correctamente las dependencias. **Solución**:

```bash
# 1. Detener los contenedores
docker-compose down

# 2. Reconstruir el backend sin caché
docker-compose build --no-cache backend

# 3. Verificar que se instaló correctamente
docker run --rm chatbot-ai_backend uv pip list

# 4. Levantar de nuevo
docker-compose up -d
```

Si el problema persiste, verifica que `backend/pyproject.toml` tenga todas las dependencias listadas correctamente.

### El backend no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que el archivo .env existe
ls backend/.env

# Reconstruir sin caché
docker-compose build --no-cache backend
```

### El frontend no se conecta al backend

1. Verifica que ambos contenedores estén corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica la variable de entorno `VITE_API_URL` en `docker-compose.yml`

3. Asegúrate de que CORS esté configurado en `backend/chatbot_project/settings.py`

### Cambios no se reflejan

```bash
# Reinicia el servicio
docker-compose restart backend
docker-compose restart frontend

# Si persiste, reconstruye
docker-compose build --no-cache
docker-compose up -d
```

## ☁️ Despliegue en AWS ECS/ECR

### Ventajas de usar UV en AWS

- ✅ **Builds 10-100x más rápidos** que pip/poetry → menos tiempo en CodeBuild
- ✅ **Imágenes más pequeñas** → menos costo de almacenamiento en ECR
- ✅ **Pulls más rápidos** → despliegues más rápidos en ECS/Fargate
- ✅ **Compatible con AWS Lambda, ECS, Fargate** → sin cambios necesarios
- ✅ **Sin dependencias de runtime** → UV solo se usa en build time
- ✅ **Cache eficiente** → mejor uso de layers de Docker en ECR

### Pasos para Desplegar

1. **Crear repositorios en ECR**:
   ```bash
   aws ecr create-repository --repository-name chatbot-backend
   aws ecr create-repository --repository-name chatbot-frontend
   ```

2. **Autenticarse en ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Construir y pushear imágenes**:
   ```bash
   # Backend
   docker build -t chatbot-backend ./backend
   docker tag chatbot-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatbot-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatbot-backend:latest

   # Frontend
   docker build -t chatbot-frontend ./frontend
   docker tag chatbot-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatbot-frontend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/chatbot-frontend:latest
   ```

4. **Crear Task Definition en ECS** con las imágenes de ECR

5. **Configurar Service en ECS** con Load Balancer

## 📝 Notas

- El archivo `db.sqlite3` se crea dentro del contenedor. Para persistencia, considera usar PostgreSQL con un volumen Docker.
- Las variables de entorno sensibles deben manejarse con AWS Secrets Manager en producción.
- Para producción, usa `gunicorn` en lugar de `runserver` para el backend.

## 🆘 Soporte

Si encuentras problemas, revisa:
1. Los logs: `docker-compose logs -f`
2. El estado de los contenedores: `docker-compose ps`
3. Las variables de entorno en `backend/.env`

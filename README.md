# Smart Parking Web App

Una aplicación web full-stack para la gestión de un sistema de parqueadero inteligente. El proyecto utiliza Django y Django REST Framework para el backend, y React con Vite para el frontend. Permite a los usuarios registrarse, iniciar sesión y gestionar la información de su perfil.

## Stack Tecnológico

- **Backend:** Python, Django, Django REST Framework
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Base de Datos:** MySQL

## Características

- **Autenticación de Usuarios:** Registro de nuevas cuentas, inicio y cierre de sesión.
- **Gestión de Perfil:** Los usuarios pueden ver y actualizar la información de su perfil, incluyendo:
  - Cambio de correo electrónico.
  - Cambio de número de celular.
  - Actualización de contraseña.

## Prerrequisitos

Asegúrate de tener instalado lo siguiente en tu sistema:

- Python (versión 3.8 o superior)
- Node.js (versión 16 o superior)
- npm (normalmente se instala con Node.js)
- Un servidor de MySQL en funcionamiento.

## Instalación y Puesta en Marcha

Sigue estos pasos para configurar el entorno de desarrollo local.
La rama activa actualmente es la rama develop

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Julisetro/SmartParking_Web_App
cd SmartParking_Web_App
git checkout develop
```
O también: 
```bash
git clone -b develop https://github.com/Julisetro/SmartParking_Web_App
cd SmartParking_Web_App
```

### 2. Configuración de la Base de Datos (MySQL)

1.  Inicia sesión en tu servidor de MySQL.
2.  Crea una nueva base de datos para el proyecto. Por ejemplo:
    ```sql
    CREATE DATABASE smart_parking_db;
    ```
3.  En la raíz del proyecto, crea un archivo llamado `.env`.
4.  Añade las siguientes variables a tu archivo `.env` y ajústalas con tus credenciales de MySQL.

    ```env
    DB_NAME=smart_parking_db
    DB_USER=tu_usuario_mysql
    DB_PASSWORD=tu_contraseña_mysql
    DB_HOST=localhost
    DB_PORT=3306
    ```

### 3. Configuración del Backend

```bash
# Crear y activar el entorno virtual
# En Windows:
python -m venv venv
venv\Scripts\activate
# o también:
source ./venv/Scrips/activate

# En macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias de Python
pip install -r requirements.txt

# Aplicar las migraciones a la base de datos
python manage.py migrate

# Iniciar el servidor de desarrollo de Django
python manage.py runserver
```

El backend estará corriendo en `http://127.0.0.1:8000`.

### 4. Configuración del Frontend

Abre una nueva terminal y navega al directorio del frontend.

```bash
cd frontend

# Instalar dependencias de Node.js
npm install

# Iniciar el servidor de desarrollo de Vite
npm run dev
```

El frontend estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## Uso de la Aplicación

Una vez que la aplicación esté corriendo (tanto el frontend como el backend), sigue estos pasos:

1.  **Acceso:** Abre tu navegador web y navega a la URL del frontend (por defecto `http://localhost:5173`).
2.  **Registro:** Si eres un usuario nuevo, haz clic en la opción de "Registro" y completa el formulario con tus datos.
3.  **Inicio de Sesión:** Después de registrarte o si ya tienes una cuenta, procede a "Iniciar Sesión" con tus credenciales.
4.  **Gestión de Perfil:** Una vez autenticado, podrás acceder a tu página de perfil, haciendo click al icono en la parte superior derecha, donde tendrás la opción de ver y actualizar tu correo electrónico, número de celular y contraseña. En ese mismo icono, en donde se accede a la configuracion de la cuenta, podras cerrar sesión también,

## Estructura del Proyecto

El proyecto está organizado en dos directorios principales: `core` (backend Django) y `frontend` (aplicación React).

### Backend (`core/`)

- `core/`: Configuración principal de Django (settings, URLs globales, WSGI/ASGI).
- `users/`: Aplicación Django para la gestión de usuarios, incluyendo modelos de datos, vistas de API (serializers, views) y migraciones.

### Frontend (`frontend/`)

- `src/`: Código fuente principal de la aplicación React.
  - `src/core/`: Componentes y lógicas fundamentales para la estructura de la aplicación, como layouts (`AppLayout`, `PublicLayout`) y enrutamiento (`AppRouter`).
  - `src/features/`: Módulos específicos de características (features), como autenticación (`auth`) y gestión de perfil (`profile`), cada uno con su lógica, APIs y componentes.
  - `src/pages/`: Componentes de páginas que representan las vistas principales de la aplicación (Dashboard, Home, Login, Profile, Register).
  - `src/shared/`: Componentes reutilizables y utilidades compartidas que no pertenecen a una característica específica.

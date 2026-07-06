# Smart Parking Web App

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=flat&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-3.x-ff1709?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-SimpleJWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

Aplicación web full-stack para la gestión inteligente de un parqueadero. Permite a los usuarios registrarse, administrar su perfil y realizar reservas de estacionamiento. El backend expone una API REST con autenticación JWT; el frontend está desarrollado en React con TypeScript.

## ✨ Funcionalidades Principales

- **Registro e inicio de sesión** mediante correo electrónico y contraseña con autenticación JWT
- **Gestión de perfil**: actualización de nombre, correo electrónico, número de celular y contraseña
- **CRUD de reservas**: crear, consultar, actualizar y cancelar reservas de estacionamiento
- **Generación de código QR** por reserva confirmada
- **Protección de rutas** en el frontend según estado de autenticación
- **Pruebas automatizadas** en backend (Django unittest) y frontend (Vitest + React Testing Library)

## 🔌 API REST — Endpoints

Base URL: `http://127.0.0.1:8000`

La API utiliza autenticación JWT. Incluye el token en el encabezado de cada solicitud autenticada:

```
Authorization: Bearer {access_token}
```

### Usuarios (`/api/users/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `POST` | `/api/users/register/` | Registro de nuevo usuario | No |
| `POST` | `/api/users/login/` | Inicio de sesión; devuelve `access` y `refresh` tokens | No |
| `POST` | `/api/users/token/refresh/` | Renueva el `access` token con el `refresh` token | No |
| `GET` | `/api/users/me/` | Obtiene el perfil del usuario autenticado | Sí |
| `PUT` / `PATCH` | `/api/users/me/` | Actualiza el perfil (`first_name`, `last_name`) | Sí |
| `POST` | `/api/users/change-password/` | Cambia la contraseña | Sí |
| `POST` | `/api/users/change-celular/` | Inicia el cambio de número de celular | Sí |
| `POST` | `/api/users/change-celular/confirm/` | Confirma el cambio de celular con código de verificación | Sí |
| `POST` | `/api/users/change-email/` | Inicia el cambio de correo electrónico | Sí |
| `GET` | `/api/users/change-email/confirm/<uidb64>/<token>/` | Confirma el cambio de correo vía enlace | No |
| `POST` | `/api/users/logout/` | Cierra sesión e invalida el `refresh` token | Sí |

### Reservas (`/api/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/reservations/` | Lista las reservas del usuario autenticado | Sí |
| `POST` | `/api/reservations/` | Crea una nueva reserva | Sí |
| `GET` | `/api/reservations/{id}/` | Detalle de una reserva específica | Sí |
| `PUT` / `PATCH` | `/api/reservations/{id}/` | Actualiza una reserva | Sí |
| `DELETE` | `/api/reservations/{id}/` | Elimina una reserva | Sí |
| `POST` | `/api/reservations/{id}/cancel/` | Cancela una reserva en estado "Confirmada" | Sí |

---

## 📖 Manual Técnico de Instalación

## 1. Descripción General

Este documento sirve como guía de instalación y ejecución para la aplicación **Smart Parking Web App**.

El proyecto es una aplicación web full-stack para la gestión de un sistema de parqueadero inteligente. Permite a los usuarios registrarse, gestionar sus perfiles y realizar reservas de estacionamiento.

### 1.1. Stack Tecnológico

- **Backend**: Python, Django, Django REST Framework (DRF)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Base de Datos**: MySQL
- **Pruebas**:
  - Backend: Django Testing Framework (unittest)
  - Frontend: Vitest, React Testing Library

## 2. Prerrequisitos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu sistema:

- Python (versión 3.8 o superior)
- Node.js (versión 18 o superior, LTS recomendado) y npm
- Un servidor de MySQL en funcionamiento
- Git

## 3. Configuración del Entorno de Desarrollo

Sigue estos pasos para configurar el proyecto en tu máquina local.

### 3.1. Clonar el Repositorio

Primero, clona el repositorio del proyecto desde GitHub.

```bash
git clone https://github.com/NeoBonnt/SmartParking_Web_App.git
cd SmartParking_Web_App
```

### 3.2. Configuración del Backend (Django)

1.  **Crear y Activar Entorno Virtual**:
    Desde la raíz del proyecto, crea un entorno virtual para aislar las dependencias de Python.

    ```bash
    # Crear el entorno virtual
    python -m venv venv
    ```

    ```bash
    # Activar en Windows (Git Bash)
    source ./venv/Scripts/activate

    # Activar en Windows (PowerShell)
    .\venv\Scripts\Activate.ps1

    # Activar en Windows (CMD)
    venv\Scripts\activate.bat
    ```

    ```bash
    # Activar en macOS/Linux
    source venv/bin/activate
    ```

2.  **Instalar Dependencias**:
    Con el entorno virtual activado, instala todas las librerías necesarias.

    ```bash
    pip install -r requirements.txt
    ```

3.  **Configurar Variables de Entorno**:
    La aplicación necesita credenciales para conectarse a la base de datos.
    - Copia el archivo de ejemplo `.env.example` a un nuevo archivo llamado `.env`.

      ```bash
      # En Windows (Command Prompt)
      copy .env.example .env

      # En macOS/Linux o Windows (PowerShell/Git Bash)
      cp .env.example .env
      ```

    - Abre el archivo `.env` y edita las variables (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, etc.) con tus credenciales de MySQL. Asegúrate de haber creado previamente la base de datos en tu servidor MySQL.

4.  **Aplicar Migraciones**:
    Ejecuta las migraciones para crear las tablas de la base de datos.

    ```bash
    python manage.py migrate
    ```

### 3.3. Configuración del Frontend (React)

1.  **Navegar al Directorio del Frontend**:
    En una terminal separada, muévete a la carpeta `frontend`.

    ```bash
    cd frontend
    ```

2.  **Instalar Dependencias**:
    Instala todos los paquetes de Node.js necesarios.

    ```bash
    npm install
    ```

## 4. Ejecución de la Aplicación en Desarrollo

Para ejecutar la aplicación, necesitas iniciar ambos servidores (backend y frontend) simultáneamente en dos terminales distintas.

### 4.1. Iniciar Servidor del Backend

Con el entorno virtual de Python activado y desde la raíz del proyecto:

```bash
python manage.py runserver
```

El backend estará disponible en `http://127.0.0.1:8000`.

### 4.2. Iniciar Servidor del Frontend

En otra terminal, dentro de la carpeta `frontend/`:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

### 4.3. Acceso a la Aplicación

Abre tu navegador y visita **`http://localhost:5173`**. La aplicación React se conectará automáticamente al backend que se ejecuta en el puerto 8000.

## 5. Ejecución de Pruebas

Para asegurar la calidad del código y la estabilidad de las funcionalidades, el proyecto cuenta con suites de pruebas para el backend y el frontend.

### 5.1. Pruebas del Backend

Con el entorno virtual activado, ejecuta el siguiente comando desde la raíz del proyecto:

```bash
# Ejecutar todas las pruebas del backend
python manage.py test
```

Para ejecutar pruebas de una aplicación específica (ej. `users`):

```bash
python manage.py test users
```

### 5.2. Pruebas del Frontend

Desde la carpeta `frontend/`, ejecuta:

```bash
# Ejecutar todas las pruebas del frontend en modo observador (watch)
npm test
```

O para ejecutar las pruebas una sola vez:

```bash
npm test -- --run
```

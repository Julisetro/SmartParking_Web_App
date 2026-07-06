# Manual Técnico: Smart Parking Web App

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

Primero, clona el repositorio del proyecto desde GitHub. Se recomienda clonar directamente la rama `main`, que contiene la versión principal y actualizada del proyecto.

```bash
git clone -b main https://github.com/NeoBonnt/SmartParking_Web_App.git
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
    # Activar en Windows
    source ./venv/Scripts/activate
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

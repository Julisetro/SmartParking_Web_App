import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * URL base para todas las peticiones de la API del backend.
 */
const BASE_URL = 'http://127.0.0.1:8000/api';
/**
 * Instancia de Axios configurada para interactuar con la API del backend.
 * Esto permite encapsular la configuración especifica de nuestra API
 * sin afectar otras posibles instancias de Axios en la aplicación.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
/**
 * Interceptor de peticiones (Request Interceptor) que se ejecuta antes de cada
 * petición realizada con la instancia `apiClient`. Su función principal es añadir
 * el token de autenticación (si existe) a los encabezados de la petición.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener el token de autenticación desde el almacenamiento local
    const tokensString = localStorage.getItem('authTokens');
    // Si se encuentra el objeto tokens, lo parsea de JSON a un objeto JavaScript
    if (tokensString) {
      const tokens = JSON.parse(tokensString);
      const accessToken = tokens?.access;
      // Si existe un token de acceso, lo añade a los encabezados Authorization
      // Bearer <token> es el estandar para enviar tokens JWT en las peticiones HTTP
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    // Retorna la configuración modificada de la petición
    return config;
  },
  (error) => {
    // Si ocurre un error al configurar la petición, se rechaza la promesa con el error
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para manejar la expiración de tokens
apiClient.interceptors.response.use(
  // Argumento para respuestas exitosas (2xx)
  (response) => response,
  // Segundo argumento es una función que se ejecuta si la petición falla
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    // 1. Se verifica que el error sea un 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Evita bucles infinitos
      try {
        // 2. Se intenta obtener el token de refresco de localStorage
        const tokensString = localStorage.getItem('authTokens');
        const oldTokens = tokensString ? JSON.parse(tokensString) : null;
        const refreshToken = oldTokens?.refresh;
        if (!refreshToken) {
          // Si no hay token de refresco no se puede hacer nada
          window.location.href = '/login'; // Redirigir a la pantalla de inicio de sesión
          return Promise.reject(error);
        }
        // 3. Hacemos la petición al endpoint de refresco.
        // Se usa axios.post en lugar de apiClient.post para evitar un bucle infinito
        const response = await axios.post(`${BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });
        const newTokens = response.data;
        // 4. Actualizamos el almacenamiento local con los nuevos tokens
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        // 5. Actualizamos el encabezado de la petición con el nuevo token de acceso
        apiClient.defaults.headers.common.Authorization = `Bearer ${newTokens.access}`;
        // 6. Vuelve a intentar la petición original con el nuevo token de acceso
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 7. Si la petición de refresco falla, se redirige a la pantalla de inicio de sesión
        localStorage.removeItem('authTokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    // Para cualquier otro error que no sea un 401
    return Promise.reject(error);
  }
);
// Exporta la instancia configurada de Axios para ser utilizada en otras partes de la aplicación
export default apiClient;

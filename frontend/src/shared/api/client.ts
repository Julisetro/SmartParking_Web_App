import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

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
// Exporta la instancia configurada de Axios para ser utilizada en otras partes de la aplicación
export default apiClient;

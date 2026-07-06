/**
 * Interfaz que define la estructura de los datos necesarios para cambiar la contraseña de usuario
 * La estructura coincide con los campos esperados por ChangePasswordSerializer en el backend
 */
export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password2: string; // Confirmacion de la nueva contraseña.
}

/**
 * Interfaz que define la estructura de los datos necesarios para solicitar el cambio de email.
 * La estructura coincide con los campos esperados por ChangeEmailRequestSerializer en el backend
 */
export interface ChangeEmailData {
  password: string; // Contraseña actual del usuario
  new_email: string; // El nuevo correo electrónico
}

/**
 * Iterfaz que define la estructura de los datos necesarios para solicitar el cambio de numero celular.
 * La estructura coincide con los campos esperados por ChangeCelularRequestSerializer en el backend
 */
export interface ChangeCelularData {
  password: string; // Contraseña actual del usuario
  new_celular: string; // El nuevo celular
}

/**
 * Interfaz que define la estructura de datos para la confirmación del cambio de celular
 */
export interface ChangeCelularConfirmData {
  verification_code: string;
}

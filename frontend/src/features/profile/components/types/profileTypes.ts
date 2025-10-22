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

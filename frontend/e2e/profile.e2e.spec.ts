import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// --- Estado Inicial de la Prueba ---
// Credenciales del usuario de prueba que debe existir en la base de datos.
// IMPORTANTE: Asegúrate de que este usuario exista en tu BD de pruebas con esta contraseña.
// Para el test de cambio de contraseña, también se asume que su nombre es "Test User".
// Poner test.only en las pruebas 1 - 4 segun se quieran probar para evitar conflictos.
const userEmail = 'new_1769708637193@test.com';
const Password = 'Password123!';
const newPassword = 'NewSecurePassword456!';

// Constantes para los paths de los archivos temporales.
const __filename = fileURLToPath(import.meta.url); // Obtener el nombre del archivo actual
const __dirname = path.dirname(__filename); // Obtener el directorio del archivo actual

// Este bloque se ejecutará ANTES de cada 'test' en este archivo.
test.beforeEach(async ({ page }) => {
  // Asegura que cada prueba comienza con el usuario logueado.
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(userEmail);
  await page.getByLabel('Contraseña').fill(Password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL('/dashboard');
});

// --- Test #1: Actualización de datos no sensibles (Nombre y Apellido) ---
test('Flujo E2E: Un usuario puede actualizar sus datos de perfil (nombre y apellido)', async ({
  page,
}) => {
  // 1. Navegar a la página de perfil
  await page.goto('/profile');
  await expect(
    page.getByRole('heading', { name: 'Configuración de la Cuenta' })
  ).toBeVisible();

  // 2. Entrar en modo de edición
  await page.getByRole('button', { name: 'Editar' }).click();
  await expect(
    page.getByRole('button', { name: 'Guardar Cambios' })
  ).toBeVisible();

  // 3. Definir los nuevos datos
  const newFirstName = 'Jane';
  const newLastName = `Doe_${Date.now()}`;

  // 4. Rellenar los campos
  await page.getByLabel('Nombre').fill(newFirstName);
  await page.getByLabel('Apellido').fill(newLastName);

  // 5. Guardar los cambios
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();

  // 6. Verificar el mensaje de éxito y la vuelta al modo lectura
  await expect(
    page.getByText('¡Tu información ha sido actualizada con éxito!')
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Guardar Cambios' })
  ).not.toBeVisible();

  // 7. Verificar que los nuevos datos se muestran en la UI
  await expect(page.getByText(newFirstName, { exact: true })).toBeVisible();
  await expect(page.getByText(newLastName)).toBeVisible();
});

// --- Test #2: Actualización de contraseña ---
test('Flujo E2E: Un usuario puede cambiar su contraseña y volver a iniciar sesión', async ({
  page,
}) => {
  // 1. Navegar a la Página de Perfil
  await page.goto('/profile');
  await expect(
    page.getByRole('heading', { name: 'Configuración de la Cuenta' })
  ).toBeVisible();

  // 2. Abrir el Modal de Cambio de Contraseña
  // Se localiza el botón "Actualizar" dentro de la sección "Seguridad" que contiene el texto "Cambiar Contraseña".
  const passwordSection = page
    .locator('div.flex.justify-between.items-center')
    .filter({ has: page.getByText('Cambiar Contraseña', { exact: true }) });
  await passwordSection.getByRole('button', { name: 'Actualizar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Cambiar Contraseña' })
  ).toBeVisible();

  // 3. Configurar el Manejador del Diálogo 'alert'
  // para que Playwright sepa qué hacer cuando aparezca el alert de éxito.
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('¡Contraseña actualizada con éxito!');
    await dialog.accept();
  });

  // 4. Rellenar y Enviar el Formulario del Modal
  await page.getByLabel('Contraseña Antigua').fill(Password);
  await page.getByLabel('Nueva Contraseña', { exact: true }).fill(newPassword);
  await page.getByLabel('Confirmar Nueva Contraseña').fill(newPassword);
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();

  // 5. Verificar que el Modal se ha Cerrado
  await expect(
    page.getByRole('heading', { name: 'Cambiar Contraseña' })
  ).not.toBeVisible();

  // 6. Cerrar Sesión para verificar el cambio
  // El botón del menú de usuario muestra las iniciales. Asumimos que el nombre del usuario es "Test User".
  const userInitials = 'JD'; // Se cambia esto si el nombre del usuario de prueba es diferente
  await page.getByRole('button', { name: userInitials }).click();
  await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
  await expect(page).toHaveURL('/login');

  // 7. Verificar el Cambio: Iniciar sesión con la nueva contraseña
  await page.getByLabel('Correo Electrónico').fill(userEmail);
  await page.getByLabel('Contraseña').fill(newPassword); // ¡Usamos la nueva contraseña!
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // La prueba finaliza con éxito si podemos volver a entrar al dashboard.
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Bienvenido de vuelta, Jane')).toBeVisible(); // Asume que el nombre es "Test"
});

// --- Test #3: Actualización de correo electrónico ---

// Ruta al archivo temporal donde el backend dejará el enlace de confirmación.
const linkFilePath = path.join(__dirname, 'temp', 'email_link.txt');

// Actualización de email
test('Flujo E2E: Un usuario puede cambiar su email y volver a iniciar sesión', async ({
  page,
}) => {
  // 1. Limpiar el archivo de enlace de una ejecución anterior para evitar leer datos viejos.
  if (fs.existsSync(linkFilePath)) {
    fs.unlinkSync(linkFilePath);
  }

  // 2. Navegar a la Página de Perfil y abrir el modal.
  await page.goto('/profile');
  const emailSection = page
    .locator('div.flex.justify-between.items-center')
    .filter({ has: page.getByText('Cambiar Email', { exact: true }) });
  await emailSection.getByRole('button', { name: 'Actualizar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Cambiar Correo Electrónico' })
  ).toBeVisible();

  // 3. Configurar manejador del 'alert' que confirma el envío de la solicitud.
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Revisa la consola del backend');
    await dialog.accept();
  });

  // 4. Rellenar y Enviar el Formulario del Modal.
  const newEmail = `new_${Date.now()}@test.com`;
  await page.getByLabel('Contraseña Actual').fill(Password);
  await page.getByLabel('Nuevo Correo Electrónico').fill(newEmail);
  await page.getByRole('button', { name: 'Enviar Solicitud' }).click();

  // 5. Esperar y leer el enlace del archivo temporal.
  const pollForLink = async (): Promise<string> => {
    for (let i = 0; i < 15; i++) {
      // Reintentar por ~7.5 segundos
      if (fs.existsSync(linkFilePath)) {
        const link = fs.readFileSync(linkFilePath, 'utf-8');
        if (link) return link; // Si el archivo existe y tiene contenido, lo retornamos.
      }
      await page.waitForTimeout(500); // Esperar medio segundo antes de reintentar.
    }
    throw new Error(
      `El archivo de enlace no se encontró en ${linkFilePath} después de varios intentos.`
    );
  };

  const confirmLink = await pollForLink();
  expect(confirmLink).toContain('/users/change-email/confirm/');

  // 6. Navegar al enlace de confirmación y verificar el éxito.
  await page.goto(confirmLink);
  await expect(
    page.getByText('Correo electrónico actualizado con éxito.')
  ).toBeVisible();

  // 7. Cerrar Sesión.
  const userInitials = 'JD';
  await page.goto('/dashboard');
  await page.getByRole('button', { name: userInitials }).click();
  await page.getByRole('button', { name: 'Cerrar Sesión' }).click();
  await expect(page).toHaveURL('/login');

  // 8. Verificar el Cambio: Iniciar sesión con el nuevo email.
  await page.getByLabel('Correo Electrónico').fill(newEmail);
  await page.getByLabel('Contraseña').fill(Password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // La prueba finaliza con éxito si podemos volver a entrar al dashboard.
  await expect(page).toHaveURL('/dashboard');
});

// --- Test #4: Actualización de Numero de celular ---

// Ruta al archivo temporal donde el backend dejará el código de verificación.
const codeFilePath = path.join(__dirname, 'temp', 'celular_code.txt');

// Actualización de celular
test('Flujo E2E: Un usuario puede cambiar su número de celular usando el flujo de 2 pasos', async ({
  page,
}) => {
  // 1. Limpiar el archivo de código de una ejecución anterior.
  if (fs.existsSync(codeFilePath)) {
    fs.unlinkSync(codeFilePath);
  }

  // 2. Navegar a la Página de Perfil y abrir el modal.
  await page.goto('/profile');
  const celularSection = page
    .locator('div.flex.justify-between.items-center')
    .filter({ has: page.getByText('Cambiar Celular', { exact: true }) });
  await celularSection.getByRole('button', { name: 'Actualizar' }).click();
  await expect(
    page.getByRole('heading', { name: 'Cambiar Número de Celular' })
  ).toBeVisible();

  // 3. Rellenar y Enviar el Formulario del Paso 1.
  const newCelular = `300${Math.floor(1000000 + Math.random() * 9000000)}`; // Genera un número aleatorio de 10 dígitos
  await page.getByLabel('Contraseña Actual').fill(Password);
  await page.getByLabel('Nuevo Número de Celular').fill(newCelular);
  await page.getByRole('button', { name: 'Enviar Código' }).click();

  // 4. Verificar la transición.
  await expect(
    page.getByRole('heading', { name: 'Confirmar Código de Verificación' })
  ).toBeVisible();

  // 5. Esperar y leer el código del archivo temporal.
  const pollForCode = async (): Promise<string> => {
    for (let i = 0; i < 15; i++) {
      // Reintentar por ~7.5 segundos
      if (fs.existsSync(codeFilePath)) {
        const code = fs.readFileSync(codeFilePath, 'utf-8');
        if (code) return code;
      }
      await page.waitForTimeout(500);
    }
    throw new Error(`El archivo de código no se encontró en ${codeFilePath}`);
  };

  const verificationCode = await pollForCode();
  expect(verificationCode).toHaveLength(6); // El código debe tener 6 dígitos.

  // 6. Configurar manejador del 'alert' de éxito final.
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('¡Celular cambiado con éxito!');
    await dialog.accept();
  });

  // 7. Rellenar y Enviar el Formulario del Paso 3.
  await page.getByLabel('Código de Verificación').fill(verificationCode);
  await page.getByRole('button', { name: 'Confirmar y Guardar' }).click();

  // 8. Verificar la persistencia del cambio.
  // El test esperará implícitamente a que la página se recargue (window.location.reload()).
  // Después de la recarga, el nuevo número de celular debe ser visible.
  await expect(page.getByText(newCelular)).toBeVisible();
});

// --- Test #5: Cancelacion de Reserva ---
test.only('Flujo E2E: Un usuario puede cancelar una reserva desde la página de reservas', async ({
  page,
}) => {
  // 1. Navegar a la Página de Reservas.
  await page.goto('/reservations');
  await expect(
    page.getByRole('heading', { name: 'Mis Reservas' })
  ).toBeVisible();

  // 2. Localizar la primera reserva en estado 'Confirmada' y hacer clic en 'Cancelar Reserva'.
  const cancellableCard = page
    .locator('div')
    .filter({ hasText: 'Confirmada' })
    .first();
  await expect(cancellableCard).toBeVisible();

  // 3. Abrir el modal de cancelación
  await cancellableCard.getByRole('button', { name: 'Cancelar' }).click();

  // 4. Confirmar en el modal
  await page.getByRole('button', { name: /Sí, Cancelar/i }).click();

  // 5. Verificamos que la tarjeta ya no muestra el estado 'Confirmada'
  await expect(cancellableCard.getByText('Confirmada')).not.toBeVisible();
});

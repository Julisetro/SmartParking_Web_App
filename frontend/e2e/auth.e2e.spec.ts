import { test, expect } from '@playwright/test';

test('Flujo E2E: Un usuario puede registrarse y luego iniciar sesión', async ({
  page,
}) => {
  //1. Navegar a la página de registro
  await page.goto('/register');
  //2. Rellenar el formulario de registro
  // Se usa un email único con timestamp para que la prueba se pueda repetir
  const uniqueEmail = `user_${Date.now()}@test.com`;

  await page.getByLabel('Nombre').fill('Test');
  await page.getByLabel('Apellido').fill('User');
  await page.getByLabel('Correo Electrónico').fill(uniqueEmail);
  await page.getByLabel('Cédula').fill('1234567890');
  await page.getByLabel('Celular').fill('3001234567');
  await page.getByLabel(/^Contraseña$/i).fill('Password123!');
  await page.getByLabel('Confirmar Contraseña').fill('Password123!');

  //3. Enviar el formulario
  await page.getByRole('button', { name: 'Registrarse' }).click();

  //4. Verificar que el registro fue exitoso y redirigido a la página de inicio de sesión
  await expect(page).toHaveURL('/login');

  //5. Rellenar el formulario de login con las nuevas credenciales
  await page.getByLabel('Correo Electrónico').fill(uniqueEmail);
  await page.getByLabel('Contraseña').fill('Password123!');

  //6. Enviar el formulario login
  await page.getByRole('button', { name: 'Ingresar' }).click();

  //7. Verificar que nos envio a Dashboard después de iniciar sesión
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText(`Bienvenido de vuelta, Test`)).toBeVisible();
});

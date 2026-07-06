import { test, expect } from '@playwright/test';

test('Flujo E2E: Un usuario autenticado puede crear una reserva', async ({
  page,
}) => {
  //1. Iniciar sesión primero
  await page.goto('/login');
  await page
    .getByLabel('Correo Electrónico')
    .fill('user_1769658935192@test.com');
  await page.getByLabel('Contraseña').fill('Password123!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL('/dashboard');

  //2. Navegar a la página de reservas
  await page.goto('/reservations');

  //3. Abrir el modal de creación de reserva
  await page.getByRole('button', { name: 'Crear Reserva' }).click();

  //4. Llenar el formulario del modal
  await page.getByLabel('Fecha de la Reserva').fill('October 15, 2026');
  await page.getByLabel('Hora de Inicio').fill('2:30 PM');

  //5. Confirmar reserva
  await page.getByRole('button', { name: 'Confirmar Reserva' }).click();

  //6. Verificar que la reserva aparece en la lista
  const nuevaReserva = page.locator('.bg-white', {
    hasText: '15 de octubre de 2026',
  });
  await expect(nuevaReserva).toBeVisible();
  await expect(nuevaReserva.getByText('Confirmada')).toBeVisible();
  await expect(nuevaReserva.getByText('14:30')).toBeVisible();
});

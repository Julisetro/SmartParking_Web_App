// src/features/profile/components/ChangeCelularModal.test.tsx

import { render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangeCelularModal } from './ChangeCelularModal';

// ...existing code...

// -- MOCKING DE LA API --
// Este es un paso crucial. Usamos vi.mock() para interceptar todas las exportaciones
// del módulo profileApi. En lugar de ejecutar las llamadas a la API reales, Vitest
// las reemplazará con funciones "espía" (mocks) que podemos controlar en nuestras pruebas.
// Esto nos permite simular respuestas de éxito o error de la API sin depender de un backend.
vi.mock('../api/profileApi');

// -- CONFIGURACIÓN DE LAS PRUEBAS --
describe('ChangeCelularModal', () => {
  // Creamos mocks para las props que el componente espera recibir.
  // Estas son funciones espía que nos permitirán verificar si son llamadas.
  const handleClose = vi.fn();
  const handleSuccess = vi.fn();

  // Usamos beforeEach para resetear los mocks antes de cada prueba.
  // Esto asegura que el estado de una prueba no afecte a las siguientes.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- PRUEBA 1: RENDERIZADO INICIAL ---
  // Esta prueba verifica que el modal se muestra correctamente en su estado inicial.
  it('debería renderizar el primer paso correctamente cuando está abierto', () => {
    // 1. Renderizamos el componente con las props necesarias.
    render(
      <ChangeCelularModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // 2. Verificamos que los elementos visuales clave estén en el documento.
    // Usamos `screen.getByText` para buscar elementos por su texto, lo cual
    // simula cómo un usuario localizaría la información.
    expect(screen.getByText('Cambiar Número de Celular')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña Actual')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Nuevo Número de Celular')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar Código' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  // --- PRUEBA 2: CIERRE DEL MODAL ---
  // Esta prueba asegura que el mecanismo de cierre principal funciona.
  it('debería llamar a onClose cuando se hace clic en el botón Cancelar', async () => {
    const user = userEvent.setup();
    // 1. Renderizamos el componente.
    render(
      <ChangeCelularModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // 2. Localizamos el botón "Cancelar".
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });

    // 3. Simulamos un clic del usuario en el botón.
    await user.click(cancelButton);

    // 4. Verificamos que la función handleClose (el mock que pasamos como prop)
    // haya sido llamada exactamente una vez.
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // --- PRUEBA 3: ENVÍO EXITOSO DEL PASO 1 ---
  it('debería avanzar al segundo paso si la solicitud de cambio es exitosa', async () => {
    const user = userEvent.setup();
    // 1. Mockeamos `changeCelular` para que la llamada a la API sea exitosa.
    // Como no devuelve nada en el caso de éxito, usamos `mockResolvedValue(undefined)`.
    const { changeCelular } = await import('../api/profileApi');
    vi.mocked(changeCelular).mockResolvedValue(undefined);

    // 2. Renderizamos el componente.
    render(
      <ChangeCelularModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // 3. Simulamos la entrada de datos del usuario.
    await user.type(screen.getByLabelText('Contraseña Actual'), 'password123');
    await user.type(
      screen.getByLabelText('Nuevo Número de Celular'),
      '3001234567'
    );

    // 4. Simulamos el envío del formulario.
    await user.click(screen.getByRole('button', { name: 'Enviar Código' }));

    // 5. Verificamos que el modal haya avanzado al segundo paso.
    // Usamos `waitFor` para esperar a que la UI se actualice después de la llamada asíncrona a la API.
    await waitFor(() => {
      expect(
        screen.getByText('Confirmar Código de Verificación')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Código de Verificación')
      ).toBeInTheDocument();
    });

    // Adicionalmente, verificamos que no se hayan cerrado ni completado el flujo.
    expect(handleClose).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  // --- PRUEBA 4: ENVÍO CON ERROR DEL PASO 1 ---
  it('debería mostrar un error si la solicitud de cambio falla', async () => {
    const user = userEvent.setup();
    // 1. Mockeamos `changeCelular` para que la API devuelva un error.
    const errorMessage = 'La contraseña es incorrecta.';
    const { changeCelular } = await import('../api/profileApi');
    vi.mocked(changeCelular).mockRejectedValue({
      response: { data: { password: [errorMessage] } },
    });

    // 2. Renderizamos el componente.
    render(
      <ChangeCelularModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // 3. Simulamos la entrada y envío de datos.
    await user.type(screen.getByLabelText('Contraseña Actual'), 'wrongpassword');
    await user.type(
      screen.getByLabelText('Nuevo Número de Celular'),
      '3001234567'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar Código' }));

    // 4. Verificamos que se muestre el mensaje de error de la API.
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // 5. Nos aseguramos de que el modal no haya avanzado de paso ni se haya cerrado.
    expect(
      screen.getByText('Cambiar Número de Celular')
    ).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
    expect(handleSuccess).not.toHaveBeenCalled();
  });

  // --- PRUEBA 5: ENVÍO EXITOSO DEL PASO 2 ---
  it('debería llamar a onSuccess y onClose si la confirmación es exitosa', async () => {
    const user = userEvent.setup();
    // 1. Mockeamos ambas funciones de la API para que el flujo completo sea exitoso.
    const { changeCelular, changeCelularConfirm } = await import(
      '../api/profileApi'
    );
    vi.mocked(changeCelular).mockResolvedValue(undefined);
    vi.mocked(changeCelularConfirm).mockResolvedValue(undefined);

    // 2. Renderizamos el componente.
    render(
      <ChangeCelularModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    // 3. Pasamos por el primer paso.
    await user.type(screen.getByLabelText('Contraseña Actual'), 'password123');
    await user.type(
      screen.getByLabelText('Nuevo Número de Celular'),
      '3001234567'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar Código' }));

    // 4. Esperamos a que el segundo paso esté visible.
    await waitFor(() => {
      expect(
        screen.getByText('Confirmar Código de Verificación')
      ).toBeInTheDocument();
    });

    // 5. Simulamos la entrada del código de verificación y el envío del segundo formulario.
    await user.type(screen.getByLabelText('Código de Verificación'), '123456');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar y Guardar' })
    );

    // 6. Verificamos que las funciones de éxito y cierre hayan sido llamadas.
    // Usamos waitFor para dar tiempo a que se ejecuten todas las promesas y timeouts.
    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // --- PRUEBA 6: ENVÍO CON ERROR DEL PASO 2 ---
  it('debería mostrar un error si la confirmación falla', async () => {
    const user = userEvent.setup();
    const errorMessage = 'El código de verificación es incorrecto.';
    // 1. Mockeamos el flujo de API: éxito en el paso 1, error en el paso 2.
    const { changeCelular, changeCelularConfirm } = await import(
      '../api/profileApi'
    );
    vi.mocked(changeCelular).mockResolvedValue(undefined);
    vi.mocked(changeCelularConfirm).mockRejectedValue({
      response: { data: { verification_code: [errorMessage] } },
    });

    // 2. Renderizamos y avanzamos al segundo paso.
    render(
      <ChangeCelularModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );
    await user.type(screen.getByLabelText('Contraseña Actual'), 'password123');
    await user.type(
      screen.getByLabelText('Nuevo Número de Celular'),
      '3009876543'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar Código' }));
    await waitFor(() => {
      expect(
        screen.getByText('Confirmar Código de Verificación')
      ).toBeInTheDocument();
    });

    // 3. Simulamos la entrada del código y el envío del formulario.
    await user.type(screen.getByLabelText('Código de Verificación'), '654321');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar y Guardar' })
    );

    // 4. Verificamos que se muestre el mensaje de error.
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // 5. Nos aseguramos de que el modal no se haya cerrado y siga en el paso 2.
    expect(
      screen.getByText('Confirmar Código de Verificación')
    ).toBeInTheDocument();
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  });
});

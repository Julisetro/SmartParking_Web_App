// src/features/reservations/components/QRCodeModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCodeModal from './QRCodeModal';

// Mock del componente qrcode.react para aislar la prueba del componente modal.
// Esto evita la necesidad de renderizar un SVG real en las pruebas y permite verificar
// que se le pasan las props correctas al componente QR.
vi.mock('qrcode.react', () => ({
  QRCodeSVG: vi.fn(({ value, size, includeMargin }) => (
    // Se retorna un div simple que simula el componente QR.
    // Esto nos permite verificar que las props se le pasaron correctamente.
    <div data-testid="qrcode-svg" data-value={value} data-size={size} data-include-margin={includeMargin}>
      Mocked QR Code for: {value}
    </div>
  )),
}));

describe('Componente - QRCodeModal', () => {
  const mockOnClose = vi.fn();
  const testQrCodeValue = 'smartparkingapp.com/reservation/123';

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia los mocks antes de cada prueba.
  });

  it('no debe renderizarse si la prop isOpen es false', () => {
    // Renderiza el componente con isOpen={false}.
    render(
      <QRCodeModal
        isOpen={false}
        onClose={mockOnClose}
        qrCodeValue={testQrCodeValue}
      />
    );
    // Verifica que el título del modal no está en el documento.
    expect(screen.queryByText('Escanea para Ingresar')).toBeNull();
  });

  it('debe renderizarse correctamente si la prop isOpen es true', () => {
    // Renderiza el componente con isOpen={true}.
    render(
      <QRCodeModal
        isOpen={true}
        onClose={mockOnClose}
        qrCodeValue={testQrCodeValue}
      />
    );
    // Verifica que el título y el texto descriptivo están visibles.
    expect(screen.getByText('Escanea para Ingresar')).toBeInTheDocument();
    expect(
      screen.getByText('Presenta este código en el lector de la entrada del parqueadero.')
    ).toBeInTheDocument();
    // Verifica que el botón "Cerrar" está presente.
    expect(screen.getByText('Cerrar')).toBeInTheDocument();
    // Verifica que el componente QRCodeSVG mockeado se renderiza con el valor correcto.
    const qrcodeElement = screen.getByTestId('qrcode-svg');
    expect(qrcodeElement).toBeInTheDocument();
    expect(qrcodeElement).toHaveAttribute('data-value', testQrCodeValue);
    expect(qrcodeElement).toHaveAttribute('data-size', '256');
    expect(qrcodeElement).toHaveAttribute('data-include-margin', 'true');
  });

  it('debe llamar a onClose cuando se hace clic en el botón "Cerrar"', async () => {
    const user = userEvent.setup();
    render(
      <QRCodeModal
        isOpen={true}
        onClose={mockOnClose}
        qrCodeValue={testQrCodeValue}
      />
    );

    const closeButton = screen.getByText('Cerrar');
    await user.click(closeButton); // Simula el clic en el botón.

    // Verifica que la función onClose fue llamada una vez.
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a onClose cuando se hace clic en el fondo del modal', async () => {
    render(
      <QRCodeModal
        isOpen={true}
        onClose={mockOnClose}
        qrCodeValue={testQrCodeValue}
      />
    );

    // Simula un clic en el fondo oscuro del modal.
    // El div principal tiene la propiedad onClick={onClose} y ocupa todo el espacio.
    await userEvent.click(screen.getByText('Escanea para Ingresar').closest('.fixed') as HTMLElement);

    // Verifica que la función onClose fue llamada una vez.
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

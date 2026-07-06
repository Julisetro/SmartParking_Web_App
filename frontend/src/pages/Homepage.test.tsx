import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { HomePage } from './HomePage';

/**
 * Función de utilidad (helper) que encapsula la renderisación del componente
 * Se envuelve LoginPage con MemoryRouter y AuthContext.Provider para simplificar
 * la configuración del entorno de prueba y evitar duplicación de código
 */
const setup = () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
};

describe('Pruebas para la HomePage', () => {
  it('Debe renderizar el contenido principal de bienvenida', () => {
    //Arrange: Renderiza el componente
    setup();
    //Act: Se buscan los elementos principales en la pantalla.
    const mainHeading = screen.getByRole('heading', {
      name: /Smart Parking/i,
      level: 1,
    });
    const subHeading = screen.getByRole('heading', {
      name: /¡Bienvenido!/i,
      level: 2,
    });
    const logo = screen.getByAltText(/Logo de Smart Parking/i);

    //Assert: Se verifica que los elementos principales se encuentren en la pantalla.
    expect(mainHeading).toBeInTheDocument();
    expect(subHeading).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
  });

  it('debe tener enlaces correctos para Iniciar Sesión y Registrarse', () => {
    //Arrange: Renderiza el componente
    setup();
    // Act: Se buscan los enlaces por su texto visible
    const loginLink = screen.getByRole('link', { name: /Iniciar Sesión/i });
    const registerLink = screen.getByRole('link', { name: /Registrarse/i });
    // Assert: Se verifica que los enlaces existan y apunten a la ruta correcta
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});

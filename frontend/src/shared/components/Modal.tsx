import type { ReactNode } from 'react';
import ReactDOM from 'react-dom';

// Define las propiedades (props) que el componente Modal acepta.
interface ModalProps {
  isOpen: boolean; // Controla si el modal está visible o no.
  onClose: () => void; // Función que se llama para cerrar el modal.
  title: string; // Título que se muestra en el encabezado del modal.
  children: ReactNode; // Contenido a renderizar dentro del modal.
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Si el modal no está abierto, no se renderiza nada.
  if (!isOpen) {
    return null;
  }

  // Se usa un Portal de React para renderizar el modal al final del <body>.
  // Esto evita problemas de apilamiento (z-index) y estilos del contenedor padre.
  return ReactDOM.createPortal(
    // Contenedor principal: es el backdrop y el contenedor flex que centra el contenido.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity">
      {/* Panel del Modal: es el hijo directo del contenedor. */}
      <div
        className="relative w-full max-w-lg rounded-lg bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Evita que los clics dentro del modal se propaguen al padre.
      >
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="font-sans text-xl font-bold text-text-main">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar modal"
          >
            {/* Icono de 'X' para cerrar */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {/* Cuerpo del Modal: aquí se renderiza el contenido (children). */}
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

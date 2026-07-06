// src/features/reservations/components/QRCodeModal.tsx
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeValue: string;
}

/**
 * Componente modal para mostrar un código QR generado.
 *
 * @param {QRCodeModalProps} props - Propiedades para controlar el modal y el valor del QR.
 * @returns {JSX.Element | null} El modal con el código QR o null si no está abierto.
 */
const QRCodeModal = ({ isOpen, onClose, qrCodeValue }: QRCodeModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-text-main text-center">
          Escanea para Ingresar
        </h2>
        <div className="p-4 bg-white rounded-lg border">
          {/* Renderiza el código QR como un SVG para máxima calidad y escalabilidad */}
          <QRCodeSVG value={qrCodeValue} size={256} includeMargin={true} />
        </div>
        <p className="text-sm text-gray-500 max-w-xs text-center">
          Presenta este código en el lector de la entrada del parqueadero.
        </p>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;

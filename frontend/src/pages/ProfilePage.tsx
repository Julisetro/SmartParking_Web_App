import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ChangePasswordModal } from '../features/profile/components/ChangePasswordModal';
import { ChangeEmailModal } from '../features/profile/components/ChangeEmailModal';
import { ChangeCelularModal } from '../features/profile/components/ChangeCelularModal';
import { updateUserProfile } from '../features/profile/api/profileApi';

// Componente para una fila de información en el perfil
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="mt-1 text-lg text-gray-900">{value}</p>
  </div>
);

export const ProfilePage = () => {
  const { user, updateUser: updateUserContext } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [isCelularModalOpen, setIsCelularModalOpen] = useState(false);

  // Efecto para inicializar el formulario cuando los datos del usuario están disponibles
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    // Llama a la API para actualizar el perfil del usuario
    try {
      const updateUser = await updateUserProfile(formData);
      updateUserContext(updateUser);
      setSuccess('¡Tu información ha sido actualizada con éxito!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error al actualizar el perfil de usuario:', err);
      setError('Ocurrió un error al actualizar tu información.');
    } finally {
      setIsLoading(false);
    }
  };
  // Funcion para manejar el éxito del cambio de celular.
  // Pasará como prop al modal
  const handleCelularChangeSuccess = () => {
    alert('¡Celular cambiado con éxito!');
    setIsCelularModalOpen(false);
    window.location.reload();
  };

  if (!user) {
    return <div>Cargando perfil...</div>; // carga el perfil
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-text-main">
          Configuración de la Cuenta
        </h1>
        <p className="mt-1 text-lg text-text-secondary">
          Gestiona tu información personal y de seguridad.
        </p>
      </div>
      {/* Sección de Información Personal */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-text-main">
              Información Personal
            </h2>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
              >
                Editar
              </button>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {isEditing ? (
              <>
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </>
            ) : (
              <>
                <InfoRow label="Nombre" value={user.first_name} />
                <InfoRow label="Apellido" value={user.last_name} />
              </>
            )}
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Cédula" value={user.cedula || 'No especificada'} />
            <InfoRow
              label="Celular"
              value={user.celular || 'No especificado'}
            />
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                  setSuccess(null);
                }}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}

          {success && <p className="mt-4 text-sm text-green-600">{success}</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </form>
      </div>
      {/* Sección de Seguridad (Placeholder) */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-xl font-bold text-text-main">Seguridad</h2>
        </div>
        <div className="mt-6 space-y-4">
          {/* Cambiar contraseña */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">Cambiar Contraseña</p>
              <p className="text-sm text-gray-500">
                Se recomienda usar una contraseña segura que no uses en otros
                sitios.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)} // Abre el modal
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
            >
              Actualizar
            </button>
          </div>
          {/* Aquí van otras opciones de seguridad */}
          {/* Cambiar email */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-6">
            <div>
              <p className="font-medium text-gray-900">Cambiar Email</p>
              <p className="text-sm text-gray-500">
                Se recomienda usar un email seguro que no uses en otros sitios.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChangeEmailModalOpen(true)}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
            >
              Actualizar
            </button>
          </div>
          {/* Cambiar Celular */}
          <div className="flex justify-between items-center border-t border-gray-200 pt-6">
            <div>
              <p className="font-medium text-gray-900">Cambiar Celular</p>
              <p className="text-sm text-gray-500">
                Actualiza el número de celular asociado a tu cuenta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCelularModalOpen(true)} // Abre el modal
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
      {isChangeEmailModalOpen && (
        <ChangeEmailModal
          isOpen={isChangeEmailModalOpen}
          onClose={() => setIsChangeEmailModalOpen(false)}
        />
      )}
      {isCelularModalOpen && (
        <ChangeCelularModal
          isOpen={isCelularModalOpen}
          onClose={() => setIsCelularModalOpen(false)}
          onSuccess={handleCelularChangeSuccess}
        />
      )}
    </div>
  );
};

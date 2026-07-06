// src/features/profile/api/profileApi.test.ts

import { describe, it, expect, vi, afterEach } from 'vitest';
import apiClient from '../../../shared/api/client';
import {
  changePassword,
  updateUserProfile,
  changeEmail,
  changeCelular,
  changeCelularConfirm,
} from './profileApi';
import type {
  ChangePasswordData,
  ChangeEmailData,
  ChangeCelularData,
  ChangeCelularConfirmData,
} from '../components/types/profileTypes';
import type { User } from '../../auth/context/AuthContext';

// Mock del apiClient para aislar las pruebas de la red.
vi.mock('../../../shared/api/client');

describe('Profile API Functions', () => {
  // Limpia los mocks después de cada prueba para asegurar que no interfieran entre sí.
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Pruebas para changePassword
  describe('changePassword', () => {
    it('should call apiClient.post with the correct endpoint and data', async () => {
      const passwordData: ChangePasswordData = {
        old_password: 'oldPassword123',
        new_password: 'newPassword123',
        new_password2: 'newPassword123',
      };

      // Simula una respuesta exitosa (no devuelve contenido)
      vi.mocked(apiClient.post).mockResolvedValue({});

      await changePassword(passwordData);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/change-password/',
        passwordData
      );
    });
  });

  // Pruebas para updateUserProfile
  describe('updateUserProfile', () => {
    it('should call apiClient.put with the correct endpoint and data, and return user data', async () => {
      const userData: Partial<User> = {
        first_name: 'John',
        last_name: 'Doe',
      };
      const updatedUser: User = {
        id: 1,
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        cedula: '123456',
        celular: '3001112233',
      };

      // Simula una respuesta exitosa que devuelve el usuario actualizado
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedUser });

      const result = await updateUserProfile(userData);

      expect(apiClient.put).toHaveBeenCalledTimes(1);
      expect(apiClient.put).toHaveBeenCalledWith('/users/me/', userData);
      expect(result).toEqual(updatedUser);
    });
  });

  // Pruebas para changeEmail
  describe('changeEmail', () => {
    it('should call apiClient.post with the correct endpoint and data', async () => {
      const emailData: ChangeEmailData = {
        password: 'password123',
        new_email: 'new.email@example.com',
      };

      vi.mocked(apiClient.post).mockResolvedValue({});

      await changeEmail(emailData);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/change-email/',
        emailData
      );
    });
  });

  // Pruebas para changeCelular
  describe('changeCelular', () => {
    it('should call apiClient.post with the correct endpoint and data', async () => {
      const celularData: ChangeCelularData = {
        password: 'password123',
        new_celular: '3009876543',
      };

      vi.mocked(apiClient.post).mockResolvedValue({});

      await changeCelular(celularData);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/change-celular/',
        celularData
      );
    });
  });

  // Pruebas para changeCelularConfirm
  describe('changeCelularConfirm', () => {
    it('should call apiClient.post with the correct endpoint and data', async () => {
      const confirmData: ChangeCelularConfirmData = {
        verification_code: '123456',
      };

      vi.mocked(apiClient.post).mockResolvedValue({});

      await changeCelularConfirm(confirmData);

      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/users/change-celular/confirm/',
        confirmData
      );
    });
  });

  // Ejemplo de prueba de manejo de errores
  describe('Error Handling', () => {
    it('should throw an error if apiClient.post rejects', async () => {
      const apiError = new Error('Network Error');
      vi.mocked(apiClient.post).mockRejectedValue(apiError);

      const emailData: ChangeEmailData = {
        password: 'password123',
        new_email: 'new.email@example.com',
      };

      // Se espera que la promesa sea rechazada con el mismo error
      await expect(changeEmail(emailData)).rejects.toThrow('Network Error');
    });

    it('should throw an error if apiClient.put rejects', async () => {
      const apiError = new Error('Update Failed');
      vi.mocked(apiClient.put).mockRejectedValue(apiError);

      const userData: Partial<User> = {
        first_name: 'John',
      };

      await expect(updateUserProfile(userData)).rejects.toThrow(
        'Update Failed'
      );
    });
  });
});

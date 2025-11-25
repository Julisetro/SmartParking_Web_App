import { describe, it, expect, vi } from 'vitest';
import apiClient from '../../../shared/api/client';
import { registerUser, loginUser, logoutUser } from './auth';

vi.mock('../../../shared/api/client');

// Datos de usuario simulados
describe('Auth API Functions', () => {
  it('registerUser should call apiClient.post with correct data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
      cedula: '123456789',
      celular: '3001234567',
    };
    await registerUser(userData);
    expect(apiClient.post).toHaveBeenCalledWith('/users/register/', userData);
  });

  // Prueba para la función de login
  it('loginUser should call apiClient.post and return tokens', async () => {
    const tokens = { access: 'access_token', refresh: 'refresh_token' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: tokens });
    const result = await loginUser('test@example.com', 'password123');
    expect(apiClient.post).toHaveBeenCalledWith('/users/login/', {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toEqual(tokens);
  });
  // Prueba para la función de logout
  it('logoutUser should call apiClient.post with refresh token', async () => {
    const refreshToken = 'refresh_token';
    await logoutUser(refreshToken);
    expect(apiClient.post).toHaveBeenCalledWith('/users/logout/', {
      refresh: refreshToken,
    });
  });
});

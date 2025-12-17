import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ResetPassword from '../pages/admin/ResetPassword';

/* eslint-disable @typescript-eslint/no-explicit-any */

const renderWithRouter = (token = 'valid-token') => {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/session" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders reset password form correctly', () => {
    renderWithRouter();
    
    expect(screen.getByRole('heading', { name: /restablecer contraseña/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restablecer/i })).toBeInTheDocument();
  });

  it('shows error when token is missing', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(passwordInput, 'newPassword123');
    await user.type(confirmInput, 'newPassword123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/token inválido o expirado/i)).toBeInTheDocument();
    });
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows error when password is too short', async () => {
    const user = userEvent.setup();
    renderWithRouter();
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(passwordInput, '12345');
    await user.type(confirmInput, '12345');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    });
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithRouter();
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'different123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('successfully resets password and redirects', async () => {
    const user = userEvent.setup();
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    renderWithRouter();
    
    // Use IDs instead of labels since they're unambiguous
    const newPasswordInput = document.getElementById('new-password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(newPasswordInput, 'newPassword123');
    await user.type(confirmPasswordInput, 'newPassword123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/contraseña actualizada.*redirigiendo/i)).toBeInTheDocument();
    });
    
    expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token', password: 'newPassword123' })
    });
    
});

  it('shows error message from server', async () => {
    const user = userEvent.setup();
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: false,
        message: 'Token inválido o expirado.' 
      })
    });

    renderWithRouter();
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(passwordInput, 'newPassword123');
    await user.type(confirmInput, 'newPassword123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/token inválido o expirado/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void = () => {};
    const promise = new Promise((resolve) => { resolvePromise = resolve; });
    
    (fetch as any).mockReturnValueOnce(promise);

    renderWithRouter();
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(passwordInput, 'newPassword123');
    await user.type(confirmInput, 'newPassword123');
    
    await act(async () => {
      await user.click(submitButton);
      // Button should immediately show loading state
      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
    });
    
    // Resolve the promise to cleanup
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({ success: true })
      });
    });
  });

  it('shows network error on fetch failure', async () => {
    const user = userEvent.setup();
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter();
    
    const passwordInput = screen.getByLabelText(/nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/confirmar contraseña/i);
    const submitButton = screen.getByRole('button', { name: /restablecer/i });
    
    await user.type(passwordInput, 'newPassword123');
    await user.type(confirmInput, 'newPassword123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error al restablecer la contraseña/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithRouter();
    
    const newPasswordInput = document.getElementById('new-password') as HTMLInputElement;
    const toggleButtons = screen.getAllByLabelText(/mostrar contraseña/i);
    const toggleButton = toggleButtons[0]; // Get only the first one (password field)
    
    // Initially should be password type
    expect(newPasswordInput.type).toBe('password');
    
    // Click to show password
    await user.click(toggleButton);
    expect(newPasswordInput.type).toBe('text');
    
    // Click again to hide password
    await user.click(toggleButton);
    expect(newPasswordInput.type).toBe('password');
  });
});

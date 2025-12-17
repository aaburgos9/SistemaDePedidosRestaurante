import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ForgotPassword from '../pages/admin/ForgotPassword';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders forgot password form correctly', () => {
    render(<ForgotPassword />);
    
    expect(screen.getByRole('heading', { name: /recuperar contraseña/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);
    
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission (required attribute)
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows error when user does not exist', async () => {
    const user = userEvent.setup();
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ 
        success: false, 
        message: 'No existe un usuario registrado con ese correo electrónico.' 
      })
    });

    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
    
    await user.type(emailInput, 'noexiste@test.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/no existe un usuario registrado/i)).toBeInTheDocument();
    });
  });

  it('shows success message when email is sent successfully', async () => {
    const user = userEvent.setup();
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ 
        success: true,
        message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña.'
      })
    });

    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
    
    await user.type(emailInput, 'usuario@test.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/se ha enviado un correo/i)).toBeInTheDocument();
    });
    
    // Form should be hidden after success
    expect(screen.queryByLabelText(/correo electrónico/i)).not.toBeInTheDocument();
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: unknown) => void = () => {};
    const promise = new Promise((resolve) => { resolvePromise = resolve; });
    
    (fetch as any).mockReturnValueOnce(promise);

    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
    
    await user.type(emailInput, 'usuario@test.com');
    
    await act(async () => {
      await user.click(submitButton);
      // Button should immediately show loading state
      expect(screen.getByRole('button', { name: /enviando/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviando/i })).toBeDisabled();
    });
    
    // Resolve the promise to cleanup
    await act(async () => {
      resolvePromise({
        ok: true,
        json: async () => ({ success: true })
      });
    });
  });

  it('shows network error message on fetch failure', async () => {
    const user = userEvent.setup();
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole('button', { name: /enviar enlace/i });
    
    await user.type(emailInput, 'usuario@test.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error al enviar el correo.*verifica tu conexión/i)).toBeInTheDocument();
    });
  });

  // Note: Empty/whitespace email validation is handled by HTML5 'required' attribute
  // which prevents form submission before reaching our validation logic

  it('calls correct API endpoint with email', async () => {
    const user = userEvent.setup();
    (fetch as any).mockResolvedValueOnce({
    });

    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });
    });
  });
});

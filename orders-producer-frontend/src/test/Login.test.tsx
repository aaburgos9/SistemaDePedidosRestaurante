import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/admin/Login';
import * as adminService from '../services/adminService';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock the auth store
vi.mock('../store/auth', () => ({
  useAuth: () => ({
    setAuth: vi.fn(),
  }),
}));

// Mock adminService
vi.mock('../services/adminService');

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/session']}>
      <Routes>
        <Route path="/session" element={<Login />} />
        <Route path="/admin/dashboard" element={<div>Dashboard Page</div>} />
        <Route path="/mesero" element={<div>Mesero Page</div>} />
        <Route path="/cocina" element={<div>Cocina Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithRouter();
    
    expect(screen.getByRole('heading', { name: /bienvenido a rápido y sabroso/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(document.getElementById('password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toBeInTheDocument();
  });

  it('shows error on invalid credentials', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.adminLogin).mockResolvedValueOnce({
      success: false,
      message: 'Invalid credentials'
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'wrong@test.com');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('redirects admin user to dashboard on successful login', async () => {
    const user = userEvent.setup();
    const mockSetAuth = vi.fn();
    
    vi.mocked(adminService.adminLogin).mockResolvedValueOnce({
      success: true,
      user: {
        id: '1',
        email: 'admin@test.com',
        roles: ['admin']
      }
    });

    // Re-mock the useAuth hook to capture setAuth calls
    // @ts-expect-error Assigning to readonly property for test mocking
    vi.mocked(await import('../store/auth')).useAuth = () => ({
      setAuth: mockSetAuth,
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'admin@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith({
        id: '1',
        email: 'admin@test.com',
        roles: ['admin']
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  it('shows network error on fetch failure', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.adminLogin).mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithRouter();
    
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const toggleButtons = screen.getAllByLabelText(/mostrar contraseña/i);
    const toggleButton = toggleButtons[0];
    
    // Initially should be password type
    expect(passwordInput.type).toBe('password');
    
    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    // Click again to hide password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('calls adminLogin with correct credentials', async () => {
    const user = userEvent.setup();
    vi.mocked(adminService.adminLogin).mockResolvedValueOnce({
      success: true,
      user: { id: '1', email: 'test@test.com', roles: ['admin'] }
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'mypassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(adminService.adminLogin).toHaveBeenCalledWith('test@example.com', 'mypassword');
    });
  });

  it('navigates to forgot password page when link is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/session']}>
        <Routes>
          <Route path="/session" element={<Login />} />
          <Route path="/recuperar" element={<div>Forgot Password Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    const forgotPasswordLink = screen.getByRole('link', { name: /olvidaste tu contraseña/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '/recuperar');
  });

  it('handles login with roles and redirects correctly for waiter', async () => {
    const user = userEvent.setup();
    const mockSetAuth = vi.fn();
    
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
    
    vi.mocked(adminService.adminLogin).mockResolvedValueOnce({
      success: true,
      user: {
        id: '2',
        email: 'waiter@test.com',
        roles: ['waiter']
      }
    });

    // @ts-expect-error Assigning to readonly property for test mocking
    vi.mocked(await import('../store/auth')).useAuth = () => ({
      setAuth: mockSetAuth,
    });

    renderWithRouter();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    await user.type(emailInput, 'waiter@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(window.location.href).toBe('/mesero');
    });
  });
});

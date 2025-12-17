import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../store/auth';

// Mock the auth store
vi.mock('../store/auth', () => ({
  useAuth: vi.fn()
}));

const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Sidebar Component', () => {
  const mockUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    roles: ['admin']
  };

  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      token: 'test-token'
    });
  });

  const renderSidebar = (initialRoute = '/admin/dashboard') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Sidebar />
      </MemoryRouter>
    );
  };

  it('renders sidebar with all menu items', () => {
    renderSidebar();

    expect(screen.getByText('Rápido y Sabroso')).toBeInTheDocument();
    expect(screen.getByText('Panel Principal')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
  });

  it('displays user information when user is logged in', () => {
    renderSidebar();

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
  });

  it('displays user initial in avatar', () => {
    renderSidebar();

    // Should show first letter of email uppercase
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('displays logout button', () => {
    renderSidebar();

    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('calls logout and navigates when logout button is clicked', async () => {
    const user = userEvent.setup();
    renderSidebar();

    const logoutButton = screen.getByText('Cerrar sesión');
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('highlights active menu item based on current route', () => {
    renderSidebar('/admin/products');

    const productsLink = screen.getByText('Productos').closest('a');
    expect(productsLink).toHaveClass('bg-zinc-800');
  });

  it('does not highlight inactive menu items', () => {
    renderSidebar('/admin/products');

    const dashboardLink = screen.getByText('Panel Principal').closest('a');
    expect(dashboardLink).not.toHaveClass('bg-zinc-800');
  });

  it('renders all menu item icons', () => {
    const { container } = renderSidebar();

    // Should have multiple SVG icons
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders correct links for navigation', () => {
    renderSidebar();

    const dashboardLink = screen.getByText('Panel Principal').closest('a');
    const productsLink = screen.getByText('Productos').closest('a');
    const usersLink = screen.getByText('Usuarios').closest('a');
    const settingsLink = screen.getByText('Configuración').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard');
    expect(productsLink).toHaveAttribute('href', '/admin/products');
    expect(usersLink).toHaveAttribute('href', '/admin/users');
    expect(settingsLink).toHaveAttribute('href', '/admin/settings');
  });

  it('shows fallback "Usuario" when user name is not available', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, name: '' },
      logout: mockLogout,
      token: 'test-token'
    });

    renderSidebar();

    expect(screen.getByText('Usuario')).toBeInTheDocument();
  });

  it('renders without crashing when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
      token: null
    });

    renderSidebar();

    // Should still render but without user info
    expect(screen.getByText('Rápido y Sabroso')).toBeInTheDocument();
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
  });

  it('applies hover styles to menu items', () => {
    renderSidebar();

    const dashboardLink = screen.getByText('Panel Principal').closest('a');
    expect(dashboardLink).toHaveClass('hover:bg-zinc-700/80');
  });

  it('has correct styling classes', () => {
    const { container } = renderSidebar();

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('h-screen');
    expect(aside).toHaveClass('w-64');
    expect(aside).toHaveClass('bg-[#18181b]');
    expect(aside).toHaveClass('fixed');
  });
});

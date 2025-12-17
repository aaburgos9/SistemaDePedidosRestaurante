import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth } from '../store/auth';

// Mock fetch for logout tests
global.fetch = vi.fn();

describe('Auth Store (Cookie-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store state
    useAuth.getState().clear();
  });

  it('initializes with null values', () => {
    const { user, isAuthenticated } = useAuth.getState();
    
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('sets authentication data correctly (no token stored)', () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      roles: ['admin']
    };

    useAuth.getState().setAuth(mockUser);

    const state = useAuth.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('clears authentication data', () => {
    // First set some auth data
    const mockUser = {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      roles: ['admin']
    };

    useAuth.getState().setAuth(mockUser);
    
    // Verify it's set
    expect(useAuth.getState().isAuthenticated).toBe(true);
    
    // Clear it
    useAuth.getState().clear();

    const state = useAuth.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logs out user correctly with API call', async () => {
    // Mock successful logout response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    // Setup auth
    const mockUser = {
      id: '3',
      name: 'Logout Test',
      email: 'logout@example.com',
      roles: ['admin']
    };

    useAuth.getState().setAuth(mockUser);
    
    // Logout
    await useAuth.getState().logout();

    const state = useAuth.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    
    // Verify API call was made
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      })
    );
  });

  it('handles logout API failure gracefully', async () => {
    // Mock failed logout response
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    // Setup auth
    const mockUser = {
      id: '4',
      name: 'Error Test',
      email: 'error@example.com',
      roles: ['admin']
    };

    useAuth.getState().setAuth(mockUser);
    
    // Logout should still clear local state even if API fails
    await useAuth.getState().logout();

    const state = useAuth.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('correctly identifies user roles', () => {
    const adminUser = {
      id: '5',
      name: 'Admin User',
      email: 'admin@test.com',
      roles: ['admin', 'manager']
    };

    useAuth.getState().setAuth(adminUser);

    const state = useAuth.getState();
    expect(state.user?.roles).toContain('admin');
    expect(state.user?.roles).toContain('manager');
    expect(state.user?.roles.length).toBe(2);
  });

  it('handles multiple auth changes correctly', () => {
    const user1 = { id: '6', name: 'User 1', email: 'user1@test.com', roles: ['admin'] };
    const user2 = { id: '7', name: 'User 2', email: 'user2@test.com', roles: ['waiter'] };

    // First auth
    useAuth.getState().setAuth(user1);
    expect(useAuth.getState().user?.name).toBe('User 1');
    expect(useAuth.getState().isAuthenticated).toBe(true);

    // Second auth (simulating login as different user)
    useAuth.getState().setAuth(user2);
    expect(useAuth.getState().user?.name).toBe('User 2');
    expect(useAuth.getState().isAuthenticated).toBe(true);
  });
});

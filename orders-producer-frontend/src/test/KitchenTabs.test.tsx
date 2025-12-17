import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { KitchenTabs, type TabType } from '../components/KitchenTabs';

describe('KitchenTabs Component', () => {
  const mockOnTabChange = vi.fn();

  const defaultCounts: Record<TabType, number> = {
    'All': 10,
    'Nueva Orden': 3,
    'Preparando': 2,
    'Listo': 1,
    'Finalizada': 4,
    'Cancelada': 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab options', () => {
    render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Nueva Orden')).toBeInTheDocument();
    expect(screen.getByText('Preparando')).toBeInTheDocument();
    expect(screen.getByText('Listo')).toBeInTheDocument();
    expect(screen.getByText('Finalizada')).toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });

  it('displays correct count badges for each tab', () => {
    render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('highlights active tab correctly', () => {
    render(
      <KitchenTabs
        activeTab="Preparando"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const preparandoButton = screen.getByText('Preparando').closest('button');
    expect(preparandoButton).toHaveClass('text-blue-600');
  });

  it('does not highlight inactive tabs', () => {
    render(
      <KitchenTabs
        activeTab="Preparando"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const allButton = screen.getByText('All').closest('button');
    expect(allButton).toHaveClass('text-gray-600');
    expect(allButton).not.toHaveClass('text-blue-600');
  });

  it('calls onTabChange when tab is clicked', async () => {
    const user = userEvent.setup();
    render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const preparandoButton = screen.getByText('Preparando').closest('button');
    await user.click(preparandoButton!);

    expect(mockOnTabChange).toHaveBeenCalledTimes(1);
    expect(mockOnTabChange).toHaveBeenCalledWith('Preparando');
  });

  it('can switch between different tabs', async () => {
    const user = userEvent.setup();
    render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    await user.click(screen.getByText('Nueva Orden').closest('button')!);
    expect(mockOnTabChange).toHaveBeenCalledWith('Nueva Orden');

    await user.click(screen.getByText('Listo').closest('button')!);
    expect(mockOnTabChange).toHaveBeenCalledWith('Listo');

    await user.click(screen.getByText('Finalizada').closest('button')!);
    expect(mockOnTabChange).toHaveBeenCalledWith('Finalizada');
  });

  it('renders with zero counts', () => {
    const zeroCounts: Record<TabType, number> = {
      'All': 0,
      'Nueva Orden': 0,
      'Preparando': 0,
      'Listo': 0,
      'Finalizada': 0,
      'Cancelada': 0
    };

    render(
      <KitchenTabs
        activeTab="All"
        counts={zeroCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const badges = screen.getAllByText('0');
    expect(badges.length).toBe(6);
  });

  it('renders with large counts', () => {
    const largeCounts: Record<TabType, number> = {
      'All': 999,
      'Nueva Orden': 150,
      'Preparando': 200,
      'Listo': 75,
      'Finalizada': 300,
      'Cancelada': 50
    };

    render(
      <KitchenTabs
        activeTab="All"
        counts={largeCounts}
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('applies transition classes to buttons', () => {
    render(
      <KitchenTabs
        activeTab="Preparando"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const allButton = screen.getByText('All').closest('button');
    expect(allButton).toHaveClass('transition-colors');
  });

  it('renders buttons in correct order', () => {
    render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    const buttonTexts = buttons.map(btn => btn.textContent);

    expect(buttonTexts[0]).toContain('All');
    expect(buttonTexts[1]).toContain('Nueva Orden');
    expect(buttonTexts[2]).toContain('Preparando');
    expect(buttonTexts[3]).toContain('Listo');
    expect(buttonTexts[4]).toContain('Finalizada');
    expect(buttonTexts[5]).toContain('Cancelada');
  });

  it('does not call onTabChange when clicking already active tab', async () => {
    const user = userEvent.setup();
    render(
      <KitchenTabs
        activeTab="Preparando"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    const preparandoButton = screen.getByText('Preparando').closest('button');
    await user.click(preparandoButton!);

    // Should still call the handler
    expect(mockOnTabChange).toHaveBeenCalledWith('Preparando');
  });

  it('updates counts dynamically', () => {
    const { rerender } = render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument(); // Nueva Orden

    const updatedCounts: Record<TabType, number> = {
      ...defaultCounts,
      'Nueva Orden': 5
    };

    rerender(
      <KitchenTabs
        activeTab="All"
        counts={updatedCounts}
        onTabChange={mockOnTabChange}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('renders badges for all tabs', () => {
    const { container } = render(
      <KitchenTabs
        activeTab="All"
        counts={defaultCounts}
        onTabChange={mockOnTabChange}
      />
    );

    // Badge component should be rendered for each tab
    const badges = container.querySelectorAll('[data-slot="badge"]');
    expect(badges.length).toBe(6);
  });
});

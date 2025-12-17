import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/order';

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Hamburguesa Clásica',
    price: 15000,
    desc: 'Deliciosa hamburguesa',
    image: '/images/hamburger.jpg'
  };

  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
    expect(screen.getByText(/\$.*15\.000/)).toBeInTheDocument();
    expect(screen.getByAltText('Hamburguesa Clásica')).toBeInTheDocument();
  });

  it('displays product image with correct src', () => {
    render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    const image = screen.getByAltText('Hamburguesa Clásica') as HTMLImageElement;
    expect(image.src).toContain('/images/hamburger.jpg');
  });

  it('formats price in Colombian pesos correctly', () => {
    render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    // Colombian peso format: $15.000 (with dot as thousands separator)
    // Using regex to handle non-breaking space between $ and number
    expect(screen.getByText(/\$.*15\.000/)).toBeInTheDocument();
  });

  it('calls onAdd with product when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    const addButton = screen.getByRole('button');
    await user.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith(mockProduct);
  });

  it('renders add button with plus icon', () => {
    render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    const addButton = screen.getByRole('button');
    expect(addButton).toBeInTheDocument();
    
    // Button should have Plus icon (rendered as SVG)
    const svg = addButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays different products correctly', () => {
    const product1 = { ...mockProduct, id: 1, name: 'Pizza Margherita', price: 25000 };
    const product2 = { ...mockProduct, id: 2, name: 'Pasta Carbonara', price: 18000 };

    const { rerender } = render(<ProductCard product={product1} onAdd={mockOnAdd} />);
    expect(screen.getByText('Pizza Margherita')).toBeInTheDocument();
    expect(screen.getByText(/\$.*25\.000/)).toBeInTheDocument();

    rerender(<ProductCard product={product2} onAdd={mockOnAdd} />);
    expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
    expect(screen.getByText(/\$.*18\.000/)).toBeInTheDocument();
  });

  it('handles products with long names correctly', () => {
    const longNameProduct = {
      ...mockProduct,
      name: 'Hamburguesa Especial con Queso Extra y Tocino Ahumado Premium'
    };

    render(<ProductCard product={longNameProduct} onAdd={mockOnAdd} />);

    expect(screen.getByText(longNameProduct.name)).toBeInTheDocument();
    // Text should be truncated with CSS (truncate class)
    const heading = screen.getByText(longNameProduct.name);
    expect(heading.className).toContain('truncate');
  });

  it('handles high-priced products correctly', () => {
    const expensiveProduct = {
      ...mockProduct,
      name: 'Cena Gourmet',
      price: 150000
    };

    render(<ProductCard product={expensiveProduct} onAdd={mockOnAdd} />);

    expect(screen.getByText(/\$.*150\.000/)).toBeInTheDocument();
  });

  it('renders card with correct styling classes', () => {
    const { container } = render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    // Card should have specific styling
    const card = container.querySelector('.bg-gray-100');
    expect(card).toBeInTheDocument();
  });

  it('can be clicked multiple times', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} onAdd={mockOnAdd} />);

    const addButton = screen.getByRole('button');
    
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(3);
    expect(mockOnAdd).toHaveBeenCalledWith(mockProduct);
  });

  it('accepts optional quantity prop', () => {
    const { rerender } = render(
      <ProductCard product={mockProduct} onAdd={mockOnAdd} quantity={5} />
    );

    // Component should render even with quantity prop
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();

    // Re-render with different quantity
    rerender(<ProductCard product={mockProduct} onAdd={mockOnAdd} quantity={10} />);
    expect(screen.getByText('Hamburguesa Clásica')).toBeInTheDocument();
  });
});

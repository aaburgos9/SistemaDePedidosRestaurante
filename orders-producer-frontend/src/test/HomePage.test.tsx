import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';

describe('HomePage', () => {
  it('should render the home page with two sections', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText("I'm a Chef")).toBeInTheDocument();
    expect(screen.getByText("I'm a Waiter")).toBeInTheDocument();
  });

  it('should render chef link with correct route', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const chefLink = screen.getByText("I'm a Chef").closest('a');
    expect(chefLink).toHaveAttribute('href', '/cocina');
  });

  it('should render waiter link with correct route', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const waiterLink = screen.getByText("I'm a Waiter").closest('a');
    expect(waiterLink).toHaveAttribute('href', '/mesero');
  });

  it('should render chef image with correct alt text', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const chefImage = screen.getByAltText('Chef');
    expect(chefImage).toBeInTheDocument();
    expect(chefImage).toHaveAttribute('src', '/images/chef-image.png');
  });

  it('should render waiter image with correct alt text', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const waiterImage = screen.getByAltText('Waiter');
    expect(waiterImage).toBeInTheDocument();
    expect(waiterImage).toHaveAttribute('src', '/images/waiter_image.png');
  });

  it('should have proper styling classes applied', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const mainContainer = screen.getByText("I'm a Chef").closest('div')?.parentElement;
    expect(mainContainer).toHaveClass('flex');
  });
});

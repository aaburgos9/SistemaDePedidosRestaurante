import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

describe('UI components basic rendering', () => {
  it('renders Card and subcomponents with data-slot attributes', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-header"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-title"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-description"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-action"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-content"]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="card-footer"]')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders Input with attributes', () => {
    const { container } = render(<Input type="text" placeholder="Nombre" aria-invalid="true" />)
    const input = screen.getByPlaceholderText('Nombre') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.getAttribute('data-slot')).toBe('input')
    expect(input.type).toBe('text')
    expect(container.querySelector('[aria-invalid="true"]')).toBeInTheDocument()
  })

  it('associates Label with Input via htmlFor', () => {
    render(
      <div>
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" />
      </div>
    )
    const input = screen.getByLabelText('Nombre')
    expect(input).toBeInTheDocument()
  })

  it('renders Textarea with placeholder', () => {
    const { container } = render(<Textarea placeholder="Descripción" />)
    const textarea = screen.getByPlaceholderText('Descripción')
    expect(textarea).toBeInTheDocument()
    expect(container.querySelector('[data-slot="textarea"]')).toBeInTheDocument()
  })

  it('renders Button with role and text', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button', { name: 'Click' })
    expect(btn).toBeInTheDocument()
  })

  it('renders Alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Atención</AlertTitle>
        <AlertDescription>Algo ocurrió</AlertDescription>
      </Alert>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Atención')).toBeInTheDocument()
    expect(screen.getByText('Algo ocurrió')).toBeInTheDocument()
  })

  it('renders Badge with text', () => {
    const { container } = render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(container.querySelector('[data-slot="badge"]')).toBeInTheDocument()
  })
})

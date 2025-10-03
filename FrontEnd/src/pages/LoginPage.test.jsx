import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom' 
import LoginPage from './LoginPage'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

test('renders header and login form', () => {
  renderWithRouter(<LoginPage />)
  expect(screen.getByText('Cóc Mua Xe')).toBeInTheDocument()
  expect(screen.getByText('Sign in')).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Phone number/)).toBeInTheDocument()
  expect(screen.getByPlaceholderText(/Password/)).toBeInTheDocument()
  expect(screen.getByText('SIGN IN')).toBeInTheDocument()
})

test('updates username and password when typing', () => {
  renderWithRouter(<LoginPage />)
  fireEvent.change(screen.getByPlaceholderText(/Phone number/), {
    target: { value: '1234567890' },
  })
  fireEvent.change(screen.getByPlaceholderText(/Password/), {
    target: { value: '123456' },
  })
  expect(screen.getByPlaceholderText(/Phone number/)).toHaveValue('1234567890')
  expect(screen.getByPlaceholderText(/Password/)).toHaveValue('123456')
})

test('submits login form without crashing', () => {
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  renderWithRouter(<LoginPage />)

  fireEvent.change(screen.getByPlaceholderText(/Phone number/), {
    target: { value: '1234567890' },
  })
  fireEvent.change(screen.getByPlaceholderText(/Password/), {
    target: { value: '123456' },
  })
  fireEvent.click(screen.getByText('SIGN IN'))

  expect(logSpy).toHaveBeenCalledWith('Local login with', {
    username: '1234567890',
    password: '123456',
  })

  logSpy.mockRestore()
})

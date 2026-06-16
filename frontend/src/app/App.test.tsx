import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from '../features/accounts/AuthContext'
import { apiConfig, isMockApi } from '../shared/api/config'
import { App } from './App'

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('requires authentication before showing the study workspace', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: /entrar/i })).toBeInTheDocument()
  })

  it('logs in through the API facade and shows mock-backed categories without a page reload', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /categorias/i })).toBeInTheDocument()
    expect(screen.getByText(/modo mock tempor/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Fundamentos de Django API/i).length).toBeGreaterThan(0)
  })

  it('shows the create category form from the category menu button', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /categorias/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /criar categoria/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nova categoria/i }))

    expect(screen.getByRole('heading', { name: /criar categoria/i })).toBeInTheDocument()
  })

  it('opens a category card and returns to the category menu', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await user.click(await screen.findByRole('button', { name: /Fundamentos de Django API/i }))

    expect(screen.getByRole('heading', { level: 1, name: /Fundamentos de Django API/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Contratos REST/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /voltar para categorias/i }))

    expect(screen.getByRole('heading', { name: /categorias/i })).toBeInTheDocument()
  })

  it('keeps the backend URL configurable by environment', () => {
    expect(apiConfig.baseUrl).toMatch(/\/api\/v1$/)
    expect(isMockApi).toBe(true)
  })
})

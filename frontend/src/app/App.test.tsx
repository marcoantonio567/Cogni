import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../features/accounts/AuthContext'
import { App } from './App'

vi.mock('../shared/api', () => {
  const overview = {
    progressoGeral: 50,
    categorias: [
      {
        id: 1,
        nome: 'Categoria de teste',
        descricao: 'Dados controlados pelo teste',
        totalSubtopicos: 2,
        subtopicosConcluidos: 1,
        progresso: 50,
        topicos: [
          {
            id: 1,
            categoriaId: 1,
            nome: 'Topico de teste',
            ordem: 1,
            totalSubtopicos: 2,
            subtopicosConcluidos: 1,
            progresso: 50,
            subtopicos: [
              {
                id: 1,
                nome: 'Subtopico de teste',
                concluido: false,
                ordem: 1,
                observacoes: '',
                subtopicos: [],
              },
            ],
          },
        ],
      },
    ],
  }

  return {
    api: {
      session: vi.fn().mockRejectedValue(new Error('sem sessao')),
      login: vi.fn().mockResolvedValue({
        user: { id: 1, username: 'teste', email: 'teste@example.com' },
      }),
      logout: vi.fn().mockResolvedValue(undefined),
      estudosOverview: vi.fn().mockResolvedValue(overview),
      dashboardSummary: vi.fn().mockResolvedValue({
        progressoGeral: 50,
        metrics: [],
        weekly: [],
      }),
    },
  }
})

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

  it('logs in through the API facade and shows categories without a page reload', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(screen.getByLabelText(/usuario/i), 'teste')
    await user.type(screen.getByLabelText(/senha/i), 'senha-segura-123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /categorias/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Categoria de teste/i).length).toBeGreaterThan(0)
  })

  it('shows the create category form from the category menu button', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(screen.getByLabelText(/usuario/i), 'teste')
    await user.type(screen.getByLabelText(/senha/i), 'senha-segura-123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /categorias/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /criar categoria/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /nova categoria/i }))

    expect(screen.getByRole('heading', { name: /criar categoria/i })).toBeInTheDocument()
  })

  it('opens a category card and returns to the category menu', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(screen.getByLabelText(/usuario/i), 'teste')
    await user.type(screen.getByLabelText(/senha/i), 'senha-segura-123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))
    await user.click(await screen.findByRole('button', { name: /Categoria de teste/i }))

    expect(screen.getByRole('heading', { level: 1, name: /Categoria de teste/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Topico de teste/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /voltar para categorias/i }))

    expect(screen.getByRole('heading', { name: /categorias/i })).toBeInTheDocument()
  })
})

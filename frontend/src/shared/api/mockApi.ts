import type {
  AuthCredentials,
  AuthResponse,
  Categoria,
  CreateCategoriaInput,
  CreateSubtopicoInput,
  CreateTopicoInput,
  DashboardSummary,
  EstudosOverview,
  ReorderInput,
  Subtopico,
  Topico,
  UserSession,
} from './types'

let nextId = 100

let sessionUser: UserSession | null = null

let categorias: Categoria[] = [
  {
    id: 1,
    nome: 'Fundamentos de Django API',
    descricao: 'Base para autenticação, serializers e endpoints versionados.',
    totalSubtopicos: 5,
    subtopicosConcluidos: 3,
    progresso: 60,
    topicos: [
      {
        id: 11,
        categoriaId: 1,
        nome: 'Contratos REST',
        ordem: 1,
        totalSubtopicos: 3,
        subtopicosConcluidos: 2,
        progresso: 67,
        subtopicos: [
          { id: 111, nome: 'Formato de erro padrão', concluido: true, ordem: 1 },
          { id: 112, nome: 'Paginação e filtros', concluido: true, ordem: 2 },
          { id: 113, nome: 'Permissões por usuário', concluido: false, ordem: 3 },
        ],
      },
      {
        id: 12,
        categoriaId: 1,
        nome: 'Autenticação',
        ordem: 2,
        totalSubtopicos: 2,
        subtopicosConcluidos: 1,
        progresso: 50,
        subtopicos: [
          { id: 121, nome: 'Login via API', concluido: true, ordem: 1 },
          { id: 122, nome: 'Sessão atual', concluido: false, ordem: 2 },
        ],
      },
    ],
  },
  {
    id: 2,
    nome: 'Frontend separado',
    descricao: 'Interface React consumindo somente a API pública.',
    totalSubtopicos: 4,
    subtopicosConcluidos: 1,
    progresso: 25,
    topicos: [
      {
        id: 21,
        categoriaId: 2,
        nome: 'Fluxo de estudos',
        ordem: 1,
        totalSubtopicos: 4,
        subtopicosConcluidos: 1,
        progresso: 25,
        subtopicos: [
          { id: 211, nome: 'Listar categorias', concluido: true, ordem: 1 },
          { id: 212, nome: 'Criar tópicos', concluido: false, ordem: 2 },
          { id: 213, nome: 'Checkbox sem reload', concluido: false, ordem: 3 },
          { id: 214, nome: 'Ordenação visual', concluido: false, ordem: 4 },
        ],
      },
    ],
  },
]

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 180))

const cloneOverview = (): EstudosOverview => {
  refreshMockProgress()

  const total = categorias.reduce((sum, categoria) => sum + categoria.totalSubtopicos, 0)
  const done = categorias.reduce((sum, categoria) => sum + categoria.subtopicosConcluidos, 0)

  return {
    progressoGeral: total === 0 ? 0 : Math.round((done / total) * 100),
    categorias: structuredClone(categorias),
  }
}

const refreshMockProgress = () => {
  categorias = categorias.map((categoria) => {
    const topicos = categoria.topicos.map((topico) => {
      const totalSubtopicos = topico.subtopicos.length
      const subtopicosConcluidos = topico.subtopicos.filter((subtopico) => subtopico.concluido).length

      return {
        ...topico,
        totalSubtopicos,
        subtopicosConcluidos,
        progresso: totalSubtopicos === 0 ? 0 : Math.round((subtopicosConcluidos / totalSubtopicos) * 100),
      }
    })

    const totalSubtopicos = topicos.reduce((sum, topico) => sum + topico.totalSubtopicos, 0)
    const subtopicosConcluidos = topicos.reduce((sum, topico) => sum + topico.subtopicosConcluidos, 0)

    return {
      ...categoria,
      topicos,
      totalSubtopicos,
      subtopicosConcluidos,
      progresso: totalSubtopicos === 0 ? 0 : Math.round((subtopicosConcluidos / totalSubtopicos) * 100),
    }
  })
}

const findTopico = (topicoId: number): Topico | undefined =>
  categorias.flatMap((categoria) => categoria.topicos).find((topico) => topico.id === topicoId)

const findSubtopico = (subtopicoId: number): Subtopico | undefined =>
  categorias
    .flatMap((categoria) => categoria.topicos)
    .flatMap((topico) => topico.subtopicos)
    .find((subtopico) => subtopico.id === subtopicoId)

const reorderByIds = <T extends { id: number; ordem: number }>(items: T[], ids: number[]) => {
  const byId = new Map(items.map((item) => [item.id, item]))

  return ids
    .map((id, index) => {
      const item = byId.get(id)

      if (!item) {
        throw new Error('Item inexistente na lista simulada.')
      }

      return { ...item, ordem: index + 1 }
    })
    .sort((a, b) => a.ordem - b.ordem)
}

export const mockApi = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await wait()

    sessionUser = {
      id: 1,
      nome: credentials.email.split('@')[0] || 'Estudante',
      email: credentials.email,
    }

    return {
      user: sessionUser,
      accessToken: 'mock-temporary-token',
    }
  },

  async logout() {
    await wait()
    sessionUser = null
  },

  async session() {
    await wait()

    if (!sessionUser) {
      throw new Error('Sessão mock não iniciada.')
    }

    return sessionUser
  },

  async estudosOverview() {
    await wait()
    return cloneOverview()
  },

  async createCategoria(input: CreateCategoriaInput) {
    await wait()

    categorias = [
      ...categorias,
      {
        id: nextId++,
        nome: input.nome,
        descricao: input.descricao,
        totalSubtopicos: 0,
        subtopicosConcluidos: 0,
        progresso: 0,
        topicos: [],
      },
    ]

    return cloneOverview()
  },

  async createTopico(input: CreateTopicoInput) {
    await wait()

    categorias = categorias.map((categoria) => {
      if (categoria.id !== input.categoriaId) {
        return categoria
      }

      return {
        ...categoria,
        topicos: [
          ...categoria.topicos,
          {
            id: nextId++,
            categoriaId: categoria.id,
            nome: input.nome,
            ordem: categoria.topicos.length + 1,
            totalSubtopicos: 0,
            subtopicosConcluidos: 0,
            progresso: 0,
            subtopicos: [],
          },
        ],
      }
    })

    return cloneOverview()
  },

  async createSubtopico(input: CreateSubtopicoInput) {
    await wait()

    categorias = categorias.map((categoria) => ({
      ...categoria,
      topicos: categoria.topicos.map((topico) => {
        if (topico.id !== input.topicoId) {
          return topico
        }

        return {
          ...topico,
          subtopicos: [
            ...topico.subtopicos,
            {
              id: nextId++,
              nome: input.nome,
              concluido: false,
              ordem: topico.subtopicos.length + 1,
              observacoes: input.observacoes,
            },
          ],
        }
      }),
    }))

    return cloneOverview()
  },

  async toggleSubtopico(subtopicoId: number, concluido: boolean) {
    await wait()

    categorias = categorias.map((categoria) => ({
      ...categoria,
      topicos: categoria.topicos.map((topico) => ({
        ...topico,
        subtopicos: topico.subtopicos.map((subtopico) =>
          subtopico.id === subtopicoId ? { ...subtopico, concluido } : subtopico,
        ),
      })),
    }))

    const subtopico = findSubtopico(subtopicoId)

    if (!subtopico) {
      throw new Error('Subtópico não encontrado na API simulada.')
    }

    refreshMockProgress()
    return structuredClone(subtopico)
  },

  async reorderTopicos(input: ReorderInput) {
    await wait()

    categorias = categorias.map((categoria) => {
      if (categoria.id !== input.parentId) {
        return categoria
      }

      return {
        ...categoria,
        topicos: reorderByIds(categoria.topicos, input.itemIds),
      }
    })

    return cloneOverview()
  },

  async reorderSubtopicos(input: ReorderInput) {
    await wait()

    categorias = categorias.map((categoria) => ({
      ...categoria,
      topicos: categoria.topicos.map((topico) => {
        if (topico.id !== input.parentId) {
          return topico
        }

        return {
          ...topico,
          subtopicos: reorderByIds(topico.subtopicos, input.itemIds),
        }
      }),
    }))

    if (!findTopico(input.parentId)) {
      throw new Error('Tópico não encontrado na API simulada.')
    }

    return cloneOverview()
  },

  async dashboardSummary(): Promise<DashboardSummary> {
    await wait()

    const overview = cloneOverview()
    const totalCategorias = overview.categorias.length
    const totalTopicos = overview.categorias.reduce((sum, categoria) => sum + categoria.topicos.length, 0)
    const totalSubtopicos = overview.categorias.reduce((sum, categoria) => sum + categoria.totalSubtopicos, 0)
    const concluidos = overview.categorias.reduce((sum, categoria) => sum + categoria.subtopicosConcluidos, 0)

    return {
      progressoGeral: overview.progressoGeral,
      metrics: [
        { label: 'Categorias', value: String(totalCategorias), hint: 'Retornado pelo contrato mockado' },
        { label: 'Tópicos', value: String(totalTopicos), hint: 'Retornado pelo contrato mockado' },
        { label: 'Concluídos', value: `${concluidos}/${totalSubtopicos}`, hint: 'Resumo vindo da API simulada' },
      ],
      weekly: [
        { label: 'Seg', concluidos: 1 },
        { label: 'Ter', concluidos: 2 },
        { label: 'Qua', concluidos: 1 },
        { label: 'Qui', concluidos: 3 },
        { label: 'Sex', concluidos: 2 },
        { label: 'Sáb', concluidos: 0 },
        { label: 'Dom', concluidos: 1 },
      ],
    }
  },
}

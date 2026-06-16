import { httpClient } from './httpClient'
import type {
  AuthCredentials,
  Categoria,
  CreateCategoriaInput,
  CreateSubtopicoInput,
  CreateTopicoInput,
  DashboardSummary,
  EstudosOverview,
  Subtopico,
  Topico,
  ReorderInput,
  UpdateCategoriaInput,
  UpdateSubtopicoInput,
  UpdateTopicoInput,
  UserSession,
} from './types'

type BackendUser = {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

type BackendProgresso = {
  total_subtopicos: number
  subtopicos_concluidos: number
  progresso: number | string
}

type BackendCategoria = {
  id: number
  nome: string
  descricao: string
  total_subtopicos: number
  subtopicos_concluidos: number
  progresso_cache: number | string
}

type BackendTopico = {
  id: number
  nome: string
  categoria: number
  ordem: number
  total_subtopicos: number
  subtopicos_concluidos: number
  progresso_cache: number | string
}

type BackendSubtopico = {
  id: number
  nome: string
  topico: number
  subtopico_pai: number | null
  concluido: boolean
  ordem: number
  observacoes?: string
  subtopicos?: BackendSubtopico[]
}

type BackendDashboardResumo = {
  progresso_geral: BackendProgresso
  total_categorias: number
  total_topicos: number
  total_subtopicos: number
  subtopicos_concluidos: number
}

type BackendGraficoSemanal = {
  labels: string[]
  valores: number[]
}

const asPercent = (value: number | string) => Math.round(Number(value))

const mapUser = (user: BackendUser): UserSession => ({
  id: user.id,
  nome: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username,
  username: user.username,
  email: user.email,
})

const mapSubtopico = (subtopico: BackendSubtopico): Subtopico => ({
  id: subtopico.id,
  nome: subtopico.nome,
  concluido: subtopico.concluido,
  ordem: subtopico.ordem,
  observacoes: subtopico.observacoes,
  subtopicoPaiId: subtopico.subtopico_pai,
  subtopicos: subtopico.subtopicos?.map(mapSubtopico) ?? [],
})

async function getOverview(): Promise<EstudosOverview> {
  const [{ data: categorias }, { data: topicos }, { data: subtopicos }, { data: progresso }] = await Promise.all([
    httpClient.get<BackendCategoria[]>('/estudos/categorias/'),
    httpClient.get<BackendTopico[]>('/estudos/topicos/'),
    httpClient.get<BackendSubtopico[]>('/estudos/subtopicos/'),
    httpClient.get<BackendProgresso>('/estudos/progresso/'),
  ])

  const subtopicosPorTopico = subtopicos.reduce<Record<number, Subtopico[]>>((acc, subtopico) => {
    if (subtopico.subtopico_pai !== null) {
      return acc
    }
    acc[subtopico.topico] = [...(acc[subtopico.topico] ?? []), mapSubtopico(subtopico)]
    return acc
  }, {})

  const topicosPorCategoria = topicos.reduce<Record<number, Topico[]>>((acc, topico) => {
    const item: Topico = {
      id: topico.id,
      categoriaId: topico.categoria,
      nome: topico.nome,
      ordem: topico.ordem,
      totalSubtopicos: topico.total_subtopicos,
      subtopicosConcluidos: topico.subtopicos_concluidos,
      progresso: asPercent(topico.progresso_cache),
      subtopicos: subtopicosPorTopico[topico.id] ?? [],
    }
    acc[topico.categoria] = [...(acc[topico.categoria] ?? []), item]
    return acc
  }, {})

  return {
    progressoGeral: asPercent(progresso.progresso),
    categorias: categorias.map<Categoria>((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      totalSubtopicos: categoria.total_subtopicos,
      subtopicosConcluidos: categoria.subtopicos_concluidos,
      progresso: asPercent(categoria.progresso_cache),
      topicos: topicosPorCategoria[categoria.id] ?? [],
    })),
  }
}

export const liveApi = {
  async login(credentials: AuthCredentials) {
    const { data } = await httpClient.post<BackendUser>('/accounts/login/', credentials)
    return { user: mapUser(data) }
  },

  async logout() {
    await httpClient.post('/accounts/logout/')
  },

  async session() {
    const { data } = await httpClient.get<BackendUser>('/accounts/me/')
    return mapUser(data)
  },

  async estudosOverview() {
    return getOverview()
  },

  async createCategoria(input: CreateCategoriaInput) {
    await httpClient.post('/estudos/categorias/', input)
    return getOverview()
  },

  async updateCategoria(input: UpdateCategoriaInput) {
    await httpClient.patch(`/estudos/categorias/${input.id}/`, {
      nome: input.nome,
      descricao: input.descricao,
    })
    return this.estudosOverview()
  },

  async deleteCategoria(categoriaId: number) {
    await httpClient.delete(`/estudos/categorias/${categoriaId}/`)
    return this.estudosOverview()
  },

  async createTopico(input: CreateTopicoInput) {
    await httpClient.post('/estudos/topicos/', {
      nome: input.nome,
      categoria: input.categoriaId,
    })
    return getOverview()
  },

  async updateTopico(input: UpdateTopicoInput) {
    await httpClient.patch(`/estudos/topicos/${input.id}/`, {
      nome: input.nome,
    })
    return this.estudosOverview()
  },

  async deleteTopico(topicoId: number) {
    await httpClient.delete(`/estudos/topicos/${topicoId}/`)
    return this.estudosOverview()
  },

  async createSubtopico(input: CreateSubtopicoInput) {
    await httpClient.post('/estudos/subtopicos/', {
      nome: input.nome,
      topico: input.topicoId,
      observacoes: input.observacoes,
      subtopico_pai: input.subtopicoPaiId,
    })
    return this.estudosOverview()
  },

  async updateSubtopico(input: UpdateSubtopicoInput) {
    await httpClient.patch(`/estudos/subtopicos/${input.id}/`, {
      nome: input.nome,
      observacoes: input.observacoes,
    })
    return this.estudosOverview()
  },

  async deleteSubtopico(subtopicoId: number) {
    await httpClient.delete(`/estudos/subtopicos/${subtopicoId}/`)
    return this.estudosOverview()
  },

  async toggleSubtopico(subtopicoId: number, concluido: boolean) {
    const { data } = await httpClient.post<BackendSubtopico>(`/estudos/subtopicos/${subtopicoId}/toggle-conclusao/`, { concluido })
    return mapSubtopico(data)
  },

  async reorderTopicos(input: ReorderInput) {
    await httpClient.post(`/estudos/categorias/${input.parentId}/ordenar-topicos/`, { ids: input.itemIds })
    return getOverview()
  },

  async reorderSubtopicos(input: ReorderInput) {
    await httpClient.post(`/estudos/topicos/${input.parentId}/ordenar-subtopicos/`, { ids: input.itemIds })
    return getOverview()
  },

  async dashboardSummary() {
    const [{ data: resumo }, { data: semanal }] = await Promise.all([
      httpClient.get<BackendDashboardResumo>('/dashboard/resumo/'),
      httpClient.get<BackendGraficoSemanal>('/dashboard/semanal/'),
    ])

    return {
      progressoGeral: asPercent(resumo.progresso_geral.progresso),
      metrics: [
        { label: 'Categorias', value: String(resumo.total_categorias), hint: 'Retornado pela API Django' },
        { label: 'Topicos', value: String(resumo.total_topicos), hint: 'Retornado pela API Django' },
        { label: 'Subtopicos', value: String(resumo.total_subtopicos), hint: 'Retornado pela API Django' },
        { label: 'Concluidos', value: String(resumo.subtopicos_concluidos), hint: 'Retornado pela API Django' },
      ],
      weekly: semanal.labels.map((label, index) => ({
        label,
        concluidos: semanal.valores[index] ?? 0,
      })),
    } satisfies DashboardSummary
  },
}

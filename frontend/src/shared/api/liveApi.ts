import { httpClient } from './httpClient'
import type {
  AuthCredentials,
  AuthResponse,
  CreateCategoriaInput,
  CreateSubtopicoInput,
  CreateTopicoInput,
  DashboardSummary,
  EstudosOverview,
  ReorderInput,
  Subtopico,
  UserSession,
} from './types'

export const liveApi = {
  async login(credentials: AuthCredentials) {
    const { data } = await httpClient.post<AuthResponse>('/auth/login/', credentials)
    return data
  },

  async logout() {
    await httpClient.post('/auth/logout/')
  },

  async session() {
    const { data } = await httpClient.get<UserSession>('/auth/session/')
    return data
  },

  async estudosOverview() {
    const { data } = await httpClient.get<EstudosOverview>('/estudos/overview/')
    return data
  },

  async createCategoria(input: CreateCategoriaInput) {
    const { data } = await httpClient.post<EstudosOverview>('/estudos/categorias/', input)
    return data
  },

  async createTopico(input: CreateTopicoInput) {
    const { data } = await httpClient.post<EstudosOverview>(
      `/estudos/categorias/${input.categoriaId}/topicos/`,
      { nome: input.nome },
    )
    return data
  },

  async createSubtopico(input: CreateSubtopicoInput) {
    const { data } = await httpClient.post<EstudosOverview>(
      `/estudos/topicos/${input.topicoId}/subtopicos/`,
      { nome: input.nome, observacoes: input.observacoes },
    )
    return data
  },

  async toggleSubtopico(subtopicoId: number, concluido: boolean) {
    const { data } = await httpClient.patch<Subtopico>(
      `/estudos/subtopicos/${subtopicoId}/conclusao/`,
      { concluido },
    )
    return data
  },

  async reorderTopicos(input: ReorderInput) {
    const { data } = await httpClient.post<EstudosOverview>(
      `/estudos/categorias/${input.parentId}/topicos/reordenar/`,
      { ids: input.itemIds },
    )
    return data
  },

  async reorderSubtopicos(input: ReorderInput) {
    const { data } = await httpClient.post<EstudosOverview>(
      `/estudos/topicos/${input.parentId}/subtopicos/reordenar/`,
      { ids: input.itemIds },
    )
    return data
  },

  async dashboardSummary() {
    const { data } = await httpClient.get<DashboardSummary>('/dashboard/resumo/')
    return data
  },
}

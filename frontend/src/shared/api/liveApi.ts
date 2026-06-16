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
  UpdateCategoriaInput,
  UpdateSubtopicoInput,
  UpdateTopicoInput,
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
    const { data } = await httpClient.post<EstudosOverview>(
      `/estudos/categorias/${input.categoriaId}/topicos/`,
      { nome: input.nome },
    )
    return data
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

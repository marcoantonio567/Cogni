export type UserSession = {
  id: number
  nome?: string
  username?: string
  email: string
}

export type AuthCredentials = {
  username: string
  password: string
}

export type DashboardMetric = {
  label: string
  value: string
  hint: string
}

export type WeeklyProgressPoint = {
  label: string
  concluidos: number
}

export type DashboardSummary = {
  progressoGeral: number
  metrics: DashboardMetric[]
  weekly: WeeklyProgressPoint[]
}

export type Subtopico = {
  id: number
  nome: string
  concluido: boolean
  ordem: number
  observacoes?: string
  subtopicoPaiId?: number | null
  subtopicos?: Subtopico[]
}

export type Topico = {
  id: number
  categoriaId: number
  nome: string
  ordem: number
  totalSubtopicos: number
  subtopicosConcluidos: number
  progresso: number
  subtopicos: Subtopico[]
}

export type Categoria = {
  id: number
  nome: string
  descricao: string
  totalSubtopicos: number
  subtopicosConcluidos: number
  progresso: number
  topicos: Topico[]
}

export type EstudosOverview = {
  progressoGeral: number
  categorias: Categoria[]
}

export type CreateCategoriaInput = {
  nome: string
  descricao: string
}

export type UpdateCategoriaInput = {
  id: number
  nome: string
  descricao: string
}

export type CreateTopicoInput = {
  categoriaId: number
  nome: string
}

export type UpdateTopicoInput = {
  id: number
  nome: string
}

export type CreateSubtopicoInput = {
  topicoId: number
  nome: string
  subtopicoPaiId?: number
  observacoes?: string
}

export type UpdateSubtopicoInput = {
  id: number
  nome: string
  observacoes?: string
}

export type ReorderInput = {
  parentId: number
  itemIds: number[]
}

export type ApiErrorPayload = {
  message: string
  fieldErrors?: Record<string, string>
}

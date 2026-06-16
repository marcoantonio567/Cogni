import { isMockApi } from './config'
import { liveApi } from './liveApi'
import { mockApi } from './mockApi'

export const api = isMockApi ? mockApi : liveApi

export type {
  AuthCredentials,
  Categoria,
  DashboardSummary,
  EstudosOverview,
  Subtopico,
  Topico,
  UserSession,
} from './types'

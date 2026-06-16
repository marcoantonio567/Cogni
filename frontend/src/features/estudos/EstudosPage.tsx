import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, type Categoria, type EstudosOverview, type Subtopico, type Topico } from '../../shared/api'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageHeader } from '../../shared/components/PageHeader'
import { ProgressBar } from '../../shared/components/ProgressBar'
import { StatusMessage } from '../../shared/components/StatusMessage'
import { SubmitButton } from '../../shared/components/SubmitButton'
import { useSortableIds } from './useSortableIds'

type FieldMap = Record<number, string>
type ToggleMap = Record<number, boolean>

export function EstudosPage() {
  const [overview, setOverview] = useState<EstudosOverview | null>(null)
  const [activeCategoriaId, setActiveCategoriaId] = useState<number | null>(null)
  const [categoriaNome, setCategoriaNome] = useState('')
  const [categoriaDescricao, setCategoriaDescricao] = useState('')
  const [showCreateCategoriaForm, setShowCreateCategoriaForm] = useState(false)
  const [categoriaEditId, setCategoriaEditId] = useState<number | null>(null)
  const [categoriaEditNome, setCategoriaEditNome] = useState('')
  const [categoriaEditDescricao, setCategoriaEditDescricao] = useState('')
  const [topicoNames, setTopicoNames] = useState<FieldMap>({})
  const [subtopicoNames, setSubtopicoNames] = useState<FieldMap>({})
  const [topicoEditId, setTopicoEditId] = useState<number | null>(null)
  const [subtopicoEditId, setSubtopicoEditId] = useState<number | null>(null)
  const [topicoEditNames, setTopicoEditNames] = useState<FieldMap>({})
  const [subtopicoEditNames, setSubtopicoEditNames] = useState<FieldMap>({})
  const [showCreateTopicoForm, setShowCreateTopicoForm] = useState(false)
  const [showCreateSubtopicoForms, setShowCreateSubtopicoForms] = useState<ToggleMap>({})
  const [pendingAction, setPendingAction] = useState('')
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    const data = await api.estudosOverview()
    setOverview(data)
  }, [])

  useEffect(() => {
    let active = true

    api
      .estudosOverview()
      .then((data) => {
        if (active) {
          setOverview(data)
        }
      })
      .catch(() => {
        if (active) {
          setError('Nao foi possivel carregar os estudos pela API configurada.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  const selectedCategoria = useMemo(
    () => overview?.categorias.find((categoria) => categoria.id === activeCategoriaId) ?? null,
    [activeCategoriaId, overview],
  )

  const totals = useMemo(() => {
    const categorias = overview?.categorias ?? []
    const totalTopicos = categorias.reduce((sum, categoria) => sum + categoria.topicos.length, 0)
    const totalSubtopicos = categorias.reduce((sum, categoria) => sum + categoria.totalSubtopicos, 0)
    const concluidos = categorias.reduce((sum, categoria) => sum + categoria.subtopicosConcluidos, 0)

    return { totalCategorias: categorias.length, totalTopicos, totalSubtopicos, concluidos }
  }, [overview])

  const replaceOverview = (nextOverview: EstudosOverview) => {
    setOverview(nextOverview)
    setActiveCategoriaId((current) => {
      if (!current || nextOverview.categorias.some((categoria) => categoria.id === current)) {
        return current
      }

      return null
    })
  }

  const runAction = async (label: string, action: () => Promise<EstudosOverview | void>) => {
    setPendingAction(label)
    setError('')

    try {
      const result = await action()

      if (result) {
        replaceOverview(result)
      } else {
        await loadOverview()
      }
    } catch {
      setError('A API nao confirmou a operacao. Recarreguei os dados visuais quando possivel.')
      await loadOverview().catch(() => undefined)
    } finally {
      setPendingAction('')
    }
  }

  const createCategoria = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    void runAction('categoria', async () => {
      const result = await api.createCategoria({ nome: categoriaNome, descricao: categoriaDescricao })
      setCategoriaNome('')
      setCategoriaDescricao('')
      setShowCreateCategoriaForm(false)
      return result
    })
  }

  const updateCategoria = (event: FormEvent<HTMLFormElement>, categoriaId: number) => {
    event.preventDefault()
    const categoriaAtual = overview?.categorias.find((categoria) => categoria.id === categoriaId)
    const nome = categoriaEditId === categoriaId ? categoriaEditNome : categoriaAtual?.nome ?? ''
    const descricao = categoriaEditId === categoriaId ? categoriaEditDescricao : categoriaAtual?.descricao ?? ''

    void runAction(`categoria-edit-${categoriaId}`, async () =>
      api.updateCategoria({
        id: categoriaId,
        nome,
        descricao,
      }),
    )
  }

  const deleteCategoria = (categoriaId: number) => {
    const categoria = overview?.categorias.find((item) => item.id === categoriaId)

    if (!categoria || !window.confirm(`Excluir a categoria "${categoria.nome}" e todos os seus topicos?`)) {
      return
    }

    void runAction(`categoria-delete-${categoriaId}`, async () => api.deleteCategoria(categoriaId))
  }

  const editCategoria = (categoria: Categoria) => {
    setCategoriaEditId(categoria.id)
    setCategoriaEditNome(categoria.nome)
    setCategoriaEditDescricao(categoria.descricao)
  }

  const openCategoria = (categoria: Categoria) => {
    editCategoria(categoria)
    setActiveCategoriaId(categoria.id)
  }

  const createTopico = (event: FormEvent<HTMLFormElement>, categoriaId: number) => {
    event.preventDefault()
    const nome = topicoNames[categoriaId]?.trim()

    if (!nome) {
      return
    }

    void runAction(`topico-${categoriaId}`, async () => {
      const result = await api.createTopico({ categoriaId, nome })
      setTopicoNames((current) => ({ ...current, [categoriaId]: '' }))
      setShowCreateTopicoForm(false)
      return result
    })
  }

  const editTopico = (topico: Topico) => {
    setTopicoEditId(topico.id)
    setTopicoEditNames((current) => ({ ...current, [topico.id]: topico.nome }))
  }

  const updateTopico = (event: FormEvent<HTMLFormElement>, topicoId: number) => {
    event.preventDefault()
    const nome = topicoEditNames[topicoId]?.trim()

    if (!nome) {
      return
    }

    void runAction(`topico-edit-${topicoId}`, async () => {
      const result = await api.updateTopico({ id: topicoId, nome })
      setTopicoEditId(null)
      return result
    })
  }

  const deleteTopico = (topico: Topico) => {
    if (!window.confirm(`Excluir o topico "${topico.nome}" e todos os seus subtopicos?`)) {
      return
    }

    void runAction(`topico-delete-${topico.id}`, async () => api.deleteTopico(topico.id))
  }

  const createSubtopico = (event: FormEvent<HTMLFormElement>, topicoId: number) => {
    event.preventDefault()
    const nome = subtopicoNames[topicoId]?.trim()

    if (!nome) {
      return
    }

    void runAction(`subtopico-${topicoId}`, async () => {
      const result = await api.createSubtopico({ topicoId, nome })
      setSubtopicoNames((current) => ({ ...current, [topicoId]: '' }))
      setShowCreateSubtopicoForms((current) => ({ ...current, [topicoId]: false }))
      return result
    })
  }

  const editSubtopico = (subtopico: Subtopico) => {
    setSubtopicoEditId(subtopico.id)
    setSubtopicoEditNames((current) => ({ ...current, [subtopico.id]: subtopico.nome }))
  }

  const updateSubtopico = (event: FormEvent<HTMLFormElement>, subtopicoId: number) => {
    event.preventDefault()
    const nome = subtopicoEditNames[subtopicoId]?.trim()

    if (!nome) {
      return
    }

    void runAction(`subtopico-edit-${subtopicoId}`, async () => {
      const result = await api.updateSubtopico({ id: subtopicoId, nome })
      setSubtopicoEditId(null)
      return result
    })
  }

  const deleteSubtopico = (subtopico: Subtopico) => {
    if (!window.confirm(`Excluir o subtopico "${subtopico.nome}"?`)) {
      return
    }

    void runAction(`subtopico-delete-${subtopico.id}`, async () => api.deleteSubtopico(subtopico.id))
  }

  const toggleSubtopico = (subtopicoId: number, concluido: boolean) => {
    void runAction(`toggle-${subtopicoId}`, async () => {
      await api.toggleSubtopico(subtopicoId, concluido)
    })
  }

  const reorderTopicos = (categoriaId: number, ids: number[]) => {
    void runAction(`reorder-topicos-${categoriaId}`, () => api.reorderTopicos({ parentId: categoriaId, itemIds: ids }))
  }

  const reorderSubtopicos = (topicoId: number, ids: number[]) => {
    void runAction(`reorder-subtopicos-${topicoId}`, () => api.reorderSubtopicos({ parentId: topicoId, itemIds: ids }))
  }

  if (!overview) {
    return (
      <main className="workspace">
        <PageHeader
          description="Buscando categorias, topicos, subtopicos e progresso pela API configurada."
          eyebrow="Estudos"
          title="Carregando area de estudos"
        />
      </main>
    )
  }

  if (!selectedCategoria) {
    return (
      <main className="workspace">
        <PageHeader
          actions={
            <button className="button button--primary" onClick={() => setShowCreateCategoriaForm((current) => !current)} type="button">
              {showCreateCategoriaForm ? 'Fechar formulario' : 'Nova categoria'}
            </button>
          }
          description="Navegue pelas categorias em cards. Abra uma categoria para ver os topicos e subtopicos."
          eyebrow="Estudos"
          title="Categorias"
        />

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <OverviewBand overview={overview} totals={totals} />

        <section className="category-manager" aria-label="Categorias">
          {showCreateCategoriaForm ? (
            <form className="stack-form category-create-panel" onSubmit={createCategoria}>
              <div className="panel-heading panel-heading--split">
                <div>
                  <span>Nova categoria</span>
                  <h2>Criar categoria</h2>
                </div>
                <strong>{totals.totalCategorias}</strong>
              </div>
              <label>
                Nome da categoria
                <input onChange={(event) => setCategoriaNome(event.target.value)} placeholder="Ex.: Django REST" required value={categoriaNome} />
              </label>
              <label>
                Descricao
                <input
                  onChange={(event) => setCategoriaDescricao(event.target.value)}
                  placeholder="Ex.: API, auth e permissoes"
                  required
                  value={categoriaDescricao}
                />
              </label>
              <SubmitButton pending={pendingAction === 'categoria'}>Criar categoria</SubmitButton>
            </form>
          ) : null}

          {overview.categorias.length === 0 ? (
            <EmptyState description="Crie uma categoria para iniciar o fluxo de estudos." title="Sem categorias" />
          ) : (
            <div className="category-card-grid">
              {overview.categorias.map((categoria) => (
                <CategoriaCard
                  categoria={categoria}
                  editDescricao={categoriaEditId === categoria.id ? categoriaEditDescricao : categoria.descricao}
                  editNome={categoriaEditId === categoria.id ? categoriaEditNome : categoria.nome}
                  key={categoria.id}
                  onDeleteCategoria={deleteCategoria}
                  onEditDescricaoChange={(value) => {
                    setCategoriaEditId(categoria.id)
                    setCategoriaEditNome(categoriaEditId === categoria.id ? categoriaEditNome : categoria.nome)
                    setCategoriaEditDescricao(value)
                  }}
                  onEditNomeChange={(value) => {
                    setCategoriaEditId(categoria.id)
                    setCategoriaEditNome(value)
                    setCategoriaEditDescricao(categoriaEditId === categoria.id ? categoriaEditDescricao : categoria.descricao)
                  }}
                  onOpenCategoria={openCategoria}
                  onUpdateCategoria={updateCategoria}
                  pendingAction={pendingAction}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="workspace">
      <PageHeader
        actions={
          <button className="button button--ghost" onClick={() => setActiveCategoriaId(null)} type="button">
            Voltar para categorias
          </button>
        }
        description="Acompanhe o progresso e marque subtopicos da categoria selecionada."
        eyebrow="Estudos"
        title={selectedCategoria.nome}
      />

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <OverviewBand overview={overview} totals={totals} />

      <section className="topics-panel">
        <CategoriaDetail
          categoria={selectedCategoria}
          onCreateSubtopico={createSubtopico}
          onCreateTopico={createTopico}
          onDeleteSubtopico={deleteSubtopico}
          onDeleteTopico={deleteTopico}
          onEditSubtopico={editSubtopico}
          onEditTopico={editTopico}
          onReorderSubtopicos={reorderSubtopicos}
          onReorderTopicos={reorderTopicos}
          onShowCreateSubtopicoFormChange={(topicoId, value) =>
            setShowCreateSubtopicoForms((current) => ({ ...current, [topicoId]: value }))
          }
          onShowCreateTopicoFormChange={setShowCreateTopicoForm}
          onSubtopicoEditNameChange={(subtopicoId, value) => setSubtopicoEditNames((current) => ({ ...current, [subtopicoId]: value }))}
          onSubtopicoNameChange={(topicoId, value) => setSubtopicoNames((current) => ({ ...current, [topicoId]: value }))}
          onToggleSubtopico={toggleSubtopico}
          onTopicoEditNameChange={(topicoId, value) => setTopicoEditNames((current) => ({ ...current, [topicoId]: value }))}
          onTopicoNameChange={(categoriaId, value) => setTopicoNames((current) => ({ ...current, [categoriaId]: value }))}
          onUpdateSubtopico={updateSubtopico}
          onUpdateTopico={updateTopico}
          pendingAction={pendingAction}
          subtopicoEditId={subtopicoEditId}
          subtopicoEditNames={subtopicoEditNames}
          showCreateSubtopicoForms={showCreateSubtopicoForms}
          showCreateTopicoForm={showCreateTopicoForm}
          topicoEditId={topicoEditId}
          topicoEditNames={topicoEditNames}
          subtopicoNames={subtopicoNames}
          topicoNames={topicoNames}
        />
      </section>
    </main>
  )
}

type Totals = {
  totalCategorias: number
  totalTopicos: number
  totalSubtopicos: number
  concluidos: number
}

function OverviewBand({ overview, totals }: { overview: EstudosOverview; totals: Totals }) {
  return (
    <section className="overview-band" aria-label="Progresso geral">
      <div>
        <span>Progresso geral</span>
        <strong>{overview.progressoGeral}%</strong>
      </div>
      <ProgressBar label="Progresso geral dos estudos" value={overview.progressoGeral} />
      <div className="quick-stats" aria-label="Resumo dos estudos">
        <span>{totals.totalCategorias} categorias</span>
        <span>{totals.totalTopicos} topicos</span>
        <span>
          {totals.concluidos}/{totals.totalSubtopicos} concluidos
        </span>
      </div>
    </section>
  )
}

type CategoriaCardProps = {
  categoria: Categoria
  editNome: string
  editDescricao: string
  pendingAction: string
  onOpenCategoria: (categoria: Categoria) => void
  onUpdateCategoria: (event: FormEvent<HTMLFormElement>, categoriaId: number) => void
  onDeleteCategoria: (categoriaId: number) => void
  onEditNomeChange: (value: string) => void
  onEditDescricaoChange: (value: string) => void
}

function CategoriaCard({
  categoria,
  editDescricao,
  editNome,
  onDeleteCategoria,
  onEditDescricaoChange,
  onEditNomeChange,
  onOpenCategoria,
  onUpdateCategoria,
  pendingAction,
}: CategoriaCardProps) {
  const initial = categoria.nome.trim().charAt(0).toUpperCase() || '#'

  return (
    <article className="category-card">
      <button className="category-card__open" onClick={() => onOpenCategoria(categoria)} type="button">
        <span className="category-card__mark" aria-hidden="true">
          {initial}
        </span>
        <span>
          <strong>{categoria.nome}</strong>
          <small>{categoria.descricao}</small>
        </span>
        <b>{categoria.progresso}%</b>
      </button>

      <ProgressBar label={`Progresso da categoria ${categoria.nome}`} value={categoria.progresso} />

      <div className="category-card__stats">
        <span>{categoria.topicos.length} topicos</span>
        <span>
          {categoria.subtopicosConcluidos}/{categoria.totalSubtopicos} subtopicos
        </span>
        <span>Abrir estudos</span>
      </div>

      <form className="category-card__edit" onSubmit={(event) => onUpdateCategoria(event, categoria.id)}>
        <label>
          Nome
          <input onChange={(event) => onEditNomeChange(event.target.value)} required value={editNome} />
        </label>
        <label>
          Descricao
          <input onChange={(event) => onEditDescricaoChange(event.target.value)} required value={editDescricao} />
        </label>
        <div className="category-actions">
          <SubmitButton pending={pendingAction === `categoria-edit-${categoria.id}`}>Salvar</SubmitButton>
          <button
            className="button button--danger"
            disabled={pendingAction === `categoria-delete-${categoria.id}`}
            onClick={() => onDeleteCategoria(categoria.id)}
            type="button"
          >
            {pendingAction === `categoria-delete-${categoria.id}` ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </form>
    </article>
  )
}

type CategoriaDetailProps = {
  categoria: Categoria
  topicoNames: FieldMap
  subtopicoNames: FieldMap
  topicoEditId: number | null
  subtopicoEditId: number | null
  topicoEditNames: FieldMap
  subtopicoEditNames: FieldMap
  showCreateTopicoForm: boolean
  showCreateSubtopicoForms: ToggleMap
  pendingAction: string
  onCreateTopico: (event: FormEvent<HTMLFormElement>, categoriaId: number) => void
  onCreateSubtopico: (event: FormEvent<HTMLFormElement>, topicoId: number) => void
  onUpdateTopico: (event: FormEvent<HTMLFormElement>, topicoId: number) => void
  onUpdateSubtopico: (event: FormEvent<HTMLFormElement>, subtopicoId: number) => void
  onEditTopico: (topico: Topico) => void
  onEditSubtopico: (subtopico: Subtopico) => void
  onDeleteTopico: (topico: Topico) => void
  onDeleteSubtopico: (subtopico: Subtopico) => void
  onShowCreateTopicoFormChange: (value: boolean) => void
  onShowCreateSubtopicoFormChange: (topicoId: number, value: boolean) => void
  onTopicoNameChange: (categoriaId: number, value: string) => void
  onSubtopicoNameChange: (topicoId: number, value: string) => void
  onTopicoEditNameChange: (topicoId: number, value: string) => void
  onSubtopicoEditNameChange: (subtopicoId: number, value: string) => void
  onToggleSubtopico: (subtopicoId: number, concluido: boolean) => void
  onReorderTopicos: (categoriaId: number, ids: number[]) => void
  onReorderSubtopicos: (topicoId: number, ids: number[]) => void
}

function CategoriaDetail({
  categoria,
  onCreateSubtopico,
  onCreateTopico,
  onDeleteSubtopico,
  onDeleteTopico,
  onEditSubtopico,
  onEditTopico,
  onReorderSubtopicos,
  onReorderTopicos,
  onShowCreateSubtopicoFormChange,
  onShowCreateTopicoFormChange,
  onSubtopicoEditNameChange,
  onSubtopicoNameChange,
  onToggleSubtopico,
  onTopicoEditNameChange,
  onTopicoNameChange,
  onUpdateSubtopico,
  onUpdateTopico,
  pendingAction,
  subtopicoEditId,
  subtopicoEditNames,
  showCreateSubtopicoForms,
  showCreateTopicoForm,
  topicoEditId,
  topicoEditNames,
  subtopicoNames,
  topicoNames,
}: CategoriaDetailProps) {
  const topicosRef = useSortableIds<HTMLDivElement>({
    onReorder: (ids) => onReorderTopicos(categoria.id, ids),
  })

  return (
    <>
      <div className="category-summary">
        <div>
          <div>
            <span>Categoria selecionada</span>
            <h2>{categoria.nome}</h2>
            <p>{categoria.descricao}</p>
          </div>
          <strong>{categoria.progresso}% concluido</strong>
        </div>
        <ProgressBar label={`Progresso da categoria ${categoria.nome}`} value={categoria.progresso} />
      </div>

      <div className="creation-block">
        <button className="button button--primary" onClick={() => onShowCreateTopicoFormChange(!showCreateTopicoForm)} type="button">
          {showCreateTopicoForm ? 'Cancelar novo topico' : 'Adicionar topico'}
        </button>

        {showCreateTopicoForm ? (
          <form className="inline-form inline-form--row add-row" onSubmit={(event) => onCreateTopico(event, categoria.id)}>
            <label>
              Nome do topico
              <input
                autoFocus
                onChange={(event) => onTopicoNameChange(categoria.id, event.target.value)}
                placeholder="Ex.: Serializers"
                value={topicoNames[categoria.id] ?? ''}
              />
            </label>
            <SubmitButton pending={pendingAction === `topico-${categoria.id}`}>Criar topico</SubmitButton>
          </form>
        ) : null}
      </div>

      {categoria.topicos.length === 0 ? (
        <EmptyState description="Adicione topicos para organizar os subtopicos desta categoria." title="Categoria vazia" />
      ) : (
        <div className="topic-list" ref={topicosRef}>
          {categoria.topicos.map((topico) => (
            <TopicoCard
              key={topico.id}
              onCreateSubtopico={onCreateSubtopico}
              onDeleteSubtopico={onDeleteSubtopico}
              onDeleteTopico={onDeleteTopico}
              onEditSubtopico={onEditSubtopico}
              onEditTopico={onEditTopico}
              onReorderSubtopicos={onReorderSubtopicos}
              onShowCreateSubtopicoFormChange={onShowCreateSubtopicoFormChange}
              onSubtopicoEditNameChange={onSubtopicoEditNameChange}
              onSubtopicoNameChange={onSubtopicoNameChange}
              onToggleSubtopico={onToggleSubtopico}
              onTopicoEditNameChange={onTopicoEditNameChange}
              onUpdateSubtopico={onUpdateSubtopico}
              onUpdateTopico={onUpdateTopico}
              pendingAction={pendingAction}
              subtopicoEditId={subtopicoEditId}
              subtopicoEditNames={subtopicoEditNames}
              showCreateSubtopicoForm={showCreateSubtopicoForms[topico.id] ?? false}
              subtopicoName={subtopicoNames[topico.id] ?? ''}
              topicoEditName={topicoEditNames[topico.id] ?? topico.nome}
              topicoIsEditing={topicoEditId === topico.id}
              topico={topico}
            />
          ))}
        </div>
      )}
    </>
  )
}

type TopicoCardProps = {
  topico: Topico
  subtopicoName: string
  topicoEditName: string
  topicoIsEditing: boolean
  subtopicoEditId: number | null
  subtopicoEditNames: FieldMap
  showCreateSubtopicoForm: boolean
  pendingAction: string
  onCreateSubtopico: (event: FormEvent<HTMLFormElement>, topicoId: number) => void
  onUpdateTopico: (event: FormEvent<HTMLFormElement>, topicoId: number) => void
  onUpdateSubtopico: (event: FormEvent<HTMLFormElement>, subtopicoId: number) => void
  onEditTopico: (topico: Topico) => void
  onEditSubtopico: (subtopico: Subtopico) => void
  onDeleteTopico: (topico: Topico) => void
  onDeleteSubtopico: (subtopico: Subtopico) => void
  onShowCreateSubtopicoFormChange: (topicoId: number, value: boolean) => void
  onSubtopicoNameChange: (topicoId: number, value: string) => void
  onTopicoEditNameChange: (topicoId: number, value: string) => void
  onSubtopicoEditNameChange: (subtopicoId: number, value: string) => void
  onToggleSubtopico: (subtopicoId: number, concluido: boolean) => void
  onReorderSubtopicos: (topicoId: number, ids: number[]) => void
}

function TopicoCard({
  onCreateSubtopico,
  onDeleteSubtopico,
  onDeleteTopico,
  onEditSubtopico,
  onEditTopico,
  onReorderSubtopicos,
  onShowCreateSubtopicoFormChange,
  onSubtopicoEditNameChange,
  onSubtopicoNameChange,
  onToggleSubtopico,
  onTopicoEditNameChange,
  onUpdateSubtopico,
  onUpdateTopico,
  pendingAction,
  subtopicoEditId,
  subtopicoEditNames,
  showCreateSubtopicoForm,
  subtopicoName,
  topicoEditName,
  topicoIsEditing,
  topico,
}: TopicoCardProps) {
  const subtopicosRef = useSortableIds<HTMLDivElement>({
    onReorder: (ids) => onReorderSubtopicos(topico.id, ids),
  })

  return (
    <article className="topic-card" data-item-id={topico.id}>
      <header className="topic-card__header">
        <button aria-label={`Reordenar topico ${topico.nome}`} className="drag-handle" type="button">
          ::
        </button>
        <div>
          {topicoIsEditing ? (
            <form className="rename-form" onSubmit={(event) => onUpdateTopico(event, topico.id)}>
              <input
                aria-label={`Novo nome do topico ${topico.nome}`}
                autoFocus
                onChange={(event) => onTopicoEditNameChange(topico.id, event.target.value)}
                value={topicoEditName}
              />
              <SubmitButton pending={pendingAction === `topico-edit-${topico.id}`}>Salvar</SubmitButton>
            </form>
          ) : (
            <h2>{topico.nome}</h2>
          )}
          <span>
            {topico.subtopicosConcluidos}/{topico.totalSubtopicos} subtopicos concluidos
          </span>
        </div>
        <div className="item-actions">
          <strong>{topico.progresso}%</strong>
          <button aria-label={`Editar topico ${topico.nome}`} className="icon-button" onClick={() => onEditTopico(topico)} title="Editar topico" type="button">
            &#9998;
          </button>
          <button
            aria-label={`Excluir topico ${topico.nome}`}
            className="icon-button icon-button--danger"
            disabled={pendingAction === `topico-delete-${topico.id}`}
            onClick={() => onDeleteTopico(topico)}
            title="Excluir topico"
            type="button"
          >
            &times;
          </button>
        </div>
      </header>

      <ProgressBar label={`Progresso do topico ${topico.nome}`} value={topico.progresso} />

      {topico.subtopicos.length === 0 ? (
        <EmptyState description="Cadastre o primeiro subtopico para comecar a acompanhar este topico." title="Sem subtopicos" />
      ) : (
        <div className="subtopic-list" ref={subtopicosRef}>
          {topico.subtopicos.map((subtopico) => (
            <div
              className={subtopico.concluido ? 'subtopic-row subtopic-row--done' : 'subtopic-row'}
              data-item-id={subtopico.id}
              key={subtopico.id}
            >
              <button aria-label={`Reordenar subtopico ${subtopico.nome}`} className="drag-handle" type="button">
                ::
              </button>
              <input
                aria-label={`Marcar subtopico ${subtopico.nome}`}
                checked={subtopico.concluido}
                disabled={pendingAction === `toggle-${subtopico.id}`}
                onChange={(event) => onToggleSubtopico(subtopico.id, event.target.checked)}
                type="checkbox"
              />
              {subtopicoEditId === subtopico.id ? (
                <form className="rename-form" onSubmit={(event) => onUpdateSubtopico(event, subtopico.id)}>
                  <input
                    aria-label={`Novo nome do subtopico ${subtopico.nome}`}
                    autoFocus
                    onChange={(event) => onSubtopicoEditNameChange(subtopico.id, event.target.value)}
                    value={subtopicoEditNames[subtopico.id] ?? subtopico.nome}
                  />
                  <SubmitButton pending={pendingAction === `subtopico-edit-${subtopico.id}`}>Salvar</SubmitButton>
                </form>
              ) : (
                <span>{subtopico.nome}</span>
              )}
              <div className="item-actions item-actions--compact">
                <button
                  aria-label={`Editar subtopico ${subtopico.nome}`}
                  className="icon-button"
                  onClick={() => onEditSubtopico(subtopico)}
                  title="Editar subtopico"
                  type="button"
                >
                  &#9998;
                </button>
                <button
                  aria-label={`Excluir subtopico ${subtopico.nome}`}
                  className="icon-button icon-button--danger"
                  disabled={pendingAction === `subtopico-delete-${subtopico.id}`}
                  onClick={() => onDeleteSubtopico(subtopico)}
                  title="Excluir subtopico"
                  type="button"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="creation-block creation-block--nested">
        <button
          className="button button--ghost"
          onClick={() => onShowCreateSubtopicoFormChange(topico.id, !showCreateSubtopicoForm)}
          type="button"
        >
          {showCreateSubtopicoForm ? 'Cancelar novo subtopico' : 'Adicionar subtopico'}
        </button>

        {showCreateSubtopicoForm ? (
          <form className="inline-form inline-form--row add-row" onSubmit={(event) => onCreateSubtopico(event, topico.id)}>
            <label>
              Nome do subtopico
              <input
                autoFocus
                onChange={(event) => onSubtopicoNameChange(topico.id, event.target.value)}
                placeholder="Ex.: Validar payload"
                value={subtopicoName}
              />
            </label>
            <SubmitButton pending={pendingAction === `subtopico-${topico.id}`}>Criar subtopico</SubmitButton>
          </form>
        ) : null}
      </div>
    </article>
  )
}

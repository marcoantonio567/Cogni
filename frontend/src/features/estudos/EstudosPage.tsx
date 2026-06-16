import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { api, type Categoria, type EstudosOverview, type Topico } from '../../shared/api'
import { EmptyState } from '../../shared/components/EmptyState'
import { PageHeader } from '../../shared/components/PageHeader'
import { ProgressBar } from '../../shared/components/ProgressBar'
import { StatusMessage } from '../../shared/components/StatusMessage'
import { SubmitButton } from '../../shared/components/SubmitButton'
import { useSortableIds } from './useSortableIds'

type FieldMap = Record<number, string>

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
      return result
    })
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
      return result
    })
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
          onReorderSubtopicos={reorderSubtopicos}
          onReorderTopicos={reorderTopicos}
          onSubtopicoNameChange={(topicoId, value) => setSubtopicoNames((current) => ({ ...current, [topicoId]: value }))}
          onToggleSubtopico={toggleSubtopico}
          onTopicoNameChange={(categoriaId, value) => setTopicoNames((current) => ({ ...current, [categoriaId]: value }))}
          pendingAction={pendingAction}
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
  pendingAction: string
  onCreateTopico: (event: FormEvent<HTMLFormElement>, categoriaId: number) => void
  onCreateSubtopico: (event: FormEvent<HTMLFormElement>, topicoId: number) => void
  onTopicoNameChange: (categoriaId: number, value: string) => void
  onSubtopicoNameChange: (topicoId: number, value: string) => void
  onToggleSubtopico: (subtopicoId: number, concluido: boolean) => void
  onReorderTopicos: (categoriaId: number, ids: number[]) => void
  onReorderSubtopicos: (topicoId: number, ids: number[]) => void
}

function CategoriaDetail({
  categoria,
  onCreateSubtopico,
  onCreateTopico,
  onReorderSubtopicos,
  onReorderTopicos,
  onSubtopicoNameChange,
  onToggleSubtopico,
  onTopicoNameChange,
  pendingAction,
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

      <form className="inline-form inline-form--row add-row" onSubmit={(event) => onCreateTopico(event, categoria.id)}>
        <label>
          Novo topico
          <input
            onChange={(event) => onTopicoNameChange(categoria.id, event.target.value)}
            placeholder="Ex.: Serializers"
            value={topicoNames[categoria.id] ?? ''}
          />
        </label>
        <SubmitButton pending={pendingAction === `topico-${categoria.id}`}>Adicionar</SubmitButton>
      </form>

      {categoria.topicos.length === 0 ? (
        <EmptyState description="Adicione topicos para organizar os subtopicos desta categoria." title="Categoria vazia" />
      ) : (
        <div className="topic-list" ref={topicosRef}>
          {categoria.topicos.map((topico) => (
            <TopicoCard
              key={topico.id}
              onCreateSubtopico={onCreateSubtopico}
              onReorderSubtopicos={onReorderSubtopicos}
              onSubtopicoNameChange={onSubtopicoNameChange}
              onToggleSubtopico={onToggleSubtopico}
              pendingAction={pendingAction}
              subtopicoName={subtopicoNames[topico.id] ?? ''}
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
  pendingAction: string
  onCreateSubtopico: (event: FormEvent<HTMLFormElement>, topicoId: number) => void
  onSubtopicoNameChange: (topicoId: number, value: string) => void
  onToggleSubtopico: (subtopicoId: number, concluido: boolean) => void
  onReorderSubtopicos: (topicoId: number, ids: number[]) => void
}

function TopicoCard({
  onCreateSubtopico,
  onReorderSubtopicos,
  onSubtopicoNameChange,
  onToggleSubtopico,
  pendingAction,
  subtopicoName,
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
          <h2>{topico.nome}</h2>
          <span>
            {topico.subtopicosConcluidos}/{topico.totalSubtopicos} subtopicos concluidos
          </span>
        </div>
        <strong>{topico.progresso}%</strong>
      </header>

      <ProgressBar label={`Progresso do topico ${topico.nome}`} value={topico.progresso} />

      {topico.subtopicos.length === 0 ? (
        <EmptyState description="Cadastre o primeiro subtopico para comecar a acompanhar este topico." title="Sem subtopicos" />
      ) : (
        <div className="subtopic-list" ref={subtopicosRef}>
          {topico.subtopicos.map((subtopico) => (
            <label
              className={subtopico.concluido ? 'subtopic-row subtopic-row--done' : 'subtopic-row'}
              data-item-id={subtopico.id}
              key={subtopico.id}
            >
              <button aria-label={`Reordenar subtopico ${subtopico.nome}`} className="drag-handle" type="button">
                ::
              </button>
              <input
                checked={subtopico.concluido}
                disabled={pendingAction === `toggle-${subtopico.id}`}
                onChange={(event) => onToggleSubtopico(subtopico.id, event.target.checked)}
                type="checkbox"
              />
              <span>{subtopico.nome}</span>
            </label>
          ))}
        </div>
      )}

      <form className="inline-form inline-form--row add-row" onSubmit={(event) => onCreateSubtopico(event, topico.id)}>
        <label>
          Novo subtopico
          <input
            onChange={(event) => onSubtopicoNameChange(topico.id, event.target.value)}
            placeholder="Ex.: Validar payload"
            value={subtopicoName}
          />
        </label>
        <SubmitButton pending={pendingAction === `subtopico-${topico.id}`}>Adicionar</SubmitButton>
      </form>
    </article>
  )
}

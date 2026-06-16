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
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null)
  const [categoriaNome, setCategoriaNome] = useState('')
  const [categoriaDescricao, setCategoriaDescricao] = useState('')
  const [topicoNames, setTopicoNames] = useState<FieldMap>({})
  const [subtopicoNames, setSubtopicoNames] = useState<FieldMap>({})
  const [pendingAction, setPendingAction] = useState('')
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    const data = await api.estudosOverview()
    setOverview(data)
    setSelectedCategoriaId((current) => current ?? data.categorias[0]?.id ?? null)
  }, [])

  useEffect(() => {
    let active = true

    api
      .estudosOverview()
      .then((data) => {
        if (!active) {
          return
        }

        setOverview(data)
        setSelectedCategoriaId((current) => current ?? data.categorias[0]?.id ?? null)
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar os estudos pela API configurada.')
        }
      })

    return () => {
      active = false
    }
  }, [])

  const selectedCategoria = useMemo(
    () => overview?.categorias.find((categoria) => categoria.id === selectedCategoriaId) ?? overview?.categorias[0] ?? null,
    [overview, selectedCategoriaId],
  )

  const replaceOverview = (nextOverview: EstudosOverview) => {
    setOverview(nextOverview)
    setSelectedCategoriaId((current) => current ?? nextOverview.categorias[0]?.id ?? null)
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
      setError('A API não confirmou a operação. Os dados visuais foram recarregados quando possível.')
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
      return result
    })
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
          description="Buscando categorias, tópicos, subtópicos e progresso pela API configurada."
          eyebrow="Estudos"
          title="Carregando área de estudos"
        />
      </main>
    )
  }

  return (
    <main className="workspace">
      <PageHeader
        description="Categorias, tópicos e subtópicos são manipulados via API; progresso e permissões permanecem no backend."
        eyebrow="Estudos"
        title="Plano de estudos"
      />

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      <section className="overview-band" aria-label="Progresso geral">
        <div>
          <span>Progresso geral</span>
          <strong>{overview.progressoGeral}%</strong>
        </div>
        <ProgressBar label="Progresso geral dos estudos" value={overview.progressoGeral} />
      </section>

      <section className="study-grid">
        <aside className="category-panel" aria-label="Categorias">
          <form className="inline-form" onSubmit={createCategoria}>
            <label>
              Nova categoria
              <input onChange={(event) => setCategoriaNome(event.target.value)} required value={categoriaNome} />
            </label>
            <label>
              Descrição
              <input onChange={(event) => setCategoriaDescricao(event.target.value)} required value={categoriaDescricao} />
            </label>
            <SubmitButton pending={pendingAction === 'categoria'}>Criar</SubmitButton>
          </form>

          <div className="category-list">
            {overview.categorias.map((categoria) => (
              <button
                className={categoria.id === selectedCategoria?.id ? 'category-button category-button--active' : 'category-button'}
                key={categoria.id}
                onClick={() => setSelectedCategoriaId(categoria.id)}
                type="button"
              >
                <span>{categoria.nome}</span>
                <strong>{categoria.progresso}%</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="topics-panel">
          {selectedCategoria ? (
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
          ) : (
            <EmptyState description="Crie uma categoria para iniciar o fluxo de estudos." title="Sem categorias" />
          )}
        </section>
      </section>
    </main>
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
          <p>{categoria.descricao}</p>
          <strong>{categoria.progresso}% concluído</strong>
        </div>
        <ProgressBar label={`Progresso da categoria ${categoria.nome}`} value={categoria.progresso} />
      </div>

      <form className="inline-form inline-form--row" onSubmit={(event) => onCreateTopico(event, categoria.id)}>
        <label>
          Novo tópico
          <input
            onChange={(event) => onTopicoNameChange(categoria.id, event.target.value)}
            placeholder="Ex.: Serializers"
            value={topicoNames[categoria.id] ?? ''}
          />
        </label>
        <SubmitButton pending={pendingAction === `topico-${categoria.id}`}>Adicionar tópico</SubmitButton>
      </form>

      {categoria.topicos.length === 0 ? (
        <EmptyState description="Adicione tópicos para organizar os subtópicos desta categoria." title="Categoria vazia" />
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
        <button aria-label={`Reordenar tópico ${topico.nome}`} className="drag-handle" type="button">
          ::
        </button>
        <div>
          <h2>{topico.nome}</h2>
          <span>
            {topico.subtopicosConcluidos}/{topico.totalSubtopicos} subtópicos concluídos
          </span>
        </div>
        <strong>{topico.progresso}%</strong>
      </header>

      <ProgressBar label={`Progresso do tópico ${topico.nome}`} value={topico.progresso} />

      <div className="subtopic-list" ref={subtopicosRef}>
        {topico.subtopicos.map((subtopico) => (
          <label className="subtopic-row" data-item-id={subtopico.id} key={subtopico.id}>
            <button aria-label={`Reordenar subtópico ${subtopico.nome}`} className="drag-handle" type="button">
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

      <form className="inline-form inline-form--row" onSubmit={(event) => onCreateSubtopico(event, topico.id)}>
        <label>
          Novo subtópico
          <input
            onChange={(event) => onSubtopicoNameChange(topico.id, event.target.value)}
            placeholder="Ex.: Validar payload"
            value={subtopicoName}
          />
        </label>
        <SubmitButton pending={pendingAction === `subtopico-${topico.id}`}>Adicionar subtópico</SubmitButton>
      </form>
    </article>
  )
}

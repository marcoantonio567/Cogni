# Regras de Negocio - Gerenciador de Estudos

## Status

Este documento e a fonte oficial de escopo, arquitetura e regras de negocio do
projeto.

- Status atual: arquitetura redesenhada para backend e frontend separados.
- A base Django existente deve ser migrada de `projeto_estudos/` para
  `backend/` antes da implementacao funcional completa.
- O frontend deve viver em `frontend/` e consumir apenas a API publica do
  backend.
- Alteracoes nestas regras devem ser confirmadas antes de serem aplicadas.
- Em caso de ambiguidade durante a implementacao, preservar estas regras e
  solicitar uma decisao antes de mudar o comportamento definido.

## Objetivo

Criar uma aplicacao web completa para gerenciamento de estudos com backend e
frontend independentes:

- Backend em Django, responsavel por dominio, persistencia, autenticacao,
  autorizacao, regras de negocio, progresso, ordenacao e API JSON.
- Frontend em aplicacao cliente separada, responsavel por interface, estado de
  tela, navegacao, chamadas HTTP, graficos e interacoes do usuario.

## Arquitetura Obrigatoria

```text
managerstudys/
|-- backend/
|   |-- manage.py
|   |-- core/
|   |   |-- settings/
|   |   |   |-- base.py
|   |   |   |-- development.py
|   |   |   `-- production.py
|   |   `-- urls.py
|   |-- apps/
|   |   |-- estudos/
|   |   |   |-- models.py
|   |   |   |-- serializers.py
|   |   |   |-- views.py
|   |   |   |-- services.py
|   |   |   |-- mixins.py
|   |   |   `-- urls.py
|   |   |-- accounts/
|   |   |   `-- autenticacao, usuario, perfil e API de sessao
|   |   `-- dashboard/
|   |       `-- metricas, estatisticas e API de graficos
|   |-- requirements/
|   `-- tests/
|-- frontend/
|   |-- package.json
|   |-- src/
|   |   |-- app/
|   |   |-- features/
|   |   |   |-- accounts/
|   |   |   |-- estudos/
|   |   |   `-- dashboard/
|   |   |-- shared/
|   |   |   |-- api/
|   |   |   |-- components/
|   |   |   `-- styles/
|   |   `-- main.*
|   |-- public/
|   `-- tests/
`-- docs/
    |-- REGRAS_DE_NEGOCIO.md
    `-- BACKLOG.md
```

Interpretar descricoes como `autenticacao, usuario, perfil e API de sessao` como
areas de responsabilidade dos apps, nao como nomes literais obrigatorios de
arquivos. Arquivos Django padrao adicionais, como `apps.py`, `admin.py`,
`forms.py`, `tests.py` ou `migrations/`, sao permitidos se preservarem as
responsabilidades acima.

## Padroes Obrigatorios do Backend

1. Usar Service Layer em `backend/apps/estudos/services.py`, com a classe
   `ProgressoService`.
2. Criar os mixins `UserOwnershipMixin` e `ProgressoMixin` em
   `backend/apps/estudos/mixins.py`.
3. Expor API JSON versionada a partir de `backend/core/urls.py`, por exemplo
   `/api/v1/`.
4. Manter campos denormalizados em `Categoria` e `Topico` para cache de
   progresso.
5. Usar transacoes nas operacoes que alteram subtopicos, progresso ou ordenacao.
6. Validar isolamento por usuario no backend em toda consulta e mutacao.
7. Expor endpoints de ordenacao para topicos e subtopicos.
8. Expor endpoints de estatisticas para o dashboard semanal.

## Padroes Obrigatorios do Frontend

1. O frontend deve ser independente do template engine do Django.
2. O frontend deve consumir apenas endpoints da API publica do backend.
3. O framework padrao sera Vite + React + TypeScript, salvo decisao explicita em
   contrario antes da implementacao.
4. Checkboxes de conclusao devem atualizar o backend via chamada HTTP sem
   recarregar a pagina.
5. Ordenacao visual deve usar SortableJS ou biblioteca equivalente aprovada,
   persistindo a ordem pela API do backend.
6. O dashboard deve renderizar o grafico semanal com Chart.js ou wrapper
   equivalente.
7. Estado visual nao pode substituir validacao de permissao no backend.

## Contrato Backend/Frontend

- O backend e a fonte da verdade para regras de negocio, permissao, progresso e
  ordenacao.
- O frontend nao calcula progresso definitivo; ele exibe valores retornados pela
  API.
- Payloads e respostas criticas devem ser documentados antes ou junto da
  implementacao dos endpoints.
- Mudancas de contrato devem ser registradas em `docs/BACKLOG.md` e refletidas
  nos dois lados.
- Erros de autorizacao, validacao e autenticacao devem retornar respostas
  padronizadas para o frontend.

## Modelos

### Categoria

- `nome`
- `descricao`
- `usuario`
- `total_subtopicos`
- `subtopicos_concluidos`
- `progresso_cache`

### Topico

- `nome`
- `categoria`
- `ordem`
- `usuario`

O modelo deve participar do cache denormalizado de progresso, conforme definido
nos padroes obrigatorios. Os campos exatos adicionais necessarios para esse cache
devem ser definidos antes ou durante a implementacao sem remover os campos
listados acima.

### Subtopico

- `nome`
- `topico`
- `subtopico_pai` opcional, apontando para outro `Subtopico` do mesmo `Topico`
- `concluido`
- `ordem`
- `observacoes`

Um `Subtopico` pode conter outros subtopicos filhos. Subtopicos sem
`subtopico_pai` pertencem diretamente ao `Topico`; subtopicos com
`subtopico_pai` pertencem ao subtopico informado. Todos continuam vinculados ao
mesmo `Topico`, e o progresso deve contabilizar subtopicos de todos os niveis.

## Funcionalidades Obrigatorias

- CRUD completo para `Categoria`, `Topico` e `Subtopico` via API.
- Interface frontend completa para `Categoria`, `Topico` e `Subtopico`.
- Interface e API devem permitir criar subtopicos dentro de outro subtopico.
- Barra de progresso geral.
- Barra de progresso por categoria.
- Barra de progresso por topico.
- Dashboard com grafico semanal usando Chart.js ou wrapper equivalente.
- Isolamento por usuario: cada usuario pode visualizar e manipular apenas os
  proprios dados.
- Autenticacao integrada entre frontend e backend.

## Politica de Worktrees

O desenvolvimento deve considerar apenas duas worktrees de trabalho:

- Uma worktree para a branch de backend, alterando principalmente `backend/`,
  contratos de API e documentacao relacionada.
- Uma worktree para a branch de frontend, alterando principalmente `frontend/`,
  consumo da API e documentacao relacionada.

Nao criar uma worktree por feature, agente ou tarefa. Quando houver varias
features de backend ou frontend, elas devem ser organizadas em commits ou
sub-branches dentro da worktree correspondente, conforme decisao do usuario.

Arquivos compartilhados em `docs/` devem ter um dono claro por alteracao para
evitar conflito entre as duas worktrees.

## Restricoes de Implementacao

- A separacao `backend/` e `frontend/` e obrigatoria.
- O backend nao deve depender do frontend para validar regras de negocio.
- O frontend nao deve acessar banco de dados diretamente.
- A entrega deve incluir instrucoes separadas para rodar backend e frontend.
- A entrega deve incluir comandos de teste para backend e frontend.
- Qualquer mudanca de stack, autenticacao ou contrato de API deve ser registrada
  neste documento antes de ser implementada.

# Backlog - Gerenciador de Estudos

Este backlog organiza o projeto por features, com base em
`docs/REGRAS_DE_NEGOCIO.md`.

## Status do Projeto

- Requisitos registrados.
- Implementacao da aplicacao ainda nao iniciada.
- Este arquivo e um artefato de planejamento e nao autoriza mudancas nas regras
  oficiais.
- Este backlog tambem orienta execucao em worktrees e branches paralelas.

## Execucao com Worktrees e Agentes

Este projeto deve ser executado com uma branch por feature quando houver mais de
um agente trabalhando ao mesmo tempo.

Regra operacional:

- Cada worktree deve usar uma branch com o nome da feature.
- Cada feature deve iniciar chamando o agente `coordenador-tecnico`.
- O `coordenador-tecnico` deve ler `docs/REGRAS_DE_NEGOCIO.md`, identificar as
  dependencias da feature e orquestrar os agentes especializados necessarios.
- Nenhum agente deve alterar regra oficial sem confirmacao explicita.
- Branches paralelas devem evitar editar os mesmos arquivos estruturais ao mesmo
  tempo, principalmente settings, URLs globais, models e templates base.
- Antes de mergear uma branch paralela, rebasear ou atualizar a worktree contra
  a branch base mais recente e rodar validacoes proporcionais.

Prompt base recomendado para abrir cada worktree:

```text
Use o agente coordenador-tecnico para orquestrar esta feature.
Leia docs/REGRAS_DE_NEGOCIO.md e docs/BACKLOG.md antes de agir.
Trabalhe apenas na branch <nome-da-branch>.
Implemente somente a feature <nome-da-feature>, respeitando as dependencias.
Ao final, reporte arquivos alterados, validacoes executadas e pendencias reais.
```

## Mapa de Branches para Worktrees

| Ordem | Feature | Branch sugerida | Base recomendada | Agente coordenador chama | Pode rodar em paralelo com | Depende de |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Estrutura Inicial do Projeto Django | `feature/bootstrap-django` | `main` | Arquiteto Django, Regras de Negocio, Documentacao e Execucao | Nenhuma feature de codigo | Nenhuma |
| 2 | Autenticacao e Isolamento por Usuario | `feature/accounts-auth` | `feature/bootstrap-django` | Seguranca e Usuario, Arquiteto Django, Testes e Validacao | `feature/layout-base`, `feature/models-estudos` com cuidado | Bootstrap |
| 3 | Modelagem de Dados | `feature/models-estudos` | `feature/bootstrap-django` | Modelagem de Dados, Regras de Negocio, Testes e Validacao | `feature/accounts-auth`, `feature/layout-base` com cuidado | Bootstrap |
| 4 | Layout Base e Frontend | `feature/layout-base` | `feature/bootstrap-django` | Frontend HTMX, Arquiteto Django | `feature/accounts-auth`, `feature/models-estudos` | Bootstrap |
| 5 | Service Layer de Progresso | `feature/progresso-service` | `feature/models-estudos` | Service Layer / Progresso, Modelagem de Dados, Testes e Validacao | `feature/mixins-obrigatorios` com contrato combinado | Models |
| 6 | Mixins Obrigatorios | `feature/mixins-obrigatorios` | branch integrada de auth e models | Seguranca e Usuario, Service Layer / Progresso, Arquiteto Django | `feature/progresso-service` com cuidado | Auth, Models |
| 7 | CRUD de Categorias | `feature/crud-categorias` | base integrada de auth, models, service e mixins | Arquiteto Django, Seguranca e Usuario, Service Layer / Progresso, Testes e Validacao | `feature/crud-topicos` somente apos contrato de views/URLs | Auth, Models, Service, Mixins |
| 8 | CRUD de Topicos | `feature/crud-topicos` | base integrada de auth, models, service e mixins | Arquiteto Django, Seguranca e Usuario, Service Layer / Progresso, Testes e Validacao | `feature/crud-subtopicos` somente apos contrato de rotas | CRUD Categorias ou contrato minimo de Categoria |
| 9 | CRUD de Subtopicos | `feature/crud-subtopicos` | base integrada de auth, models, service e mixins | Arquiteto Django, Seguranca e Usuario, Service Layer / Progresso, Testes e Validacao | `feature/barras-progresso` com cuidado | CRUD Topicos ou contrato minimo de Topico |
| 10 | Barras de Progresso | `feature/barras-progresso` | `feature/progresso-service` + CRUDs necessarios | Service Layer / Progresso, Frontend HTMX, Testes e Validacao | `feature/htmx-checkbox` | Service, CRUDs minimos |
| 11 | HTMX para Checkbox de Conclusao | `feature/htmx-checkbox` | `feature/crud-subtopicos` + `feature/barras-progresso` | Frontend HTMX, Seguranca e Usuario, Service Layer / Progresso, Testes e Validacao | `feature/sortablejs` | CRUD Subtopicos, Barras |
| 12 | Ordenacao com SortableJS | `feature/sortablejs` | `feature/crud-topicos` + `feature/crud-subtopicos` | Ordenacao SortableJS, Seguranca e Usuario, Testes e Validacao | `feature/htmx-checkbox`, `feature/dashboard` | CRUD Topicos, CRUD Subtopicos |
| 13 | Dashboard e Estatisticas | `feature/dashboard` | `feature/progresso-service` + models integrados | Dashboard e Estatisticas, Seguranca e Usuario, Service Layer / Progresso, Testes e Validacao | `feature/sortablejs`, `feature/docs-execucao` | Models, Service, Auth |
| 14 | Testes Automatizados | `feature/testes-criticos` | branch integrada mais recente | Testes e Validacao, Regras de Negocio | Pode acompanhar todas as features, mas deve rebasear muito | Depende do alvo testado |
| 15 | Documentacao de Execucao | `feature/docs-execucao` | branch integrada mais recente | Documentacao e Execucao, Regras de Negocio | `feature/dashboard`, `feature/testes-criticos` | Comandos e estrutura finais |

## Fases de Paralelismo

### Fase 0 - Fundacao obrigatoria

Rodar primeiro:

1. `feature/bootstrap-django`

Esta branch cria a base tecnica. Nao vale abrir muitas features de codigo antes
dela, porque quase todas dependerao de estrutura, apps, settings e URLs.

### Fase 1 - Paralelo controlado apos bootstrap

Podem rodar em paralelo depois do merge ou estabilizacao de
`feature/bootstrap-django`:

1. `feature/accounts-auth`
2. `feature/models-estudos`
3. `feature/layout-base`

Cuidados:

- `feature/accounts-auth` e `feature/models-estudos` podem tocar modelos e
  imports relacionados a usuario; combinar contratos antes.
- `feature/layout-base` deve evitar depender de dados reais enquanto models e
  CRUDs nao estiverem prontos.

### Fase 2 - Contratos internos

Rodar depois de auth e models estarem claros:

1. `feature/progresso-service`
2. `feature/mixins-obrigatorios`

Estas duas podem andar em paralelo somente se o contrato estiver combinado:

- `ProgressoService` fica em `apps/estudos/services.py`.
- `UserOwnershipMixin` e `ProgressoMixin` ficam em `apps/estudos/mixins.py`.
- Views nao devem calcular progresso diretamente.
- Isolamento por usuario deve ser validado no backend.

### Fase 3 - CRUDs

Ordem mais segura:

1. `feature/crud-categorias`
2. `feature/crud-topicos`
3. `feature/crud-subtopicos`

Paralelismo possivel:

- `feature/crud-topicos` pode iniciar quando Categoria tiver contrato minimo
  definido.
- `feature/crud-subtopicos` pode iniciar quando Topico tiver contrato minimo
  definido.
- Se rodarem juntas, o coordenador deve congelar nomes de URLs, forms,
  templates e relacionamentos antes.

### Fase 4 - Interacao e visualizacao

Podem rodar em paralelo depois dos CRUDs minimos:

1. `feature/barras-progresso`
2. `feature/htmx-checkbox`
3. `feature/sortablejs`
4. `feature/dashboard`

Cuidados:

- `feature/htmx-checkbox` depende de subtopicos e barras de progresso.
- `feature/sortablejs` depende de topicos e subtopicos persistidos.
- `feature/dashboard` depende de auth, models e service layer.

### Fase 5 - Fechamento

Rodar continuamente ou ao final:

1. `feature/testes-criticos`
2. `feature/docs-execucao`

`feature/testes-criticos` pode existir desde cedo, mas deve ser atualizada a
cada merge importante. `feature/docs-execucao` deve fechar com os comandos reais
do projeto.

## Ordem de Merge Recomendada

1. `feature/bootstrap-django`
2. `feature/models-estudos`
3. `feature/accounts-auth`
4. `feature/progresso-service`
5. `feature/mixins-obrigatorios`
6. `feature/layout-base`
7. `feature/crud-categorias`
8. `feature/crud-topicos`
9. `feature/crud-subtopicos`
10. `feature/barras-progresso`
11. `feature/htmx-checkbox`
12. `feature/sortablejs`
13. `feature/dashboard`
14. `feature/testes-criticos`
15. `feature/docs-execucao`

Se duas branches paralelas alterarem os mesmos arquivos, a ordem de merge deve
priorizar a branch que define contrato estrutural: models, services, mixins, URLs
e depois templates.

## 1. Estrutura Inicial do Projeto Django

Objetivo: criar a base do projeto seguindo a estrutura obrigatoria.

Tarefas:

- Criar projeto `projeto_estudos`.
- Criar `core/settings/base.py`.
- Criar `core/settings/development.py`.
- Criar `core/settings/production.py`.
- Criar `core/urls.py`.
- Criar app `apps/estudos`.
- Criar app `apps/accounts`.
- Criar app `apps/dashboard`.
- Criar `templates/base.html`.
- Criar `templates/partials/`.
- Criar `static/css/`.
- Criar `static/js/`.
- Criar `requirements/`.
- Configurar apps instalados.
- Configurar settings por ambiente.

Criterios de aceite:

- O projeto executa localmente.
- A estrutura bate com a regra oficial.
- Os apps obrigatorios existem e estao registrados.

## 2. Autenticacao e Isolamento por Usuario

Objetivo: garantir que cada usuario visualize e manipule somente os proprios
dados.

Tarefas:

- Implementar login.
- Implementar logout.
- Implementar cadastro ou fluxo basico de criacao de usuario.
- Proteger views que exigem usuario autenticado.
- Filtrar categorias por `request.user`.
- Validar propriedade de categorias, topicos e subtopicos.
- Bloquear acesso direto por URL a objetos de outro usuario.

Criterios de aceite:

- Um usuario nao acessa dados de outro usuario.
- Todas as operacoes sensiveis validam propriedade no backend.
- O isolamento nao depende apenas da interface.

## 3. Modelagem de Dados

Objetivo: criar os modelos principais do dominio de estudos.

Tarefas:

- Criar modelo `Categoria`.
- Criar modelo `Topico`.
- Criar modelo `Subtopico`.
- Adicionar campos denormalizados de progresso em `Categoria`.
- Adicionar campos denormalizados necessarios em `Topico`.
- Definir relacionamentos entre usuario, categoria, topico e subtopico.
- Definir ordenacao por `ordem`.
- Criar migrations.

Criterios de aceite:

- Os campos obrigatorios existem.
- As relacoes pai-filho preservam integridade.
- `Categoria` e `Topico` participam do cache denormalizado de progresso.

## 4. Service Layer de Progresso

Objetivo: centralizar calculos e atualizacoes de progresso em
`ProgressoService`.

Tarefas:

- Criar `apps/estudos/services.py`.
- Criar classe `ProgressoService`.
- Calcular progresso por topico.
- Calcular progresso por categoria.
- Calcular progresso geral do usuario.
- Atualizar cache apos criar, editar, concluir ou excluir subtopicos.
- Usar transacoes em operacoes criticas.

Criterios de aceite:

- Views nao calculam progresso diretamente.
- Mudancas em subtopicos atualizam os caches relacionados.
- O progresso cacheado permanece consistente.

## 5. Mixins Obrigatorios

Objetivo: padronizar seguranca e atualizacao de progresso.

Tarefas:

- Criar `apps/estudos/mixins.py`.
- Implementar `UserOwnershipMixin`.
- Implementar `ProgressoMixin`.
- Aplicar os mixins nas views adequadas.

Criterios de aceite:

- As views reutilizam os mixins obrigatorios.
- O isolamento por usuario e aplicado de forma consistente.
- Atualizacoes de progresso passam pelo service layer.

## 6. CRUD de Categorias

Objetivo: permitir gerenciamento completo de categorias.

Tarefas:

- Listar categorias do usuario.
- Criar categoria.
- Editar categoria.
- Excluir categoria.
- Exibir progresso por categoria.
- Criar templates de listagem e formulario.

Criterios de aceite:

- Usuario ve somente as proprias categorias.
- Categoria exibe progresso correto.
- Operacoes atualizam dados relacionados quando necessario.

## 7. CRUD de Topicos

Objetivo: permitir gerenciamento completo de topicos dentro das categorias.

Tarefas:

- Listar topicos por categoria.
- Criar topico.
- Editar topico.
- Excluir topico.
- Exibir progresso por topico.
- Validar que o topico pertence a categoria do usuario.

Criterios de aceite:

- Topicos aparecem apenas em categorias do usuario.
- O progresso por topico e exibido corretamente.
- Alteracoes atualizam cache via `ProgressoService`.

## 8. CRUD de Subtopicos

Objetivo: permitir gerenciamento completo de subtopicos dentro dos topicos.

Tarefas:

- Listar subtopicos por topico.
- Criar subtopico.
- Editar subtopico.
- Excluir subtopico.
- Marcar subtopico como concluido.
- Salvar observacoes.
- Validar propriedade via topico e categoria.

Criterios de aceite:

- Subtopicos so podem ser manipulados pelo dono.
- Criar, editar, concluir e excluir atualiza progresso.
- Observacoes sao persistidas corretamente.

## 9. HTMX para Checkbox de Conclusao

Objetivo: atualizar conclusao de subtopico sem recarregar a pagina.

Tarefas:

- Adicionar HTMX ao frontend.
- Criar endpoint para alternar `concluido`.
- Criar partial para linha ou item de subtopico.
- Atualizar barras de progresso afetadas.
- Implementar fallback HTTP, se necessario.
- Proteger endpoint contra acesso cruzado.

Criterios de aceite:

- O checkbox atualiza via AJAX.
- A pagina nao recarrega.
- Os progressos exibidos refletem a mudanca.
- Usuario nao altera subtopico de outro usuario.

## 10. Ordenacao com SortableJS

Objetivo: permitir reordenar topicos e subtopicos por drag-and-drop.

Tarefas:

- Adicionar SortableJS ao frontend.
- Implementar ordenacao de topicos dentro de uma categoria.
- Implementar ordenacao de subtopicos dentro de um topico.
- Criar endpoints para persistir nova ordem.
- Validar propriedade dos itens enviados.
- Tratar payloads invalidos.

Criterios de aceite:

- A ordem permanece apos recarregar a pagina.
- Usuario so reordena os proprios itens.
- Nao e possivel mover itens para estruturas de outro usuario.

## 11. Barras de Progresso

Objetivo: exibir progresso geral, por categoria e por topico.

Tarefas:

- Criar partial de barra de progresso.
- Exibir progresso geral do usuario.
- Exibir progresso por categoria.
- Exibir progresso por topico.
- Integrar atualizacoes com HTMX.
- Usar `ProgressoService` como fonte de calculo.

Criterios de aceite:

- Progresso visual bate com os dados persistidos.
- Barras atualizam apos mudancas.
- Nao ha calculo duplicado em views ou templates.

## 12. Dashboard e Estatisticas

Objetivo: criar dashboard com metricas e grafico semanal usando Chart.js.

Tarefas:

- Criar views do app `dashboard`.
- Calcular metricas gerais do usuario.
- Gerar dados para grafico semanal.
- Integrar Chart.js.
- Criar template do dashboard.
- Garantir isolamento por usuario nas estatisticas.

Criterios de aceite:

- Dashboard mostra apenas dados do usuario logado.
- Grafico semanal usa Chart.js.
- Metricas sao consistentes com os dados de estudo.

## 13. Layout Base e Frontend

Objetivo: criar interface base consistente para o sistema.

Tarefas:

- Criar `templates/base.html`.
- Criar navegacao principal.
- Criar templates de listagem.
- Criar templates de formulario.
- Criar partials reutilizaveis.
- Criar CSS em `static/css/`.
- Criar JS em `static/js/`.
- Integrar HTMX, SortableJS e Chart.js.

Criterios de aceite:

- Interface permite usar o fluxo principal.
- Templates reutilizam base e partials.
- Assets carregam corretamente.

## 14. Testes Automatizados

Objetivo: validar regras criticas e evitar regressoes.

Tarefas:

- Testar modelos.
- Testar `ProgressoService`.
- Testar isolamento por usuario.
- Testar CRUD de categoria.
- Testar CRUD de topico.
- Testar CRUD de subtopico.
- Testar checkbox HTMX.
- Testar ordenacao SortableJS.
- Testar dashboard.

Criterios de aceite:

- Fluxos criticos possuem cobertura automatizada.
- Casos de acesso cruzado sao bloqueados.
- Calculos de progresso sao validados.

## 15. Documentacao de Execucao

Objetivo: entregar instrucoes claras para instalar e rodar o projeto.

Tarefas:

- Criar ou atualizar `README.md`.
- Documentar ambiente virtual.
- Documentar instalacao de dependencias.
- Documentar migracoes.
- Documentar criacao de superusuario.
- Documentar execucao local.
- Documentar comandos de teste.

Criterios de aceite:

- Um novo desenvolvedor consegue rodar o projeto seguindo a documentacao.
- Dependencias e comandos estao atualizados.

## Ordem Recomendada Sequencial

1. Estrutura inicial do Django.
2. Autenticacao e isolamento por usuario.
3. Modelagem de dados.
4. Service layer de progresso.
5. Mixins obrigatorios.
6. CRUD de categorias.
7. CRUD de topicos.
8. CRUD de subtopicos.
9. Barras de progresso.
10. HTMX para conclusao.
11. SortableJS para ordenacao.
12. Dashboard com Chart.js.
13. Layout base e frontend.
14. Testes automatizados.
15. Documentacao de execucao.

# Backlog - Gerenciador de Estudos

Este backlog organiza o projeto por features, com base em
`docs/REGRAS_DE_NEGOCIO.md`.

## Status do Projeto

- Requisitos registrados.
- Implementacao da aplicacao ainda nao iniciada.
- Este arquivo e um artefato de planejamento e nao autoriza mudancas nas regras
  oficiais.

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

## Ordem Recomendada

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
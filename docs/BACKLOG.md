# Backlog - Gerenciador de Estudos

Este backlog organiza o projeto por features, com base em
`docs/REGRAS_DE_NEGOCIO.md`.

## Status do Projeto

- Arquitetura oficial redesenhada para backend e frontend separados.
- Backend alvo: Django API em `backend/`.
- Frontend alvo: aplicacao cliente em `frontend/`.
- Desenvolvimento planejado para somente duas worktrees: uma de backend e uma de
  frontend.
- Este arquivo e um artefato de planejamento e nao autoriza mudancas nas regras
  oficiais sem registro em `docs/REGRAS_DE_NEGOCIO.md`.

## Log de Decisao

### 2026-06-16 - Separacao Backend/Frontend

Decisao: substituir a arquitetura Django monolitica com templates por uma
arquitetura separada entre backend e frontend.

Motivo: permitir trabalho paralelo com duas worktrees fixas, uma orientada ao
backend e outra orientada ao frontend.

Impactos:

- `projeto_estudos/` deixa de ser a arquitetura final e deve ser migrado para
  `backend/`.
- O frontend passa a viver em `frontend/`.
- HTMX deixa de ser obrigatorio; a atualizacao sem recarregar passa a ser feita
  por chamadas HTTP do frontend para a API.
- SortableJS continua permitido/esperado para ordenacao visual, com persistencia
  pela API.
- Chart.js continua esperado no dashboard, agora renderizado pelo frontend com
  dados vindos da API.
- A regra de negocio, progresso, autorizacao e isolamento por usuario continuam
  obrigatoriamente no backend.

## 1. Reorganizacao Inicial da Estrutura

Objetivo: transformar a base atual em uma estrutura separada de backend e
frontend.

Tarefas:

- Criar diretorio `backend/`.
- Migrar a base Django de `projeto_estudos/` para `backend/`.
- Ajustar caminhos de settings, requisitos, manage.py e imports apos a migracao.
- Criar diretorio `frontend/`.
- Criar estrutura inicial do frontend em `frontend/src/`.
- Remover dependencia de templates Django como interface principal.
- Preservar `docs/` na raiz do repositorio.
- Atualizar instrucoes locais de execucao.

Criterios de aceite:

- O backend executa a partir de `backend/`.
- O frontend possui estrutura propria em `frontend/`.
- A raiz do repositorio deixa claro o limite entre backend, frontend e docs.
- Nenhuma regra de negocio e deslocada para o frontend.

## 2. Politica de Duas Worktrees

Objetivo: padronizar o fluxo de trabalho usando somente duas worktrees.

Tarefas:

- Definir a worktree de backend e sua branch ativa.
- Definir a worktree de frontend e sua branch ativa.
- Registrar que nao havera worktree por feature, agente ou tarefa.
- Definir ownership de alteracoes compartilhadas em `docs/`.
- Documentar como sincronizar contratos de API entre as duas branches.

Criterios de aceite:

- Existem apenas duas worktrees de desenvolvimento planejadas.
- Cada worktree tem responsabilidade clara.
- Mudancas em `docs/` nao ficam ambiguas entre backend e frontend.

## 3. Contrato de API

Objetivo: definir a fronteira entre backend e frontend antes das telas finais.

Tarefas:

- Definir prefixo versionado da API, como `/api/v1/`.
- Definir formato padrao de resposta.
- Definir formato padrao de erro.
- Definir endpoints de autenticacao e sessao.
- Definir endpoints de categorias.
- Definir endpoints de topicos.
- Definir endpoints de subtopicos.
- Definir endpoints de progresso.
- Definir endpoints de ordenacao.
- Definir endpoints de dashboard semanal.

Criterios de aceite:

- O frontend consegue ser desenvolvido contra um contrato claro.
- Erros de autenticacao, autorizacao e validacao sao previsiveis.
- O backend permanece como fonte da verdade das regras de negocio.

## 4. Backend - Base Django API

Objetivo: preparar o backend Django para servir API JSON.

Tarefas:

- Manter `core/settings/base.py`.
- Manter `core/settings/development.py`.
- Manter `core/settings/production.py`.
- Configurar apps obrigatorios em `backend/apps/`.
- Configurar roteamento principal em `backend/core/urls.py`.
- Adicionar suporte a API JSON.
- Configurar CORS/CSRF conforme estrategia de autenticacao.
- Separar requirements de desenvolvimento e producao.

Criterios de aceite:

- Backend sobe localmente.
- Endpoints base respondem sob o prefixo da API.
- Configuracao de ambiente permanece separada.

## 5. Backend - Autenticacao e Isolamento por Usuario

Objetivo: garantir que cada usuario visualize e manipule somente os proprios
dados.

Tarefas:

- Implementar login via API.
- Implementar logout via API.
- Implementar cadastro ou fluxo basico de criacao de usuario.
- Proteger endpoints que exigem usuario autenticado.
- Filtrar categorias por `request.user`.
- Validar propriedade de categorias, topicos e subtopicos.
- Bloquear acesso direto por ID a objetos de outro usuario.

Criterios de aceite:

- Um usuario nao acessa dados de outro usuario.
- Todas as operacoes sensiveis validam propriedade no backend.
- O isolamento nao depende do frontend.

## 6. Backend - Modelagem de Dados

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

## 7. Backend - Service Layer de Progresso

Objetivo: centralizar calculos e atualizacoes de progresso em
`ProgressoService`.

Tarefas:

- Criar `backend/apps/estudos/services.py`.
- Criar classe `ProgressoService`.
- Calcular progresso por topico.
- Calcular progresso por categoria.
- Calcular progresso geral do usuario.
- Atualizar cache apos criar, editar, concluir ou excluir subtopicos.
- Usar transacoes em operacoes criticas.

Criterios de aceite:

- Endpoints nao calculam progresso diretamente.
- Mudancas em subtopicos atualizam os caches relacionados.
- O progresso cacheado permanece consistente.

## 8. Backend - Mixins e Permissoes

Objetivo: padronizar seguranca e atualizacao de progresso.

Tarefas:

- Criar `backend/apps/estudos/mixins.py`.
- Implementar `UserOwnershipMixin`.
- Implementar `ProgressoMixin`.
- Aplicar os mixins nas views, viewsets ou services adequados.

Criterios de aceite:

- O isolamento por usuario e aplicado de forma consistente.
- Atualizacoes de progresso passam pelo service layer.
- A API bloqueia mutacoes cruzadas entre usuarios.

## 9. Backend - CRUD e Mutacoes de Estudos

Objetivo: disponibilizar API completa para categorias, topicos e subtopicos.

Tarefas:

- Criar serializers de categorias.
- Criar serializers de topicos.
- Criar serializers de subtopicos.
- Criar endpoints de CRUD de categorias.
- Criar endpoints de CRUD de topicos.
- Criar endpoints de CRUD de subtopicos.
- Criar endpoint para alternar conclusao de subtopico.
- Criar endpoints para ordenar topicos e subtopicos.

Criterios de aceite:

- CRUD completo funciona via API.
- Mutacoes atualizam progresso quando necessario.
- Ordenacao persiste no banco.
- Usuario so manipula os proprios dados.

## 10. Backend - Dashboard e Estatisticas

Objetivo: fornecer dados de metricas e grafico semanal para o frontend.

Tarefas:

- Criar endpoints do app `dashboard`.
- Calcular metricas gerais do usuario.
- Gerar dados para grafico semanal.
- Garantir isolamento por usuario nas estatisticas.
- Retornar dados prontos para Chart.js ou adaptacao simples no frontend.

Criterios de aceite:

- Dashboard API mostra apenas dados do usuario logado.
- Dados semanais sao consistentes com os registros de estudo.
- O frontend nao precisa recalcular metricas de negocio.

## 11. Frontend - Base da Aplicacao

Objetivo: criar a aplicacao cliente separada.

Tarefas:

- Criar projeto frontend em `frontend/`.
- Configurar Vite + React + TypeScript, salvo decisao em contrario.
- Criar estrutura `src/app/`, `src/features/` e `src/shared/`.
- Configurar cliente HTTP em `src/shared/api/`.
- Configurar variavel de ambiente para URL do backend.
- Criar layout base da aplicacao.

Criterios de aceite:

- Frontend executa localmente.
- URL do backend e configuravel por ambiente.
- Estrutura separa features e codigo compartilhado.

## 12. Frontend - Autenticacao

Objetivo: criar fluxo de autenticacao consumindo a API.

Tarefas:

- Criar tela de login.
- Criar tela de cadastro, se o fluxo for aprovado.
- Implementar logout.
- Guardar estado de sessao conforme estrategia definida.
- Proteger rotas autenticadas.
- Tratar erros de autenticacao retornados pelo backend.

Criterios de aceite:

- Usuario consegue entrar e sair pela interface.
- Rotas privadas nao sao exibidas como se estivessem autenticadas.
- Falhas da API sao apresentadas de forma clara.

## 13. Frontend - Estudos

Objetivo: criar a interface principal de categorias, topicos e subtopicos.

Tarefas:

- Listar categorias.
- Criar, editar e excluir categorias.
- Listar topicos por categoria.
- Criar, editar e excluir topicos.
- Listar subtopicos por topico.
- Criar, editar e excluir subtopicos.
- Marcar subtopico como concluido sem recarregar a pagina.
- Exibir progresso geral, por categoria e por topico.

Criterios de aceite:

- Interface cobre o fluxo principal de estudos.
- Progresso exibido vem da API.
- Mutacoes atualizam a tela sem recarregar a aplicacao inteira.

## 14. Frontend - Ordenacao

Objetivo: permitir reordenar topicos e subtopicos pela interface.

Tarefas:

- Integrar SortableJS ou biblioteca equivalente aprovada.
- Implementar ordenacao de topicos dentro de uma categoria.
- Implementar ordenacao de subtopicos dentro de um topico.
- Enviar nova ordem para a API.
- Tratar erro de persistencia restaurando ou avisando o usuario.

Criterios de aceite:

- A ordem permanece apos recarregar a pagina.
- A interface nao permite mover itens para estruturas invalidas.
- O backend continua validando propriedade e payload.

## 15. Frontend - Dashboard

Objetivo: renderizar metricas e grafico semanal.

Tarefas:

- Criar tela de dashboard.
- Consumir endpoint de metricas.
- Consumir endpoint de grafico semanal.
- Integrar Chart.js ou wrapper equivalente.
- Exibir estados de carregamento e erro.

Criterios de aceite:

- Dashboard mostra dados do usuario logado.
- Grafico semanal renderiza corretamente.
- A tela nao recalcula regras de negocio no cliente.

## 16. Testes Backend

Objetivo: validar regras criticas e evitar regressoes no backend.

Tarefas:

- Testar modelos.
- Testar `ProgressoService`.
- Testar isolamento por usuario.
- Testar CRUD de categoria.
- Testar CRUD de topico.
- Testar CRUD de subtopico.
- Testar alternancia de conclusao.
- Testar ordenacao.
- Testar dashboard API.

Criterios de aceite:

- Fluxos criticos possuem cobertura automatizada.
- Casos de acesso cruzado sao bloqueados.
- Calculos de progresso sao validados.

## 17. Testes Frontend

Objetivo: validar fluxos principais da interface.

Tarefas:

- Testar renderizacao de telas principais.
- Testar login/logout.
- Testar CRUDs pela interface.
- Testar checkbox de conclusao.
- Testar ordenacao visual.
- Testar dashboard.
- Testar tratamento de erros da API.

Criterios de aceite:

- Fluxos principais sao cobertos por testes proporcionais ao risco.
- Componentes criticos respondem corretamente a estados de loading e erro.
- Integracao com o cliente HTTP e previsivel.

## 18. Integracao e Documentacao de Execucao

Objetivo: entregar instrucoes claras para rodar backend e frontend juntos.

Tarefas:

- Criar ou atualizar `README.md`.
- Documentar ambiente virtual do backend.
- Documentar instalacao de dependencias do backend.
- Documentar migracoes.
- Documentar criacao de superusuario.
- Documentar execucao local do backend.
- Documentar instalacao de dependencias do frontend.
- Documentar execucao local do frontend.
- Documentar variaveis de ambiente dos dois lados.
- Documentar comandos de teste dos dois lados.

Criterios de aceite:

- Um novo desenvolvedor consegue rodar backend e frontend seguindo a
  documentacao.
- Dependencias e comandos estao atualizados.
- O fluxo com duas worktrees esta descrito sem incentivar worktrees extras.

## Ordem Recomendada

1. Reorganizacao inicial da estrutura.
2. Politica de duas worktrees.
3. Contrato de API.
4. Backend base Django API.
5. Backend autenticacao e isolamento.
6. Backend modelagem de dados.
7. Backend service layer de progresso.
8. Backend mixins e permissoes.
9. Backend CRUD e mutacoes de estudos.
10. Backend dashboard e estatisticas.
11. Frontend base da aplicacao.
12. Frontend autenticacao.
13. Frontend estudos.
14. Frontend ordenacao.
15. Frontend dashboard.
16. Testes backend.
17. Testes frontend.
18. Integracao e documentacao de execucao.

## Paralelizacao Recomendada com Duas Worktrees

Esta matriz considera somente duas worktrees fixas: uma de backend e uma de
frontend.

| Fase | Worktree Backend | Worktree Frontend | Observacao |
|---|---|---|---|
| 1 | Reorganizacao de `backend/` e contrato inicial | Criacao de `frontend/` | Evitar editar os mesmos docs ao mesmo tempo |
| 2 | Auth, modelos, services, API | Layout, cliente HTTP, telas com mocks/contrato | Frontend pode usar contrato antes da API final |
| 3 | CRUD, progresso, ordenacao, dashboard API | Telas de estudos, ordenacao e dashboard | Sincronizar payloads quando endpoints mudarem |
| 4 | Testes de backend e ajustes de contrato | Testes de frontend e ajustes de integracao | Congelar contrato antes da validacao final |
| 5 | Documentacao backend | Documentacao frontend | Consolidar README em uma branch definida |

Regra operacional:

- Nao criar worktree extra para uma feature especifica.
- Nao criar worktree extra para agente especializado.
- Nao criar worktree extra para teste isolado.
- Quando uma frente precisar esperar a outra, usar mocks, contrato documentado ou
  commits pequenos na worktree correspondente.

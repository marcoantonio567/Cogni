# Regras de Negocio - Gerenciador de Estudos

## Status

Este documento e a referencia oficial de escopo e regras de negocio do projeto.

- Status atual: requisitos registrados, implementacao nao iniciada.
- Nao criar a aplicacao ate que haja uma solicitacao explicita para iniciar.
- Alteracoes nestas regras devem ser confirmadas antes de serem aplicadas.
- Em caso de ambiguidade durante a implementacao, preservar estas regras e solicitar
  uma decisao antes de mudar o comportamento definido.

## Objetivo

Criar uma aplicacao web completa em Django para gerenciamento de estudos,
seguindo exatamente a arquitetura, os padroes e as funcionalidades definidos
neste documento.

## Estrutura de Pastas Obrigatoria

```text
projeto_estudos/
|-- core/
|   |-- settings/
|   |   |-- base.py
|   |   |-- development.py
|   |   `-- production.py
|   `-- urls.py
|-- apps/
|   |-- estudos/
|   |   |-- models.py
|   |   |-- views.py
|   |   |-- services.py
|   |   `-- mixins.py
|   |-- accounts/
|   |   `-- autenticacao e perfil
|   `-- dashboard/
|       `-- graficos e estatisticas
|-- templates/
|   |-- base.html
|   `-- partials/
|-- static/
|   |-- css/
|   `-- js/
`-- requirements/
```

## Padroes de Design Obrigatorios

1. Usar Service Layer em `apps/estudos/services.py`, com a classe
   `ProgressoService`.
2. Criar os mixins `UserOwnershipMixin` e `ProgressoMixin`.
3. Usar HTMX nos checkboxes para atualizacao AJAX sem recarregar a pagina.
4. Manter campos denormalizados em `Categoria` e `Topico` para cache de
   progresso.
5. Usar SortableJS para reordenar topicos e subtopicos.

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
- `concluido`
- `ordem`
- `observacoes`

## Funcionalidades Obrigatorias

- CRUD completo para `Categoria`, `Topico` e `Subtopico`.
- Barra de progresso geral.
- Barra de progresso por categoria.
- Barra de progresso por topico.
- Dashboard com grafico semanal usando Chart.js.
- Isolamento por usuario: cada usuario pode visualizar e manipular apenas os
  proprios dados.

## Restricoes de Implementacao

- A estrutura de pastas e obrigatoria.
- Os padroes de design listados sao obrigatorios.
- O codigo final deve ser completo e organizado na estrutura definida.
- A entrega da implementacao deve incluir instrucoes de instalacao e execucao.
- Este documento nao autoriza o inicio da implementacao; ele apenas registra o
  escopo.

## Prompt Original

> Quero que voce crie uma aplicacao web completa em Django para gerenciamento
> de estudos, seguindo EXATAMENTE esta arquitetura:
>
> **Estrutura de pastas obrigatoria**
>
> `projeto_estudos/`, com `core/settings/base.py`, `development.py`,
> `production.py`, `core/urls.py`, os apps `estudos`, `accounts` e `dashboard`,
> alem de `templates`, `static` e `requirements`.
>
> **Padroes de design obrigatorios**
>
> 1. Service Layer: criar `apps/estudos/services.py` com classe
>    `ProgressoService`.
> 2. Mixins: criar `UserOwnershipMixin` e `ProgressoMixin`.
> 3. HTMX para checkboxes, com atualizacao AJAX sem recarregar.
> 4. Campos denormalizados em `Categoria` e `Topico` para cache de progresso.
> 5. SortableJS para reordenar topicos e subtopicos.
>
> **Modelos**
>
> - Categoria: nome, descricao, usuario, total_subtopicos,
>   subtopicos_concluidos e progresso_cache.
> - Topico: nome, categoria, ordem e usuario.
> - Subtopico: nome, topico, concluido, ordem e observacoes.
>
> **Funcionalidades**
>
> - CRUD completo para Categoria, Topico e Subtopico.
> - Barra de progresso geral, por categoria e por topico.
> - Dashboard com grafico semanal usando Chart.js.
> - Cada usuario ve apenas seus dados.
>
> Entregar o codigo completo, organizado exatamente nessa estrutura, com
> explicacoes de como executar.

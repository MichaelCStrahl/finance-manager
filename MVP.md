# Finance Manager — Documentação do MVP

App mobile React Native (Expo) para controle de receitas e despesas, **100% offline**, com banco de dados local.

Referência visual de inspiração: [DT Money (Figma Community)](https://www.figma.com/community/file/1138814493269096792/dt-money).

---

## 1. Objetivo do MVP

Permitir que o usuário registre, visualize, edite e exclua receitas e despesas no dispositivo, com visão mensal do saldo disponível, sem dependência de internet ou backend.

### Escopo incluso

- CRUD de receitas e despesas
- Recorrência personalizada (pontual, por N meses ou indeterminada)
- Categorias, tags e forma de pagamento em despesas (cartão, dinheiro, PIX, etc.)
- Comentários em receitas e despesas
- Resumo do mês atual (receitas − despesas = saldo)
- Cadastro via Bottom Sheet
- Persistência local com auditoria (`createdAt` / `updatedAt`)
- SQLite + Drizzle ORM (schema tipado e migrations)

### Fora do escopo (pós-MVP)

- Sincronização / nuvem / multi-dispositivo (ver §2.1)
- Autenticação
- Relatórios avançados e gráficos complexos
- Exportação (CSV/PDF)
- Orçamentos por categoria
- Notificações de cobrança
- Multi-moeda / conversão cambial

---

## 2. Stack sugerida

| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Framework | Expo + Expo Router | Projeto já iniciado com essa base |
| UI | React Native + Bottom Sheet (`@gorhom/bottom-sheet`) | Fluxo de cadastro pedido no MVP |
| Banco local | SQLite via `expo-sqlite` | Relacional, estável, adequado a somatórios e filtros por mês |
| ORM / schema | **Drizzle ORM** (`drizzle-orm` + driver `expo-sqlite`) | Schema tipado em TypeScript, queries type-safe, migrations versionadas |
| Validação | Zod (opcional) | Schemas claros para formulários |
| Datas | `date-fns` ou API nativa `Intl` | Associação mês/data e formatação |

Pacotes principais da camada de dados:

- `expo-sqlite`
- `drizzle-orm`
- `drizzle-kit` (dev) — gerar/aplicar migrations a partir do schema

> O Drizzle **não** substitui o SQLite: ele tipa e organiza o acesso. A UI / ViewModels não devem falar com o ORM diretamente — o acesso passa por contratos de repositório (ver §5 e §7).

### 2.1 Sync futuro (não implementar no MVP)

SQLite + Drizzle **não fazem sync**. Quando sync for necessário, manter essa base e acrescentar uma camada acima dos repositórios (engine tipo PowerSync/ElectricSQL, ou outbox + API própria).

Preparação mínima já coberta pelo MVP:

- IDs `UUID` (estáveis entre dispositivos)
- `createdAt` / `updatedAt` em todos os registros
- Escrita só via repositórios (ponto único para plugar sync depois)

Não trocar para WatermelonDB “por precaução” — só faria sentido numa reescrita sync-first.

---

## 3. Regras de negócio

### 3.1 Receitas

| Regra | Detalhe |
|-------|---------|
| Campos obrigatórios | Nome, valor, data (ou mês de associação) |
| Recorrência | Pontual, por N meses ou indeterminada (ver §3.4) |
| Comentários | Texto opcional para contextualizar a entrada |
| Exclusão | Deve ser possível deletar uma receita |
| Edição | Nome, valor, data, recorrência e comentário podem ser editados |
| Auditoria | `createdAt` imutável; `updatedAt` atualizado a cada alteração |

### 3.2 Despesas

| Regra | Detalhe |
|-------|---------|
| Campos obrigatórios | Nome, valor, data (ou mês), categoria, forma de pagamento |
| Recorrência | Pontual, por N meses (ex.: parcela no cartão) ou indeterminada (ex.: aluguel) |
| Categorias | Toda despesa pertence a uma categoria |
| Forma de pagamento | Toda despesa tem um meio: cartão, dinheiro, PIX, etc. |
| Tags | Tags prontas + tags cadastráveis pelo usuário |
| Comentários | Texto opcional para contextualizar o gasto |
| Somatório | Deve existir total de despesas (no mês exibido) |
| Exclusão | Deve ser possível deletar uma despesa |
| Edição | Nome, valor, data, recorrência, categoria, forma de pagamento, tags e comentário editáveis |
| Auditoria | Mesma regra de `createdAt` / `updatedAt` |

### 3.3 Datas e mês de referência

- Todo lançamento (receita ou despesa) possui uma **data de competência / início** (`occurredOn`).
- Em lançamentos pontuais, `occurredOn` é o mês em que o valor entra no resumo.
- Em lançamentos recorrentes (`fixed` / `indefinite`), `occurredOn` é o **mês de início da série**.
- O usuário pode informar uma data completa ou selecionar apenas o mês; nesse caso, persistir o **primeiro dia do mês** (ou a data escolhida no seletor) como `occurredOn`.
- `createdAt` e `updatedAt` são metadados do registro e **não** definem o mês financeiro.

### 3.4 Recorrência personalizada (MVP)

A mesma regra de recorrência vale para **receitas e despesas**. O campo existe nas duas tabelas (`incomes` e `expenses`) e o formulário do Bottom Sheet expõe as mesmas opções nos dois fluxos.

Exemplos:

| Tipo | Receita | Despesa |
|------|---------|---------|
| `once` | Freela pontual | Compra avulsa |
| `fixed` | Bônus parcelado em 3 meses | Parcela no cartão (3x) |
| `indefinite` | **Salário** | Aluguel, assinatura |

A recorrência **não** é só um flag binário. O usuário escolhe o comportamento ao criar/editar o lançamento:

| Tipo | Uso típico | Comportamento |
|------|------------|---------------|
| `once` | Freela, compra avulsa | Aparece **somente** no mês de `occurredOn` |
| `fixed` | Parcela / valor em N meses | Aparece em **N meses consecutivos** a partir de `occurredOn` |
| `indefinite` | Salário, aluguel, assinatura | Aparece em **todo mês ≥** `occurredOn`, sem data fim |

Campos no registro:

- `recurrenceType`: `once` \| `fixed` \| `indefinite`
- `recurrenceMonths`: `INTEGER` — **obrigatório** quando `fixed` (ex.: `3`); **sempre `NULL`** quando `once` ou `indefinite`
- `occurredOn`: data/mês de **início** (primeira competência)

#### Modelo de persistência: 1 registro template

Manter **um único registro** por lançamento lógico (receita ou despesa). A presença no mês visualizado é calculada na leitura — não materializar N linhas no insert.

Motivos:

1. Edição e exclusão continuam simples (um ID)
2. Parcela de 3 meses e aluguel indeterminado usam o **mesmo schema**
3. Somatório do mês usa a mesma regra de “ativo neste mês”

#### Regra: o lançamento está ativo no mês `YYYY-MM`?

Seja `start = mês de occurredOn` e `target = mês consultado`.

```
once:
  ativo ⇔ target === start

fixed:
  ativo ⇔ target >= start
       AND monthsBetween(start, target) < recurrenceMonths
  // ex.: start=2026-07, recurrenceMonths=3 → ativo em Jul, Ago, Set

indefinite:
  ativo ⇔ target >= start
```

Helper de domínio sugerido:

```ts
function isActiveInMonth(
  entry: { occurredOn: string; recurrenceType: RecurrenceType; recurrenceMonths: number | null },
  yearMonth: string, // YYYY-MM
): boolean
```

`listByMonth` / `sumByMonth` filtram com essa regra (em SQL ou em memória após `SELECT` dos candidatos com `substr(occurredOn,1,7) <= yearMonth`).

#### UX no formulário

1. Seletor de recorrência: **Sem recorrência** | **Por N meses** | **Indeterminada**
2. Se “Por N meses”: campo numérico `recurrenceMonths` (mín. 2; máx. sugerido 120)
3. Label de ajuda: “Ex.: salário / aluguel sem data fim” / “Ex.: 3 meses para parcela no cartão”
4. Na lista, badge opcional: `3x`, `recorrente`, ou omitir se `once`

#### Edição e exclusão

- Editar o template altera nome, valor, início, tipo/duração e demais campos para **todas** as competências futuras/cobertas pela regra.
- Deletar remove o template inteiro (some de todos os meses).
- Pós-MVP (não fazer agora): editar só uma ocorrência, pausar série, ou encerrar recorrência indeterminada com `endsOn`.

### 3.5 Saldo do mês

```
saldo = soma(receitas do mês) − soma(despesas do mês)
```

Valores sempre em centavos (inteiro) no banco para evitar erro de ponto flutuante; exibir formatado em BRL na UI.

---

## 4. Modelo de dados

Tabelas definidas no **schema Drizzle**. Abaixo, o modelo lógico equivalente.

### 4.1 Diagrama lógico

```
categories 1──* expenses *──* tags
                │         │
                │         └── expense_tags (N:N)
                │
payment_methods 1─┘

incomes (independente)
```

### 4.2 Tabelas

#### `categories`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL UNIQUE | Nome da categoria |
| color | TEXT NULL | Cor opcional para UI |
| isSystem | INTEGER NOT NULL DEFAULT 0 | 1 = seed do app |
| createdAt | TEXT NOT NULL | ISO-8601 |
| updatedAt | TEXT NOT NULL | ISO-8601 |

**Seeds sugeridos:** Moradia, Alimentação, Transporte, Saúde, Lazer, Educação, Outros.

#### `payment_methods`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL UNIQUE | Nome exibido (ex.: PIX) |
| slug | TEXT NOT NULL UNIQUE | Identificador estável: `card`, `cash`, `pix`, `transfer`, `other` |
| isSystem | INTEGER NOT NULL DEFAULT 0 | 1 = seed do app |
| createdAt | TEXT NOT NULL | ISO-8601 |
| updatedAt | TEXT NOT NULL | ISO-8601 |

**Seeds sugeridos:** Cartão (`card`), Dinheiro (`cash`), PIX (`pix`), Transferência (`transfer`), Outros (`other`).

#### `tags`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL UNIQUE | Nome da tag |
| isSystem | INTEGER NOT NULL DEFAULT 0 | 1 = seed do app |
| createdAt | TEXT NOT NULL | ISO-8601 |
| updatedAt | TEXT NOT NULL | ISO-8601 |

**Seeds sugeridos:** lazer, farmácia, mercado, assinatura, urgente, trabalho.

#### `incomes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | Ex.: Salário, Freela X |
| amountCents | INTEGER NOT NULL | Valor em centavos (> 0) |
| occurredOn | TEXT NOT NULL | Data de competência / início (YYYY-MM-DD) |
| recurrenceType | TEXT NOT NULL | `once` \| `fixed` \| `indefinite` |
| recurrenceMonths | INTEGER NULL | Nº de meses se `fixed`; NULL caso contrário |
| comment | TEXT NULL | Comentário livre |
| createdAt | TEXT NOT NULL | ISO-8601 (imutável) |
| updatedAt | TEXT NOT NULL | ISO-8601 (atualizado em edits) |

#### `expenses`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | Ex.: Aluguel, Uber |
| amountCents | INTEGER NOT NULL | Valor em centavos (> 0) |
| occurredOn | TEXT NOT NULL | Data de competência / início (YYYY-MM-DD) |
| recurrenceType | TEXT NOT NULL | `once` \| `fixed` \| `indefinite` |
| recurrenceMonths | INTEGER NULL | Nº de meses se `fixed`; NULL caso contrário |
| categoryId | TEXT NOT NULL FK → categories.id | Categoria |
| paymentMethodId | TEXT NOT NULL FK → payment_methods.id | Forma de pagamento |
| comment | TEXT NULL | Comentário livre |
| createdAt | TEXT NOT NULL | ISO-8601 (imutável) |
| updatedAt | TEXT NOT NULL | ISO-8601 (atualizado em edits) |

#### `expense_tags`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| expenseId | TEXT NOT NULL FK → expenses.id | |
| tagId | TEXT NOT NULL FK → tags.id | |
| PRIMARY KEY | (expenseId, tagId) | |

Com `ON DELETE CASCADE` em `expenseId` para limpar vínculos ao deletar despesa.

### 4.3 Tipos TypeScript (domínio)

```ts
type RecurrenceType = 'once' | 'fixed' | 'indefinite'

type Category = {
  id: string
  name: string
  color: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

type Tag = {
  id: string
  name: string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

type PaymentMethod = {
  id: string
  name: string
  slug: 'card' | 'cash' | 'pix' | 'transfer' | 'other' | string
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

type Income = {
  id: string
  name: string
  amountCents: number
  occurredOn: string // YYYY-MM-DD (início / competência)
  recurrenceType: RecurrenceType
  recurrenceMonths: number | null // obrigatório se fixed
  comment: string | null
  createdAt: string
  updatedAt: string
}

type Expense = {
  id: string
  name: string
  amountCents: number
  occurredOn: string
  recurrenceType: RecurrenceType
  recurrenceMonths: number | null
  categoryId: string
  paymentMethodId: string
  comment: string | null
  tagIds: string[]
  createdAt: string
  updatedAt: string
}

type MonthSummary = {
  yearMonth: string // YYYY-MM
  totalIncomeCents: number
  totalExpenseCents: number
  balanceCents: number // income - expense
}
```

---

## 5. Arquitetura e organização do projeto (TODO)

A organização de pastas e o detalhamento arquitetural **ainda serão documentados**. Por enquanto, apenas as intenções:

### TODO — App (MVVM)

- [ ] Documentar arquitetura **MVVM** no app (View / ViewModel / Model)
- [ ] Definir estrutura de pastas da UI, rotas (Expo Router) e ViewModels
- [ ] Documentar fluxo View → ViewModel → camada de dados

### TODO — Camada de dados (estilo back-end)

Separar lógica, setup e persistência de forma semelhante a um back-end (mesmo sem API remota), para facilitar implementação e testes. Inspiração: `application/` (contratos de repositório + use cases) e `infra/` (Drizzle/SQLite, seeds, migrations), com implementações in-memory para testes.

- [ ] Documentar camadas: contratos de repositório vs implementação Drizzle
- [ ] Documentar setup do banco (client, migrations, seeds)
- [ ] Documentar estratégia de testes (ex.: repositórios in-memory)
- [ ] Evoluir a estrutura conforme o projeto crescer — sem fixar pastas agora

> Até esses TODOs serem fechados, use as regras de negócio (§3), o modelo (§4) e os contratos (§7) como guia de implementação.

---

## 6. Telas e fluxos de UX

### 6.1 Home (mês atual)

Conteúdo mínimo:

1. **Header** com mês/ano atual (ex.: “Julho 2026”)
2. **Resumo**
   - Total de entradas (receitas)
   - Total de saídas (despesas)
   - Total disponível (saldo)
3. **Lista** de lançamentos do mês (receitas + despesas), ordenados por data desc
4. **FAB / botão “Nova transação”** que abre o Bottom Sheet

Inspiração DT Money: cards de resumo no topo + lista de transações abaixo, com distinção visual entre entrada (verde) e saída (vermelho/cinza).

### 6.2 Bottom Sheet — Nova transação

Fluxo:

1. Usuário toca em adicionar
2. Bottom Sheet abre
3. Toggle / tabs: **Receita** | **Despesa**
4. Campos comuns: nome, valor, data/mês, recorrência (once / fixed+N / indefinite), comentário (opcional)
5. Campos só de despesa: categoria, forma de pagamento, tags (multi-select)
6. Confirmar → persiste → fecha sheet → Home atualiza

### 6.3 Edição

- Toque em um item da lista abre o mesmo Bottom Sheet (modo edição) ou tela de detalhe simples.
- Campos editáveis: nome, valor, data de início, tipo/duração da recorrência e comentário; em despesas também categoria, forma de pagamento e tags.
- Ao salvar: atualizar campos + `updatedAt = now()`; **nunca** alterar `createdAt`.
- Alterar recorrência no template recalcula em quais meses o item aparece (não há linhas filhas para sincronizar).

### 6.4 Exclusão

- Ação de deletar no detalhe/edição (com confirmação simples).
- Remover registro e vínculos (`expense_tags`).

### 6.5 Forma de pagamento (MVP mínimo)

- Seletor obrigatório no formulário de despesa (seeds: Cartão, Dinheiro, PIX, Transferência, Outros).
- Pós-MVP: cadastrar novos meios de pagamento pelo usuário, se necessário.

### 6.6 Tags (MVP mínimo)

- Seleção de tags existentes no formulário de despesa.
- Opção “criar nova tag” inline (nome único).
- Tags system (seed) não precisam ser editáveis no MVP.

---

## 7. Contratos dos repositórios

Contratos da camada de dados (independentes de pasta/arquivo). A implementação concreta (Drizzle) e a organização `application` / `infra` ficam para o TODO do §5.

### `incomeRepository`

- `create(input)` → Income
- `update(id, input)` → Income
- `delete(id)` → void
- `listByMonth(yearMonth)` → Income[]
- `sumByMonth(yearMonth)` → number (cents)

### `expenseRepository`

- `create(input)` → Expense (inclui tags)
- `update(id, input)` → Expense
- `delete(id)` → void
- `listByMonth(yearMonth)` → Expense[]
- `sumByMonth(yearMonth)` → number (cents)

### `categoryRepository` / `tagRepository` / `paymentMethodRepository`

- `list()` — categorias, tags e formas de pagamento
- `create(name)` — tags e, se necessário, categorias custom (formas de pagamento: só seeds no MVP)

### Consulta de resumo

```ts
async function getMonthSummary(yearMonth: string): Promise<MonthSummary> {
  const totalIncomeCents = await incomeRepository.sumByMonth(yearMonth)
  const totalExpenseCents = await expenseRepository.sumByMonth(yearMonth)
  return {
    yearMonth,
    totalIncomeCents,
    totalExpenseCents,
    balanceCents: totalIncomeCents - totalExpenseCents,
  }
}
```

Filtro por mês: candidatos com início ≤ mês alvo, depois aplicar `isActiveInMonth` (ver §3.4).

Exemplo de pré-filtro SQL:

```sql
WHERE substr(occurredOn, 1, 7) <= ?  -- ex.: '2026-07'
```

A regra fina (`once` / `fixed` / `indefinite`) fica em helper de domínio (`isActiveInMonth`) ou em SQL equivalente com `recurrenceType` e `recurrenceMonths`.

---

## 8. Validações

| Campo | Regra |
|-------|-------|
| name | Obrigatório, trim, 1–80 chars |
| amount | Obrigatório, > 0 |
| occurredOn | Data válida ou mês válido (início da competência/série) |
| recurrenceType | `once`, `fixed` ou `indefinite` |
| recurrenceMonths | Obrigatório se `fixed`: inteiro entre 2 e 120; deve ser `null` se `once` ou `indefinite` |
| categoryId (despesa) | Obrigatório, deve existir |
| paymentMethodId (despesa) | Obrigatório, deve existir |
| tags | 0..N; IDs válidos |
| comment | Opcional, até 500 chars |

Erros de validação devem aparecer no formulário antes de persistir.

---

## 9. Diretrizes de UI (DT Money → mobile)

- Fundo escuro no header / área de destaque do resumo
- Cards de resumo: Entradas | Saídas | Total
- Lista com nome, data e valor; valor com sinal/cor conforme tipo
- Botão de nova transação em destaque
- Bottom Sheet com formulário limpo, sem cards desnecessários
- Tipografia legível; valores monetários com hierarquia clara

Paleta base sugerida (ajustar no tema):

| Token | Uso |
|-------|-----|
| `--bg` | Fundo da lista |
| `--header` | Header escuro |
| `--income` | Verde entradas |
| `--expense` | Vermelho saídas |
| `--total` | Destaque do saldo |
| `--shape` | Superfícies / sheet |

---

## 10. Inicialização do app

No boot do app (provider / root layout):

1. Abrir SQLite (`expo-sqlite`)
2. Instanciar o client Drizzle
3. Aplicar migrations pendentes (Drizzle migrator / `drizzle-kit`)
4. Seed de categories / tags / payment_methods se tabelas vazias
5. Só então renderizar a Home

Evitar race: a Home não consulta o banco antes do DB estar pronto.

> TODO: encaixar esse boot na organização MVVM + `infra` quando o §5 for documentado.

---

## 11. Critérios de aceite do MVP

- [ ] Usuário cria receita pontual, por N meses ou indeterminada, com comentário opcional
- [ ] Usuário cria despesa pontual, por N meses ou indeterminada, com categoria, forma de pagamento, tags e comentário opcional
- [ ] Parcela `fixed` de 3 meses aparece só nos 3 meses a partir do início
- [ ] Lançamento `indefinite` aparece em todo mês ≥ início
- [ ] Home mostra mês atual com totais de receitas, despesas e saldo
- [ ] Lista do mês reflete apenas lançamentos ativos naquele mês
- [ ] Edição altera nome/valor/data/recorrência (e campos de despesa) e atualiza `updatedAt`
- [ ] `createdAt` permanece inalterado após edição
- [ ] Exclusão remove receita ou despesa (some de todos os meses cobertos)
- [ ] Tags seed disponíveis; usuário pode cadastrar nova tag
- [ ] App funciona offline (sem rede)
- [ ] Cadastro feito via Bottom Sheet com escolha Receita/Despesa
- [ ] Persistência via SQLite + Drizzle (schema tipado + migrations)

---

## 12. Ordem de implementação sugerida

1. Setup SQLite + Drizzle (schema, migrations, client, seeds)
2. Contratos + implementação dos repositórios (CRUD + list/sum por mês)
3. Helper de recorrência (`isActiveInMonth`)
4. Home com resumo do mês + lista (via ViewModel quando MVVM estiver definido)
5. Bottom Sheet + formulário de receita (recorrência + comentário)
6. Formulário de despesa (categoria, forma de pagamento, tags, comentário + recorrência)
7. Edição e exclusão
8. Polimento visual alinhado ao DT Money
9. TODO §5: documentar pastas MVVM + camada de dados estilo back-end

---

## 13. Decisões em aberto (registrar antes de codar)

| Tema | Opções | Recomendação MVP |
|------|--------|------------------|
| Acesso ao SQLite | SQL cru vs Drizzle | **Drizzle** + repositórios |
| Arquitetura do app | — | **MVVM** (estrutura de pastas: TODO §5) |
| Camada de dados | Acoplada à UI vs estilo back-end | **Estilo back-end** (contratos + infra Drizzle; pastas: TODO §5) |
| Persistência da recorrência | Materializar N linhas vs 1 template | **1 template** + filtro por mês |
| Duração fixa | `endsOn` vs `recurrenceMonths` | **`recurrenceMonths`** (mais alinhado a “3x”) |
| Navegação de meses | Só mês atual vs setas mês anterior/próximo | Só mês atual; navegação depois |
| Soft delete | Hard delete vs `deletedAt` | Hard delete no MVP; revisitar se sync entrar |
| Categorias custom | Só seeds vs criar novas | Seeds + criar novas se der tempo |
| Unidade monetária | Float vs centavos | Centavos (`INTEGER`) |
| Editar só uma parcela | Afeta série toda vs ocorrência isolada | Série toda; ocorrência isolada pós-MVP |
| Sync | Embutir agora vs depois | **Depois** — SQLite + Drizzle permanecem; sync é camada extra |

---

## 14. Glossário

| Termo | Significado |
|-------|-------------|
| Competência | Mês/data a que o lançamento pertence financeiramente |
| Recorrência pontual (`once`) | Um único mês |
| Recorrência fixa (`fixed`) | N meses consecutivos a partir do início (ex.: parcela 3x) |
| Recorrência indeterminada (`indefinite`) | Todo mês a partir do início, sem fim (ex.: salário, aluguel) |
| Template | Único registro no banco que representa a série lógica |
| MVVM | Padrão View / ViewModel / Model (organização: TODO §5) |
| Drizzle | ORM leve sobre SQLite: schema tipado e migrations |
| Saldo | Receitas − Despesas no período |
| Forma de pagamento | Meio usado na despesa: cartão, dinheiro, PIX, transferência, etc. |
| Tag | Rótulo livre/adicional à categoria, para filtrar/contextualizar |

---

*Documento vivo do MVP — atualizar conforme decisões de produto forem fechadas.*
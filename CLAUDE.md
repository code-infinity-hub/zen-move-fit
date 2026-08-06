# CLAUDE.md — app/ (Frontend mobile)

> Reescrito a partir de leitura direta e verificada do código em `app/src/` (não inferido). Substitui a versão anterior, que descrevia um padrão de store já superado pelo código e citava bugs já corrigidos.

---

## Convenções de código — regras obrigatórias, não sugestões

Verificado por contagem direta no código (não é preferência, é o padrão real e deve ser seguido em todo código novo):

| Regra | Evidência |
|---|---|
| **Aspas duplas sempre** (`"..."`), nunca aspas simples | 348 ocorrências de `from "..."` contra 2 de `from '...'` — e as 2 exceções estão em `auto-imports.d.ts`, arquivo **auto-gerado** pelo `unplugin-auto-import`, não editado à mão. Zero exceção em código escrito por humano. |
| **Sempre arrow function**, nunca a palavra-chave `function` | Só 1 ocorrência de `function` em todo `src/` (`pages/Profile/index.vue:561`, `navigateToMessage`) contra centenas de arrow functions. Tratar como inconsistência isolada a corrigir quando esse arquivo for tocado, não como padrão válido. |
| **Sempre `const`**, `let` só quando a variável é reatribuída de verdade | 655 declarações `const` contra 28 `let` no nível de módulo/bloco. |
| **Sempre ponto e vírgula** no fim de `const`/`import`/`export`/statement | Padrão universal no código, inclusive em classes (`};` no fechamento) e em arrow functions atribuídas a `const` (`const x = () => {...};`). |
| **Indentação: 2 espaços** | Uniforme em `.ts` e `.vue` (script). No `<style lang="sass">`, a indentação também define a hierarquia do SASS indentado — ver seção "Estilização". |
| **Nomenclatura de arquivo**: `PascalCase.vue` pra componente/página, `kebab-case.ts` pra composable/service/util (`use-share-renderer.ts`, `running-metrics.service.ts`, `format-duration.ts`) | Consistente em `components/`, `composables/`, `services/`, `utils/`. |
| **Nomenclatura de variável/função**: sempre `camelCase`; tipos/interfaces sempre `PascalCase`; store Pinia sempre `useXxxStore` | Ex.: `useAccountsStore`, `ActivityDetail`, `formatDuration`. |
| **Import ordenado por convenção implícita**: libs externas primeiro, depois `@/` internos, comentário `/// COMPONENTS` antes de imports de componente quando há mais de um | Padrão visível em praticamente todo `.vue` com `<script setup>` (ex.: `ActivityShareFlow.vue`, `ShareCardChallenge.vue`). |
| **Sem comentário multi-linha/JSDoc** — comentário de uma linha só quando explica um *porquê* não óbvio, nunca o *o quê* | Mesmo padrão do `backend/CLAUDE.md`. Ver, por exemplo, os comentários curtos em `use-share-renderer.ts`/`use-share-prewarm.ts`. |
| **Sem linha vazia no final do arquivo** | Padrão de todos-os-projetos do autor, aplicado em todo `.ts`/`.vue` deste repo. |
| **Tag com múltiplos atributos: um por linha** (`<div class="..." :style="..." v-if="...">` vira 3 linhas + fechamento) | Padrão de todos-os-projetos do autor. Ao editar um template com 2+ atributos numa linha só, quebrar em uma linha por atributo. |
| **`:style` sempre como objeto dinâmico com bind, nunca string estática** (`:style="{ border: '1px solid red' }"`, nunca `style="border: 1px solid red;"`) | Padrão de todos-os-projetos do autor. |
| **Valores numéricos de prop sempre via bind** (`:size="20"`, nunca `size="20"`) | **Regra alvo, ainda não 100% seguida hoje.** Existem 294 usos corretos (`:size="..."`) contra pelo menos 9 exceções com string literal: `ActivityNearbyRunners.vue:26`, `Finish/TagPeople.vue:37,75`, `Share/ActivityShareFlow.vue:145,156`, `SubscriptionConversionSheet.vue:190`, `Chat.vue:22,135`, `Social/ActivityPostCard.vue:113`, `Social/CommentItem.vue:10`. Corrigir essas ocorrências quando o arquivo for tocado por outro motivo; não introduzir novas. |
| **Tag auto-fechada com espaço antes de `/>`** (`<img src="..." />`, nunca `<img src="..."/>`) | **100% seguido hoje** — 609 ocorrências com espaço, 0 sem. |
| **Assets: nunca em `public/`, sempre em `src/assets/`**, importados via `"@/assets/..."` | **Uma exceção legítima e deliberada existe**: `public/js/maplibre-gl.js` e `public/css/maplibre-gl.css` são a lib MapLibre GL vendorizada, carregada via `<script>`/`<link>` direto em `index.html` e consumida como global `window.maplibregl` (`map.service.ts:12`) — não dá pra importar essa lib pelo pipeline do Vite/`@/assets` porque ela precisa existir como script global antes do bundle da app rodar. Qualquer asset novo (imagem, ícone, fonte) vai em `src/assets/`, sem exceção — a exceção acima é só pra essa lib de terceiro. |

**Regra geral pra este documento**: toda seção abaixo que descreve um padrão observado é, por definição, uma regra a seguir — não uma observação neutra. Se o código divergir do que está documentado aqui, ou o código está errado (corrigir) ou o documento está desatualizado (atualizar o documento no mesmo commit da mudança que o invalidou). Nunca deixar os dois lados dessa relação divergirem em silêncio — foi exatamente isso que aconteceu com a versão anterior deste arquivo.

### Estrutura de um arquivo `.vue`

Ordem sempre: **template → script → style**. Nunca inverter, nunca intercalar.

```vue
<template>
  <!-- conteúdo -->
</template>

<script lang="ts" setup>
// lógica
</script>

<style lang="sass" scoped>
// estilo
</style>
```

### Estrutura interna do `<script setup>`

Ordem fixa, cada bloco introduzido por um comentário de seção em maiúsculas (confirmado: **170 arquivos** já usam exatamente esse padrão de comentário `/// DATA` etc. — não é uma regra nova, é a formalização de um padrão já real e maioritário):

1. `/// DATA` — imports (libs externas, depois `@/`), `ref`/`const`/`let`/`reactive`
2. `/// COMPUTED` — `computed(...)`
3. `/// WATCH` — `watch(...)`/`watchEffect(...)`
4. `/// LIFE CYCLES` — `onMounted`, `onBeforeUnmount`, etc.
5. `/// METHODS` — funções/handlers

```typescript
<script lang="ts" setup>
import validator from "validator";

/// DATA
const tab = ref(0);

/// COMPUTED
const tabs = computed(() => [1, 2, 3]);

/// WATCH
watch(tab, (val) => {

});

/// LIFE CYCLES
onMounted(() => {

});

/// METHODS
const send = async () => {

};
</script>
```

Componentes muito pequenos (poucas linhas, um ou dois blocos) podem omitir os comentários de seção que ficariam vazios — mas a **ordem** relativa (data → computed → watch → life cycles → methods) é sempre respeitada, com ou sem comentário.

---

## Stack exata

| Tecnologia | Versão |
|---|---|
| Vue | 3.5.21 |
| Vuetify | 3.10.1 |
| Pinia | 3.0.3 |
| Vue Router | 4.5.1 |
| TypeScript | 5.9.2 |
| Vite | 7.1.5 |
| Capacitor | 8.3.4 (Android/iOS/Core) |
| html2canvas | 1.4.1 |
| maplibre-gl | 5.20.1 |
| dayjs | 1.11.20 |
| uuid | 13.0.0 |
| mitt | 3.0.1 |
| @capacitor-community/sqlite | 8.1.0 |
| socket.io-client | 4.8.3 |
| pixi.js | 8.16.0 (tela de conclusão de atividade) |
| chart.js / vue-chartjs | 4.5.1 / 5.3.3 |

Plugins de build: `unplugin-auto-import`, `unplugin-vue-components`, `unplugin-vue-router` (instalado mas **não** usado pra geração automática de rotas — ver seção Roteamento), `vite-plugin-vue-layouts-next`, `vite-plugin-vuetify`.

---

## Estrutura de diretórios

```
app/
  src/
    components/       # Componentes compartilhados (Activity/, Social/, Forms/, Equipment/, Permissions/, Subscription/, soltos na raiz)
    composables/       # Composables reutilizáveis (barrel em index.ts)
    json/              # Dados estáticos (categorias, metas, estilos de mapa, etc.)
    locales/           # Traduções pt/en (exportadas via index.ts) — 1634 chaves cada, paridade 100% confirmada
    mobile/             # Barrel de plugins Capacitor
    pages/             # Páginas de rota (uma pasta por rota, cada uma com routes.ts)
    plugins/           # Fetcher, vuetify, usePersistentSession, index
    router/            # index.ts + routes.ts (concatena rotas manuais de cada página)
    services/          # Lógica de domínio não-Vue (GPS, mapa, socket, sqlite, pagamento — ver seção própria)
    stores/             # 22 stores Pinia (Options API)
    styles/            # global.sass (única fonte de utilitários globais)
    types/              # Tipos TypeScript, um arquivo por domínio + global.type.ts
    utils/              # Funções puras (formatação, data, duração, percentual)
    App.vue
    eventBus.ts
    main.ts
```

---

## Vite & Auto-imports

**`vite.config.mts`** define os auto-imports:

```typescript
AutoImport({
  imports: [
    "vue",                    // ref, computed, watch, onMounted, onBeforeUnmount, nextTick...
    VueRouterAutoImports,     // useRouter, useRoute
    { pinia: ["defineStore", "storeToRefs"] }
  ],
  vueTemplate: true
})

Components({ resolvers: [MotionResolver()] })  // + src/components/** auto-registrado por pasta

Vuetify({ styles: { configFile: "src/styles/global.sass" } })

VueRouter({ dts: false })   // instalado só pelos auto-imports de useRouter/useRoute — não gera rotas por convenção de pasta
Layouts()                  // vite-plugin-vue-layouts-next, consumido via setupLayouts() em router/index.ts

// Dev server: porta 8081 (confirmar no vite.config.mts se for alterar)
```

**Confirmado por teste real nesta sessão**: `ref`, `computed`, `watch`, `onMounted`, `onBeforeUnmount` funcionam sem import em **qualquer** `.ts`, não só em `.vue` — o auto-import cobre composables também (ex.: `use-animated-number.ts` usa `ref`/`watch`/`onBeforeUnmount` sem nenhum import).

**O que NÃO é auto-importado e exige import manual:**
- Stores Pinia (`import { useXxxStore } from "@/stores/xxx"`)
- Types/interfaces TypeScript
- `useLocale` do Vuetify
- Composables locais (quando importados fora do barrel `@/composables`, ex. `import { useShareRenderer } from "@/composables/use-share-renderer"`)
- `mitt`, `dayjs`, `uuid`, `html2canvas`, `maplibre-gl`
- Plugins externos não listados no AutoImport

---

## Alias e caminhos

- `@` → `src/`
- Todos os Capacitor plugins importados via `@/mobile` (barrel) — **nunca diretamente** do pacote npm

---

## HTTP Client — Fetcher

**Único cliente HTTP do projeto:** `src/plugins/Fetcher.ts`. Exporta 5 coisas:

```typescript
// 1. Fetcher bruto — usado só dentro do próprio arquivo e por _GET/_POST/_PATCH/_DELETE.
//    Três exceções conhecidas no código que chamam Fetcher bruto direto de fora do plugin
//    (TagPeople.vue, ActivityShareFlow.vue, services/attestation.service.ts) — nesses pontos,
//    erro de rede NÃO aparece pro usuário via feedbackStore, porque pulam o wrapper abaixo.
//    Em attestation.service.ts isso é deliberado (não um engano como nos outros dois): as
//    chamadas a "attestation/challenge"/"attestation/register" rodam em background (boot do
//    app, antes de login/pagamento) e uma falha ali é só um sinal a menos pro backend, nunca
//    um erro que o usuário precise ver.
export const Fetcher = async (url: string, options: Options, isRetry = false): Promise<Response> => {
  // 1. Checa "internet-connection" via Preferences (Capacitor) — se OFFLINE, emite
  //    eventBus "MESSAGE_NO_INTERNET_CONNECTION" e retorna { status: 500, error: true } sem nem tentar.
  // 2. Checa checkAvailability() (arquivo app-availability.json no CloudFront) — se indisponível,
  //    emite "MAINTENANCE_MODE" e retorna { status: 503, error: true, maintenance: true }.
  // 3. Monta headers: Content-Type, Accept-Language, Authorization: Bearer <token>,
  //    x-client-url (rota atual), x-application: "1", platform, x-application-notification (se houver).
  // 4. Usa CapacitorHttp.request() — não axios, não fetch nativo.
  // 5. Se status 401 e code === "TOKEN_EXPIRED" (e não for retry): tenta renovar via
  //    /accounts/refresh-token; se conseguir, refaz a chamada original (isRetry=true);
  //    se não conseguir, emite "SESSION_EXPIRED".
  //    IMPORTANTE: qualquer outro motivo de 401 (token inválido/revogado sem esse code
  //    específico) NÃO desloga nem renova — a chamada só falha silenciosamente.
  // 6. error = !successStatuses.includes(status); successStatuses = [200, 201].
  // 7. Falha de rede (catch): { status: 500, error: true, server_error: true }.
}

// 2-5. Wrappers — TODA action de store deve usar um destes, nunca o Fetcher bruto:
export const _GET = async (url: string): Promise<Response> => { ... feedbackStore.populate(...) ... }
export const _POST = async (url: string, body = {}): Promise<Response> => { ... }
export const _PATCH = async (url: string, body = {}): Promise<Response> => { ... }
export const _DELETE = async (url: string, body = {}): Promise<Response> => { ... }
// Os 4 sempre chamam feedbackStore.populate({ error, ...json }) e retornam { error, ...json },
// SUCESSO OU ERRO — é assim que o snackbar de erro aparece globalmente, sem tratamento manual em cada tela.
```

**Exceção documentada:** `src/stores/app.ts` usa `fetch` nativo para consulta de CEP à API ViaCEP externa — único uso de `fetch` fora do Fetcher.

**`Options`/`_POST`/`_PATCH` aceitam um `headers` opcional** (`Record<string, string>`), mesclado por cima dos headers padrão dentro do próprio `Fetcher`. Hoje o único consumidor é `attestationService.getAssertionHeaders()` (ver seção "Device Attestation" abaixo) — chamado nos pontos que batem em `POST /accounts`, `POST /accounts/authenticate`, `POST /accounts/password`, `PATCH /accounts/:_id/password`, `POST /subscriptions` e `POST /purchase-of-credits`.

---

## Stores (Pinia) — 22 no total

### Padrão obrigatório (confirmado em `notifications.ts`, `accounts.ts`, `social.ts` e replicado nos outros 19)

```typescript
import pinia from "./";
import { defineStore, setActivePinia } from "pinia";
import { _GET, _POST, _PATCH, _DELETE } from "@/plugins/Fetcher";
import { type Response } from "@/types/global.type";

setActivePinia(pinia);                             // obrigatório — fora do componente, nível do módulo

export const useXxxStore = defineStore("xxx", {   // SEMPRE Options API — nunca Composition API
  state: () => ({ ... }),
  actions: {
    async GET(url: string = ""): Promise<Response> {
      return await _GET(`xxx/${url}`);
    },
    async POST(url: string = "", body: Record<string, any> = {}): Promise<Response> {
      return await _POST(`xxx/${url}`, body);
    },
    // domínio-específico chama this.GET/this.POST/this.PATCH/this.DELETE por cima
  }
});
```

`feedbackStore.populate()` **não** é chamado manualmente pelas actions — já acontece dentro de `_GET/_POST/_PATCH/_DELETE` do Fetcher. Não duplicar essa chamada numa action.

### As 22 stores

`accounts`, `activities`, `analytics`, `app`, `challenges`, `daily-quests`, `equipments`, `feedback`, `leagues`, `notifications`, `offers`, `plans`, `progress-photos`, `prs`, `purchase-of-credits`, `reward-chests`, `social`, `subscriptions`, `weight-evolutions`, `workouts`, `zenas`, mais `index.ts` (exporta a instância `pinia`).

- **~10 delas são puro CRUD boilerplate** (`equipments`, `prs`, `weight-evolutions`, `zenas`, `plans`, `progress-photos`, `purchase-of-credits`, `challenges`, `workouts`, `subscriptions`) — só repassam `GET/POST/PATCH/DELETE` pros wrappers, sem lógica própria. Ao criar uma store nova para um domínio simples, copiar uma dessas como base.
- `social.ts` (~620 linhas) concentra friends + chats + posts + comments + replies com atualização otimista — é a store mais "gorda"; se crescer mais, considerar dividir por sub-domínio.
- `app.ts` guarda estado geral do app e é a única store com `fetch` nativo (ViaCEP).

### Paginação com Map

```typescript
state: () => ({
  items: {
    page: 0,
    pages: 0,
    total: 0,
    results: new Map<string, T>()
  }
})
// Nunca arrays simples para coleções paginadas — sempre Map<string, T>
```

### Atualização otimista (spread para reatividade)

```typescript
const item = this.items.results.get(id);
if (item) {
  item.some_field = newValue;
  this.items.results.set(id, { ...item });  // spread obrigatório pra reatividade do Map
}
```
`social.ts` reverte reações/saves corretamente com snapshot em caso de erro — usar como referência pra qualquer atualização otimista nova.

---

## Camada `services/` — lógica de domínio fora do Vue

11 arquivos, não são composables (sem `ref`/`computed` de Vue na maioria), são classes/funções puras que encapsulam device/domínio:

| Arquivo | Responsabilidade |
|---|---|
| `running-metrics.service.ts` | ~660 linhas — pipeline de tracking: filtro Kalman de GPS, confiança de ponto, MET por categoria, splits, buffer de persistência SQLite. É o coração do rastreamento de atividade. |
| `kalman.filter.ts` | Filtro de Kalman puro usado pelo `running-metrics.service.ts` — único arquivo do grupo sem sufixo `.service` (inconsistência de nome conhecida). |
| `geolocation.service.ts` | Wrapper de geolocalização Capacitor. Erros (permissão negada, GPS off) são engolidos e caem em fallback `{lat:0,lng:0}` — hoje isso nunca é atingido na prática porque a tela de tracking (`Creation/Progress.vue`) só chama depois de confirmar permissão concedida via `PermissionGeolocation` (bottom sheet dedicado). |
| `map.service.ts` | Wrapper do MapLibre GL. `destroy()` chama `this.map?.remove()` e `this.emitter.clear()` (corrigido nesta sessão — antes só desligava um listener do eventBus, vazando contexto WebGL a cada saída da tela de tracking). |
| `sqlite.service.ts` | Singleton via `static instance = new SqliteService()` — **qualquer** `new SqliteService()` em qualquer lugar do código opera sobre o mesmo estado compartilhado, porque todo método interno referencia `SqliteService.instance.xxx`, nunca `this.xxx` puro (exceto o getter `database`, que é código morto — nunca chamado em lugar nenhum). Não há risco de acesso concorrente real: os `close()` só rodam depois de `await` sequenciais na mesma cadeia de fluxo. |
| `event-emitter.service.ts` | Emissor de evento genérico (`on/once/off/emit/clear`) usado pelo `map.service.ts`. `emit(event, payload, { once: true })` faz o evento "tocado uma vez" ser replayado pra quem assinar depois — mas só se `once: true` for passado no emit. |
| `media.service.ts` | Câmera/galeria. Tratamento de erro de câmera padronizado num único formato `{message, code}` — os outros services do grupo não seguem esse padrão (cada um decide sozinho como reportar erro; não existe convenção única na camada `services/`). |
| `workout.service.ts` | Cálculo de calorias por fator de peso/MET. `weight/70` sem guarda contra peso zero — inofensivo hoje porque peso é campo obrigatório `>0` tanto no cadastro (`Login/Step3.vue`) quanto na edição (`Settings/Plan.vue`). |
| `socket.service.ts` | Cliente Socket.IO. Reconecta automaticamente (até 10 tentativas, 1s de intervalo). |
| `sensors.service.ts` | Acelerômetro/pedômetro via eventBus. |
| `credit-card-payment.service.ts` | Tokenização de cartão **direto na API da Pagar.me** (não passa pelo backend — correto por PCI compliance). Se a tokenização falhar (cartão recusado, rede caiu), devolve `""` silenciosamente; o `credit_card` completo (número, cvv, validade) também é enviado ao backend junto do token no mesmo `POST`, então o backend valida e rejeita com mensagem própria — o erro específico da Pagar.me (ex.: "CVV inválido") se perde, mas o usuário não fica sem feedback nenhum. |
| `attestation.service.ts` | Device attestation (`@capgo/capacitor-app-attest` — Apple App Attest no iOS, Google Play Integrity Standard no Android), verificado pelo backend só quando `NODE_ENV=production`. `App.vue` chama `ensureKey()` (fire-and-forget) no `onMounted` pra já deixar o dispositivo registrado antes do usuário chegar em login/cadastro/pagamento. `ensureKey()`: pega `keyId` via `AppAttest.getStoredKeyId()` (persistido nativamente) ou `prepare()` se não existir; registra no backend (`POST attestation/challenge` + `AppAttest.createAttestation` + `POST attestation/register`) só se esse `keyId` ainda não foi registrado — guardado em `Preferences` (`attestation-registered-key-id`), porque o App Attest da Apple só permite uma attestation por key na vida inteira. `getAssertionHeaders()`: pega um novo challenge, chama `AppAttest.createAssertion`, devolve os 4 headers (`x-attestation-platform/key-id/challenge/token`) que os call sites passam pro 3º parâmetro de `_POST`/`_PATCH`. Qualquer falha (device não suportado, offline, etc.) devolve `{ }`/`null` silenciosamente — nunca lança erro pro fluxo de login/pagamento continuar bloqueado por causa disso. |

---

## Fluxo de compartilhamento de cards (`components/Activity/Share/`)

- **`ActivityShareFlow.vue`** orquestra: ao montar, dispara em paralelo `resolveImages()` (proxy de imagens CDN via backend, `POST /share/images/resolve`, pra evitar CORS taint no html2canvas), fetch de rota GPS, `ensureFontsReady()` e `prewarm()` (aquecimento do html2canvas — ver `use-share-renderer.ts`).
- **`use-share-prewarm.ts`** (novo nesta sessão): permite adiantar esse aquecimento assim que a tela de detalhe da atividade (`pages/Activity/index.vue`) carrega — via `requestIdleCallback` (fallback `setTimeout`), só quando a conta é dona ou tem marcação aprovada na atividade. Cancelado no `onBeforeUnmount` da página. Isso faz o primeiro card do fluxo de compartilhamento gerar quase instantâneo, porque o custo já foi pago em background enquanto o usuário olhava a tela.
- **`use-share-renderer.ts`**: cache de renderização por `activityId:templateId:format` (`renderCache`, máx. 20 entradas), e cache de fonte/warm-up memoizados **pra sessão inteira do app** (rodam no máximo uma vez).
- **`use-share-image-proxy.ts`**: cache de imagem resolvida por URL (máx. 200, LRU), evita repetir o proxy pro backend se a mesma imagem já foi resolvida.
- **`components/Activity/Share/cards/`**: 41 componentes `ShareCard*.vue`. Desde esta sessão:
  - **`ShareCardFooter.vue`** — rodapé padrão (avatar + nome + marca), extraído da duplicação que existia em ~25 arquivos.
  - **`composables/use-share-card-identity.ts`** — os 4 computeds (`cardStyle`, `initials`, `avatarSrc`, `dateLabel`) que também estavam duplicados, agora num único lugar.
  - **5 cards ficaram de fora da migração de propósito** (`ShareCardEquipment`, `ShareCardMap`, `ShareCardPhoto`, `ShareCardRecovery`, `ShareCardSummary`) — têm rodapé visualmente diferente (sem borda superior, cor via CSS var `--sc-accent`, ou avatar maior no caso do Summary). Só os 4 computeds foram unificados nesses; o markup/estilo do rodapé continua local.
  - **13 componentes `ShareCardTransparent*`** são uma família visual à parte (fundo de foto/mapa, sem header/footer/glow padrão) — nunca tiveram a duplicação em questão, não confundir com os 28 "standard".
  - `ShareCardBrand.vue` e `ShareRouteLineSvg.vue` são utilitários sem o padrão de frame, não contam nos grupos acima.

---

## Estilização — SASS Indented Syntax

**O preprocessador é SASS indented syntax — não SCSS.**
- Sem `{}` nem `;`
- Arquivo global: `src/styles/global.sass`
- Nos componentes Vue: `<style lang="sass" scoped>` (ou sem `scoped` em `App.vue`)

```sass
// CORRETO — SASS indented syntax:
.minha-classe
  display: flex
  align-items: center
  color: var(--primary)
```

**Inconsistência conhecida**: nenhuma pendente — `CommentItem.vue` (única exceção histórica) já usa `<style lang="sass" scoped>` corretamente.

### Utilitários globais definidos em `global.sass`

| Classe | Efeito |
|---|---|
| `.bg-theme-primary-15` | background primary com 15% opacidade |
| `.bg-theme-primary-background-10` | background com 10% opacidade |
| `.bg-theme-background-80` | background com 80% opacidade |
| `.bg-theme-tertiary-40` | tertiary com 40% opacidade |
| `.size-2rem` … `.size-11rem` | width + height fixos (2rem a 11rem) |
| `.viewer-button` | estilo de botão de viewer |
| `.viewer-footer` | footer de viewer |
| `.border-sextet` | `border: 1px solid var(--sextet) !important` |
| `.border-tertiary` | `border: 1px solid var(--tertiary) !important` |
| `.border-top-tertiary` / `.border-bottom-tertiary` | borda superior/inferior com tertiary |
| `.heading` | padding: `var(--top-saved) 0.7rem 0.5rem 0.7rem !important` |
| `.footering` | padding/margin de footer |
| `.background` | background padrão |
| `.font-space-grotesk` | `font-family: 'Space Grotesk'` |

---

## Paleta de cores (Vuetify + CSS vars)

Definida em `src/plugins/vuetify.ts`. Injetada como CSS variables via `document.documentElement.style.setProperty`.

| Nome (Vuetify + CSS var) | Hex |
|---|---|
| `primary` / `--primary` | `#48F26D` |
| `secondary` / `--secondary` | `#0E1115` |
| `tertiary` / `--tertiary` | `#22272F` |
| `quaternary` / `--quaternary` | `#E6FFE9` |
| `quintet` / `--quintet` | `#15181E` |
| `sextet` / `--sextet` | `#272C3480` |
| `yellow` / `--yellow` | `#FFEB3B` |
| `blue` / `--blue` | `#3B82F6` |
| `orange` / `--orange` | `#FF9800` |
| `red` / `--red` | `#F44336` |
| `green` / `--green` | `#4CAF50` |
| `map_background` / `--map_background` | `#0D0D0D` |

Locale: `navigator.language.split("-")[0]`, fallback `"pt"`. Nenhum `defaults` de componente configurado no Vuetify.

**Nota**: existe uma flag `isGym = Boolean(Number(import.meta.env.VITE_GYM))` com um bloco `if (isGym) { }` **vazio** em `vuetify.ts` — infraestrutura para um tema/config de academia parceira que nunca foi implementada. Não remover sem confirmar se ainda é planejada.

---

## Roteamento

**Realidade confirmada (a versão anterior deste doc estava errada em 2 pontos):**

- `router/index.ts` usa **`createWebHistory`** (não `createWebHashHistory`).
- `unplugin-vue-router` está instalado e configurado no `vite.config.mts`, mas **não é usado pra geração automática de rotas por convenção de pasta** — serve só para os auto-imports (`useRouter`/`useRoute` sem import manual). As rotas continuam 100% declaradas manualmente.

### Estrutura de rotas (`src/router/routes.ts`)

Cada módulo de página exporta um array de rotas, sem `meta`, sem `children`, sem guard por rota:

```typescript
export const Dashboard = [
  { name: "dashboard", path: "/dashboard", component: () => import("./index.vue") }
];
```

`router/routes.ts` importa e concatena os 15 módulos (`Activity`, `AiCoach`, `Challenge`, `Dashboard`, `Equipments`, `League`, `Loading`, `Login`, `Maintenance`, `NoConnection`, `Profile`, `ReferAndEarn`, `Settings`, `Subscription`, `Training`).

### `src/router/index.ts`

```typescript
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes as any),   // vite-plugin-vue-layouts-next
});
```
Tem também um handler de `router.onError` pra recarregar a página uma vez se um chunk dinâmico falhar ao importar (erro comum após deploy com cache de asset velho).

### Regras de rota (padrão de todos-os-projetos do autor, já seguido aqui)

- **Path sempre em kebab-case e inglês** (`/refer-and-earn`, não `/indique-e-ganhe`) — confirmado nos módulos de rota existentes.
- **Navegação sempre por `name`, nunca por `path` literal**:
  ```typescript
  // Correto
  router.push({ name: "activity-detail", params: { id } });
  // Errado
  router.push("/activity/123");
  ```
- **Sem `meta`** — já coberto na regra absoluta #9 no final deste documento.

---

## Componentes (padrões observados)

### Script setup
**Todos os componentes** usam `<script setup lang="ts">` — nunca Options API, nunca `<script>` sem setup.

### Props em `<script setup>` ficam disponíveis no template automaticamente
`const props = defineProps<T>()` expõe cada prop declarada como identificador solto no `<template>` (ex.: `activity.workout_title` funciona direto, sem `props.`), **além** de `props.x` continuar disponível no `<script>`. Isso é comportamento padrão do compilador do Vue desde `<script setup>`, não uma convenção deste projeto — mas vale saber, porque os cards de compartilhamento (e boa parte do app) dependem disso.

### `defineEmits` — inconsistente
34 componentes usam a forma não tipada `defineEmits(["evento"])`; só 7 usam a forma tipada `defineEmits<{...}>()`. `defineProps`, em contraste, é 100% tipado em todo componente com props. Preferir a forma tipada em código novo.

### Header de página com botão voltar — padrão repetido, nunca extraído
O bloco de header com `v-btn` de voltar + `eventBus.on("BACK_BUTTON", back)`/`off` no `onMounted`/`onBeforeUnmount` se repete em ~19 páginas/componentes, sempre copiado manualmente. Candidato a `PageHeader.vue` + `useBackButton()`, ainda não feito.

### Long-press — reimplementado em pelo menos 4 lugares
`AiCoach/index.vue`, `Dashboard/Progress/Prs.vue`, `Chat.vue`, `Social/PostCard.vue` — cada um com seu próprio `touchstart`/`touchend` + `setTimeout`/`clearTimeout`. Candidato a `use-long-press.ts`.

### Focus via classe UUID (CommentItem)
```typescript
const textClass = ref(v4().replace(/[-]/g, ""));
// No template: :class="['flex-fill', textClass]"
nextTick(() => {
  (document.querySelector(`.${textClass.value} textarea`) as HTMLTextAreaElement)?.focus();
});
```

### `ProfileImage.vue`
Props: `width`, `height`, `size` (default `"72px"`), `image`, `loadedBorder` (default `"primary"`), `fontSize` (default `45`), `name` (obrigatório). Mostra inicial do nome sem imagem. Usa `containerType: 'inline-size'` pra `cqw` no fontSize. `<style lang="sass">` sem scoped.

### Componentes "god object" — não decompostos
8 arquivos passam de 1000 linhas, alguns 1500+: `Dashboard/Progress/Nutrition.vue` (1610), `Activity/Creation/Progress.vue` (1558), `Activity/Finish/index.vue` (1462), `Dashboard/Account/index.vue` (1372), `AiCoach/index.vue` (1315), `Training/index.vue` (1299), `Challenge/index.vue` (1260), `Activity/index.vue` (1161+). Comparar com os ~28 `ShareCard*.vue` (240-500 linhas, um por template) ou `Settings`/`Equipment`/`League` (130-330 linhas) mostra que a decomposição não é uniforme — onde teve cuidado (Share cards), ficou ótimo; nas telas de fluxo/dashboard, virou monólito. Ao tocar nesses arquivos, considerar quebrar em subcomponentes antes de adicionar mais lógica.

### `Activity/Share/cards/*.vue`
Ver seção própria "Fluxo de compartilhamento de cards" acima.

---

## Composables

Barrel em `src/composables/index.ts` — sempre exportar novo composable ali.

| Composable | Responsabilidade |
|---|---|
| `use-form.ts` | `rules` de validação (`required`, `email`, `min_length_pasword` — typo intencional, não corrigir sem refatoração completa, `past_date`, `future_date`, `document`, `phone`, `zipcode`) |
| `use-currency.ts` / `use-format-number.ts` | Formatação de moeda/número — **100% centralizado**, nenhum lugar do app reimplementa `toLocaleString` por conta própria (ponto forte de DRY confirmado). |
| `use-share-*.ts` | Ver seção "Fluxo de compartilhamento de cards" |
| `use-fit-text.ts` | Auto-ajuste de tamanho de fonte pra caber num container (usado nos cards de insight/quote) |
| `use-mention-input.ts` | Autocomplete de menção em post/comentário — sem guarda de staleness contra resposta de rede fora de ordem (edge case raro, não corrigido) |
| `use-pull-to-refresh.ts` | Pull-to-refresh manual |
| `use-logout.ts` | Fluxo de logout |
| `use-web-view.ts` | Utilidades de WebView |
| `use-animated-number.ts` | Anima transição de um número (`ref` + `requestAnimationFrame`) |
| `use-celebration.ts` / `use-game-sounds.ts` / `use-reaction-sound.ts` | Feedback de gamificação (confete, som) |
| `use-copy.ts` | Copiar texto pra área de transferência |

Fora do barrel (uso local): `use-media.ts`, `use-permissions.ts`, `use-subscription.ts`, `use-map.ts`, `use-persistent-session.ts` (este último em `plugins/`, não `composables/`).

---

## Internacionalização

**Sistema: Vuetify locale — NÃO vue-i18n.**

```typescript
import { useLocale } from "vuetify";
const { t } = useLocale();
t("$vuetify.label.xxx")
t("$vuetify.message.yyy")
```

`src/locales/pt.ts` e `en.ts` — **1634 chaves cada, paridade 100% confirmada por comparação estrutural** (29 seções top-level, todas com contagem idêntica dos dois lados). Único risco de chave faltando encontrado e corrigido nesta sessão foi um caso isolado, não sistêmico.

---

## Tipos TypeScript

Um arquivo por domínio em `src/types/`: `account.type.ts`, `activity.type.ts`, `challenge.type.ts`, `equipment.type.ts`, `notification.type.ts`, `offer.type.ts`, `plan.type.ts`, `pr.type.ts`, `progress-photo.type.ts`, `purchase-of-credits.type.ts`, `share.type.ts`, `social.type.ts`, `subscription.type.ts`, `weight-evolution.type.ts`, `workout.type.ts`, mais `global.type.ts`.

**`global.type.ts` é um catch-all maior do que deveria** — reúne League, Reward Chests, Zena/AI, Share (`ShareCardProps`, `ShareTemplateDef`), Map/Point, Response/Options de HTTP, unions de Workout, sem relação direta entre si. Dado que o projeto já separa outros domínios em arquivo próprio, extrair pelo menos `league.type.ts` e `reward.type.ts` seria consistente com o resto — não feito ainda.

**Duplicação confirmada**: `ShareFormat` é declarado idêntico em `global.type.ts` **e** `share.type.ts`; código diferente importa de fontes diferentes (`utils/share-renderer.ts` de um, `composables/use-share-renderer.ts` de outro, que reexporta do `global.type.ts`). Funciona porque são idênticos hoje — editar um sem o outro quebraria silenciosamente.

**Evitar `any`** — só usar quando não há outro caminho (ex.: interop com lib externa sem tipos). Resposta de API/domínio sempre ganha um `interface`/`type` no arquivo de domínio correspondente em `types/`, nunca `any` solto num componente.

---

## Formatação de números

**Padrão de todos-os-projetos do autor** (a forma canônica é um util em `src/utils/format-number.ts` usando `toLocaleString` direto):

```typescript
// Decimal — "20.90" → "20,90"
export const formatDecimal = (value: number): string =>
  value.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Moeda BRL — 20.90 → "R$ 20,90"
export const formatCurrency = (value: number): string =>
  value.toLocaleString(navigator.language, { style: "currency", currency: "BRL" });

// Porcentagem — 20.20 → "20,20%"
export const formatPercent = (value: number): string =>
  value.toLocaleString(navigator.language, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
```

**Estado real neste projeto, divergente na forma (não no objetivo)**: hoje esse projeto não tem `utils/format-number.ts` — a mesma centralização é feita via `composables/use-format-number.ts` e `composables/use-currency.ts`, usando `Intl.NumberFormat` em vez de `.toLocaleString(...)` direto. O resultado prático é equivalente (nenhum lugar do app formata número manualmente fora desses dois composables — DRY 100% respeitado), mas a **forma** não bate com o padrão-alvo acima. Não migrar só por migrar; ao criar formatação nova que não caiba nos composables existentes, usar `utils/format-number.ts` no formato acima em vez de estender os composables.

---

## CPF / CNPJ

Todo campo ou exibição de CPF/CNPJ precisa de **validação + máscara**:

```typescript
import { cpf, cnpj } from "cpf-cnpj-validator";

cpf.isValid("123.456.789-09");
cnpj.isValid("11.222.333/0001-81");
```

`cpf-cnpj-validator` já é dependência do projeto e a validação já é usada em `composables/use-form.ts` (regra `document` do objeto `rules`). **Não existe hoje** um `utils/format-document.ts` dedicado à máscara de exibição — se uma tela nova precisar exibir CPF/CNPJ formatado (não só validar no input), criar esse util em vez de formatar inline no componente.

---

## Variáveis de ambiente

- `VITE_API_BACKEND` — URL base do backend
- `VITE_API_FRONTEND` / `VITE_API_BACKOFFICE` — apontam pro projeto `frontend/` (hoje um scaffold vazio, ver `CLAUDE-FRONTEND.md`)
- `VITE_URL_ACTIVITY_SHARE` / `VITE_URL_POST_SHARE` — domínios de deep link (`activity.zenmovefit.com.br`, `post.zenmovefit.com.br`) usados só pra montar a URL do `Share.share()` nativo — **sem Universal Links/App Links configurados ainda**, o link em si não reabre o app se tocado fora dele
- `VITE_ONESIGNAL_ID`, `VITE_PAGAR_ME_PUBLIC_KEY`, `VITE_AWS_CLOUDFRONT_URL` — chaves de serviço de terceiro
- `VITE_PRICE_SUBSCRIPTION` / `VITE_PRICE_SUBSCRIPTION_ORIGINAL` — preço da assinatura (o "riscado" só aparece se `_ORIGINAL` > preço efetivo)
- `VITE_MAXIMUM_MB_VIDEO`, `VITE_WHATSAPP_SUPPORT`, `VITE_AI_NAME`, `VITE_GYM`
- Saque mínimo (`min_withdrawal_amount`) **não** é mais env var — vem do backend via `GET /public-settings` (`stores/public-settings.ts`), configurável no BackOffice (`admin/settings`, JSON `app-settings.json` no S3/CloudFront). Nunca reintroduzir como env/hardcoded.

**Nenhum `.env.example` existe no repo** — as 15 vars usadas no código não têm template documentado; ao subir um ambiente novo, é preciso conferir `.env`/`.env.production` reais pra saber o que setar.

---

## Regras absolutas

1. **Nunca usar `axios` ou `fetch` nativo** — usar `_GET/_POST/_PATCH/_DELETE` de `@/plugins/Fetcher` (exceto ViaCEP em `app.ts`; os dois pontos que usam `Fetcher` bruto por engano — `TagPeople.vue`, `ActivityShareFlow.vue` —; e `attestation.service.ts`, que usa `Fetcher` bruto de propósito para não disparar `feedbackStore` em chamadas de background)
2. **Nunca importar plugins Capacitor diretamente** — sempre via `@/mobile`
3. **Stores: sempre Options API** com `setActivePinia(pinia)` no nível do módulo
4. **Estilo: sempre `<style lang="sass">`** com sintaxe indented (sem `{}` ou `;`)
5. **i18n: sempre `useLocale()` do Vuetify** — nunca vue-i18n
6. **Script setup: sempre `<script setup lang="ts">`** em todos os componentes
7. **Paginação: sempre `Map<string, T>`** para resultados — nunca arrays simples
8. **Atualização otimista: spread obrigatório** ao mutar Map entry (`{ ...item }`)
9. **Rotas: sem `meta`** — apenas `name`, `path`, `component`
10. **Composable novo: sempre exportar no barrel `composables/index.ts`**

# PROMPT — IPTV Streaming App (Netflix Style)

## Contexto do Projeto

Você é um desenvolvedor frontend sênior especializado em React, Vite, TypeScript e Tailwind CSS. Vamos construir um aplicativo de streaming de IPTV completo com visual inspirado na Netflix — dark, cinematográfico, moderno e responsivo. O app deve funcionar em **mobile, Android TV e LG webOS**.

---

## Stack Tecnológica

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** para estilização
- **HLS.js** para reprodução de streams IPTV (HLS/M3U8)
- **iptv-playlist-parser** para parse das listas M3U
- **Zustand** para gerenciamento de estado global
- **React Router v6** para navegação
- **localStorage** para persistência de dados (perfis, favoritos, configurações)
- **@noriginmedia/spatial-navigation** para navegação via controle remoto (D-pad) nas TVs
- **Lucide React** para ícones

---

## Estrutura de Módulos

O app possui **3 módulos principais** de conteúdo:
1. **Filmes** — filmes da lista IPTV
2. **Séries** — séries organizadas por temporadas e episódios
3. **TV ao Vivo** — canais de TV em tempo real

---

## Fluxo de Navegação

```
Login → Seleção de Perfil → Home
                              ├── Filmes
                              ├── Séries
                              ├── TV ao Vivo
                              ├── Favoritos
                              └── Configurações
```

---

## Telas e Funcionalidades

### 1. Tela de Login (primeira execução)
- Campos: **URL do servidor** (ex: `http://servidor.com:8080`), **Usuário**, **Senha**
- Botão "Conectar"
- Validação dos campos
- Loading state durante conexão
- Salvar credenciais no `localStorage`
- Visual: dark, minimalista, logo central, fundo com gradiente sutil

### 2. Seleção de Perfil
- Exibir perfis salvos (máximo 5)
- Botão "Adicionar Perfil"
- Cada perfil com: avatar (emoji ou cor), nome, PIN opcional
- Ao selecionar perfil, entrar na Home
- Dados salvos no `localStorage`

### 3. Home
- **Hero Banner** com destaque do dia (canal ou filme em evidência)
- **Linhas horizontais com scroll** por categoria (igual Netflix):
  - "Continuar Assistindo"
  - "Meus Favoritos"
  - "Canais Populares"
  - Categorias dinâmicas vindas da lista M3U
- Cards com thumbnail, nome e badge de categoria

### 4. Módulo Filmes
- Grid de cards com poster
- Filtro por gênero/categoria
- Busca por nome
- Ao clicar: modal ou página de detalhes com sinopse (se disponível), botão "Assistir" e "Favoritar"

### 5. Módulo Séries
- Listagem de séries
- Ao entrar: exibir temporadas e episódios
- Progresso de episódios assistidos salvo no localStorage

### 6. Módulo TV ao Vivo
- Grid de canais com logo do canal
- Filtro por categoria (esportes, notícias, entretenimento etc.)
- Ao clicar: abrir player diretamente
- EPG básico se disponível na lista

### 7. Player de Vídeo
- Player fullscreen com HLS.js
- Controles: play/pause, volume, fullscreen, barra de progresso
- Suporte a teclado e controle remoto (D-pad)
- Exibir nome do canal/filme no topo
- Botão de voltar
- Auto-hide dos controles após 3 segundos

### 8. Favoritos
- Lista de todos os itens favoritados (canais, filmes, séries)
- Remover dos favoritos
- Agrupado por tipo

### 9. Configurações
- Alterar servidor (URL, usuário, senha)
- Gerenciar perfis
- Limpar cache/dados
- Tema (dark padrão)

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── Player/
│   │   ├── VideoPlayer.tsx
│   │   └── PlayerControls.tsx
│   ├── Cards/
│   │   ├── ChannelCard.tsx
│   │   ├── MovieCard.tsx
│   │   └── SeriesCard.tsx
│   ├── Layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── HeroBanner.tsx
│   └── UI/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── Login.tsx
│   ├── ProfileSelect.tsx
│   ├── Home.tsx
│   ├── Movies.tsx
│   ├── Series.tsx
│   ├── Live.tsx
│   ├── Favorites.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useIPTV.ts
│   ├── usePlayer.ts
│   ├── useFavorites.ts
│   └── useNavigation.ts
├── store/
│   ├── authStore.ts
│   ├── profileStore.ts
│   ├── playlistStore.ts
│   └── favoritesStore.ts
├── utils/
│   ├── m3uParser.ts
│   ├── storage.ts
│   └── xtreamApi.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## Modelo de Dados (TypeScript)

```typescript
// Perfil de usuário
interface Profile {
  id: string
  name: string
  avatar: string // emoji ou cor hex
  pin?: string
  createdAt: Date
}

// Credenciais do servidor
interface ServerConfig {
  url: string
  username: string
  password: string
}

// Canal de TV ao vivo
interface Channel {
  id: string
  name: string
  logo: string
  streamUrl: string
  category: string
  isFavorite: boolean
}

// Filme
interface Movie {
  id: string
  name: string
  poster: string
  streamUrl: string
  category: string
  rating?: string
  year?: string
  isFavorite: boolean
}

// Série
interface Series {
  id: string
  name: string
  poster: string
  category: string
  seasons: Season[]
  isFavorite: boolean
}

interface Season {
  number: number
  episodes: Episode[]
}

interface Episode {
  id: string
  name: string
  number: number
  streamUrl: string
  watched: boolean
  progress?: number // segundos assistidos
}
```

---

## Persistência no localStorage

```typescript
// Chaves do localStorage
const STORAGE_KEYS = {
  SERVER_CONFIG: 'iptv_server_config',
  PROFILES: 'iptv_profiles',
  ACTIVE_PROFILE: 'iptv_active_profile',
  FAVORITES: 'iptv_favorites',
  WATCH_HISTORY: 'iptv_watch_history',
  PLAYLIST_CACHE: 'iptv_playlist_cache',
  SETTINGS: 'iptv_settings',
}
```

---

## Design Visual

- **Tema**: Dark mode exclusivo — fundo `#0a0a0a`, cards `#141414`
- **Cor de destaque**: Vermelho Netflix `#E50914` para elementos ativos e CTAs
- **Tipografia**: Display font marcante para títulos, fonte limpa para corpo
- **Cards**: Border-radius suave, hover com scale + glow sutil
- **Navbar**: Transparente no topo, escurece ao rolar
- **Animações**: Transições suaves entre páginas, stagger nos cards, fade no player
- **Responsividade**:
  - Mobile: 2 colunas de cards
  - Tablet: 3-4 colunas
  - Desktop/TV: 5-6 colunas
- **Foco para TV**: Elementos focados com borda branca/vermelha nítida para navegação D-pad

---

## Comportamento de TV (Android TV / LG webOS)

- Detectar ambiente TV via `window.navigator.userAgent`
- Ativar `@noriginmedia/spatial-navigation` automaticamente
- Aumentar tamanho de fonte e cards no modo TV
- Ocultar scrollbars
- Capturar teclas: ArrowUp/Down/Left/Right (38/40/37/39), Enter (13), Backspace (8), teclas coloridas

---

## Integração Xtream Codes API

A maioria dos servidores IPTV usa a API Xtream Codes. Implemente:

```typescript
// Endpoints principais
const BASE = `${serverUrl}/player_api.php`

// Autenticação
GET `${BASE}?username=${u}&password=${p}`

// Listar categorias de live
GET `${BASE}?username=${u}&password=${p}&action=get_live_categories`

// Listar canais ao vivo
GET `${BASE}?username=${u}&password=${p}&action=get_live_streams&category_id=${id}`

// Listar categorias VOD (filmes)
GET `${BASE}?username=${u}&password=${p}&action=get_vod_categories`

// Listar filmes
GET `${BASE}?username=${u}&password=${p}&action=get_vod_streams&category_id=${id}`

// Listar séries
GET `${BASE}?username=${u}&password=${p}&action=get_series&category_id=${id}`

// URL de stream ao vivo
`${serverUrl}/live/${username}/${password}/${streamId}.m3u8`

// URL de stream VOD
`${serverUrl}/movie/${username}/${password}/${streamId}.mp4`
```

---

## Instruções de Implementação

1. **Comece pela autenticação**: Tela de login → salvar config → testar conexão com a API Xtream
2. **Implemente o store Zustand** com todos os estados globais
3. **Construa o parser/integração** com a API Xtream antes das telas de conteúdo
4. **Player primeiro**: VideoPlayer.tsx funcional com HLS.js antes de estilizar
5. **Estilize depois**: Aplique o visual Netflix após a lógica funcionar
6. **TV por último**: Adicione suporte a D-pad e spatial navigation após tudo funcionar no browser

---

## Observações Finais

- Use `React.lazy` + `Suspense` para code splitting por rota
- Implemente tratamento de erros em todas as chamadas de API
- Cache da playlist no localStorage com TTL de 30 minutos
- O app deve funcionar offline para conteúdo já carregado em cache
- Priorize performance: virtualize listas longas de canais (ex: `react-window`)

---

**Comece criando a estrutura completa do projeto com `npm create vite@latest` e implemente as telas na ordem: Login → ProfileSelect → Home → Player.**

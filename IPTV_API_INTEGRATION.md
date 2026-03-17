# Integração da API Xtream Codes - PlusTV

## 📋 Resumo das Mudanças

A aplicação foi ajustada para buscar conteúdo **real do servidor IPTV** em vez de usar dados mock. Agora o app carrega:
- ✅ **TV ao Vivo (Live)** - Canais em tempo real com streams HLS
- ✅ **Filmes (VOD)** - Filmes com streams MP4
- ✅ **Séries** - Séries com streams HLS

---

## 🔗 URLs de Stream Construídas

A aplicação monta automaticamente as URLs de streaming no formato correto:

```
LIVE:   {baseUrl}/live/{username}/{password}/{streamId}.m3u8
FILME:  {baseUrl}/movie/{username}/{password}/{streamId}.mp4
SÉRIE:  {baseUrl}/series/{username}/{password}/{streamId}.m3u8
```

### Exemplo de Live Stream
```
Requisição da API:
GET http://cobra01.online/player_api.php?username=xqzfk48f&password=a1qycedc&action=get_live_streams

Resposta:
[
  {
    "name": "UFC TV 01",
    "stream_id": 289465,
    "stream_icon": "https://imgscc.top/logos/UFC_TV_01_20260118_151607.png",
    ...
  }
]

URL Construída para Stream:
http://cobra01.online/live/xqzfk48f/a1qycedc/289465.m3u8
```

---

## 📁 Arquivos Modificados

### 1. **src/utils/xtreamApi.ts**
Novo método genérico:
- `buildStreamUrl(baseUrl, username, password, streamId, streamType)` - Constrói URL baseada no tipo de stream
  - Tipos suportados: 'live', 'movie', 'video', 'series'
- `getAllContent(config)` - Busca todos os dados do servidor em paralelo

```typescript
// Busca dados do servidor
const content = await xtreamApi.getAllContent(serverConfig)

// Constrói URLs dinamicamente baseado no stream_type
const liveUrl = xtreamApi.buildStreamUrl(baseUrl, username, password, streamId, 'live')
const movieUrl = xtreamApi.buildStreamUrl(baseUrl, username, password, streamId, 'movie')
const seriesUrl = xtreamApi.buildStreamUrl(baseUrl, username, password, streamId, 'series')
```

### 2. **src/store/contentStore.ts**
Novo método:
- `fetchServerContent(config)` - Busca e processa dados do servidor
  - Converte dados da API para os tipos locais (Channel, Movie, Series)
  - Salva em cache localStorage
  - Gerencia estados de loading e erro

```typescript
// No componente
const { fetchServerContent, isLoading, error } = useContentStore()
await fetchServerContent(serverConfig)
```

### 3. **src/pages/Home.tsx**
Melhorias:
- Busca dados reais se `serverConfig` estiver disponível
- Fallback para mockData se não houver credenciais
- Exibe `LoadingSpinner` durante carregamento
- Mostra mensagens de erro amigáveis
- Renderização condicional para diferentes estados

### 4. **src/hooks/useServerContent.ts** (NOVO)
Hook simplificado para buscar conteúdo:

```typescript
const { channels, movies, series, isLoading, error } = useServerContent()
```

### 5. **src/types/index.ts**
Novos tipos para dados da API:
- `XtreamLiveStream`
- `XtreamVodStream`
- `XtreamSeries`
- `XtreamCategory`

---

## 🚀 Como Usar

### Autenticação
1. Abra o app no navegador
2. Insira as credenciais do servidor IPTV:
   ```
   URL:      http://cobra01.online
   Username: xqzfk48f
   Password: a1qycedc
   ```
3. Clique em "ENTRAR"

### Carregamento de Conteúdo
- Após login, a página Home busca automaticamente:
  - Categorias de TV ao Vivo
  - Categorias de Filmes (VOD)
  - Lista de canais Live
  - Lista de filmes
  - Lista de séries

### Fluxo de Dados
```
Login Page
    ↓ (Salva credenciais)
Auth Store
    ↓ (serverConfig armazenado)
Home Page
    ↓ (Detecta serverConfig)
fetchServerContent()
    ↓ (Busca dados do servidor)
Content Store
    ↓ (Salva em cache)
Componentes
    ↓ (Renderizam conteúdo real)
```

---

## 📊 Estrutura dos Dados Convertidos

### Live Stream → Channel
```typescript
{
  id: "289465",
  name: "UFC TV 01",
  logo: "https://imgscc.top/logos/UFC_TV_01_20260118_151607.png",
  streamUrl: "http://cobra01.online/live/xqzfk48f/a1qycedc/289465.m3u8",
  category: "49",
  isFavorite: false
}
```

### VOD Stream → Movie
```typescript
{
  id: "stream_id",
  name: "Nome do Filme",
  poster: "https://...",
  streamUrl: "http://cobra01.online/movie/xqzfk48f/a1qycedc/stream_id.mp4",
  category: "category_id",
  rating: "8.5",
  year: "2024",
  isFavorite: false
}
```

### Series Stream → Series
```typescript
{
  id: "series_id",
  name: "Nome da Série",
  poster: "https://...",
  category: "category_id",
  isFavorite: false,
  seasons: [
    {
      number: 1,
      episodes: [
        {
          id: "series_id",
          name: "Nome da Série",
          number: 1,
          streamUrl: "http://cobra01.online/series/xqzfk48f/a1qycedc/series_id.m3u8",
          watched: false
        }
      ]
    }
  ]
}
```

---

## 🔄 Cache e Persistência

Os dados são salvos em `localStorage` com a chave `PLAYLIST_CACHE`:

```javascript
{
  channels: [...],
  movies: [...],
  series: [...],
  timestamp: 1234567890
}
```

Isso permite que:
- ✅ Dados persistam entre recarregamentos
- ✅ App funcione offline (com dados em cache)
- ✅ Carregamento mais rápido na próxima vez

---

## ⚠️ Tratamento de Erros

A aplicação trata erros em vários níveis:

1. **Erro de Conexão**
   ```
   "Conexão expirou. Verifique a URL do servidor."
   ```

2. **Erro de Autenticação**
   ```
   "Usuário ou senha incorretos"
   ```

3. **Erro ao Buscar Conteúdo**
   ```
   "Erro ao carregar conteúdo: [mensagem de erro]"
   ```

Erros são exibidos em um banner vermelho na Home page.

---

## 📱 Estados da UI

### Loading
- Spinner de carregamento
- Desabilita interações enquanto busca

### Success
- Conteúdo carregado
- Exibe categorias e itens

### Error
- Banner com mensagem de erro
- Mantém dados de cache se disponível
- Permite tentar novamente

### Empty
- Mensagem quando nenhum conteúdo carregado
- Instruções para fazer login

---

## 🎯 Fluxo Completo de Uso

```
1. Usuário faz Login
   ↓
2. Credenciais são validadas contra o servidor
   ↓
3. Se válidas, são salvas em localStorage
   ↓
4. Usuário seleciona um perfil
   ↓
5. Home page é carregada
   ↓
6. useEffect detecta serverConfig
   ↓
7. fetchServerContent() é chamado
   ↓
8. API Xtream é consultada:
   - get_live_categories
   - get_live_streams (para cada categoria)
   - get_vod_categories
   - get_vod_streams (para cada categoria)
   - get_series
   ↓
9. Dados são convertidos para tipos locais
   ↓
10. URLs de streaming são construídas
    ↓
11. Dados salvos em cache
    ↓
12. UI atualizada com conteúdo real
```

---

## 🔧 Configurações Disponíveis

### No `authStore`
- `serverConfig` - Credenciais IPTV
- `isAuthenticated` - Estado de autenticação

### No `contentStore`
- `channels` - Array de canais live
- `movies` - Array de filmes
- `series` - Array de séries
- `isLoading` - Estado de carregamento
- `error` - Mensagem de erro

### No `useServerContent` hook
```typescript
const { 
  channels, 
  movies, 
  series, 
  isLoading, 
  error, 
  hasContent 
} = useServerContent()
```

---

## 📋 Exemplo de Integração em Componentes

```typescript
import { useServerContent } from '../hooks/useServerContent'

export function MyComponent() {
  const { channels, isLoading, error } = useServerContent()

  if (isLoading) return <LoadingSpinner />
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {channels.map(ch => (
        <div key={ch.id}>{ch.name}</div>
      ))}
    </div>
  )
}
```

---

## 🐛 Troubleshooting

### "Credenciais inválidas"
- Verifique URL, username e password
- Certifique-se que a conta está ativa no servidor

### "Conexão expirou"
- Verifique a URL do servidor
- Verifique conectividade de rede
- Aumente o timeout se necessário

### Conteúdo não carregando
- Verifique se o servidor IPTV está online
- Verifique logs no console do navegador
- Limpe o cache: `localStorage.clear()`

### Streams não funcionando
- Verifique se streamIds são válidos
- Teste URL no VLC ou outro player
- Confirme que a conta tem permissão para streaming

---

## 📞 Referências

### API Xtream Codes
- Documentação: https://www.xtream-ui.net/
- Endpoint base: `/player_api.php`
- Autenticação: username + password nos params

### Formato de Streams
- Live: HLS (.m3u8)
- VOD: MP4 (.mp4)
- Séries: HLS (.m3u8)

---

## ✅ Próximos Passos

- [ ] Implementar atualização periódica de cache (refresh automático)
- [ ] Adicionar busca avançada por categoria
- [ ] Carregar informações detalhadas de episódios
- [ ] Implementar recomendações
- [ ] Adicionar suporte a múltiplas contas IPTV

---

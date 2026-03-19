const api = `${server}/player_api.php?username=${u}&password=${p}`

// Login / validar conta
GET `${api}`

// Categorias dos canais ao vivo
GET `${api}&action=get_live_categories`
// → [{ category_id: "49", category_name: "Esportes", ... }]

// Canais por categoria
GET `${api}&action=get_live_streams&category_id=49`
// → o JSON que você mostrou acima

// Todos os canais (sem filtro)
GET `${api}&action=get_live_streams`

// Categorias de filmes
GET `${api}&action=get_vod_categories`

// Filmes
GET `${api}&action=get_vod_streams&category_id=ID`

// Categorias de séries
GET `${api}&action=get_series_categories`

// Séries
GET `${api}&action=get_series&category_id=ID`

// Episódios de uma série
GET `${api}&action=get_series_info&series_id=ID`

// Info de um filme (sinopse, poster etc)
GET `${api}&action=get_vod_info&vod_id=ID`
// server.js
const express = require('express');
const request = require('request');
const app = express();

app.get('/stream/:id', (req, res) => {
  const streamId = req.params.id;
  const url = `http://gopower.click:80/live/057280135334/4028569083438/${streamId}`;
  
  // Define headers para o browser aceitar
  res.setHeader('Content-Type', 'video/mp2t');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Redireciona o stream do IPTV para o browser
  request.get(url).pipe(res);
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

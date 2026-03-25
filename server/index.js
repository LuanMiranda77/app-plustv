import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/proxy', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('URL obrigatória');
  }

  try {
    const response = await fetch(url);
    const data = await response.text();

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no proxy');
  }
});

app.listen(3001, () => {
  console.log('🚀 Proxy rodando em http://localhost:3001');
});

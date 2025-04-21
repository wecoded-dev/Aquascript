const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.get('/api/moviesdata', (req, res) => {
  fs.readFile('./moviesdata.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load books.json' });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}/api/moviesdata`);
});
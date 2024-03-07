const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;
const viewsPath = path.join(__dirname, 'public', 'views.json');


app.use(cors());
app.use(bodyParser.json());

// Odczyt pliku views.json
app.get('/views', (req, res) => {
  fs.readFile(viewsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading views file.');
      return;
    }
    res.send(data);
  });
});

// Aktualizacja pliku views.json
app.post('/views', (req, res) => {
  const data = JSON.stringify(req.body, null, 2);
  fs.writeFile(viewsPath, data, 'utf8', (err) => {
    if (err) {
      res.status(500).send('Error writing views file.');
      return;
    }
    res.send('Views updated successfully.');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

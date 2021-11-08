
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')));



app.get('/:title', (req, res) => {
    var url = `https://en.wikipedia.org/wiki/${req.params.title}`;
    var data = { "URL": url};
    res.json(data);
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});


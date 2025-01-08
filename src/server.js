const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 4567;

// Middleware
app.use(bodyParser.json());

// Inicializa as tarefas no app.locals
app.locals.tasks = {};

// Rota POST para iniciar uma nova busca
app.post('/crawl', (req, res) => {
    const { keyword } = req.body;

    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }
    if (keyword.length < 4 || keyword.length > 32) {
        return res.status(400).json({ error: 'Keyword must be between 4 and 32 characters' });
    }

    const id = Math.random().toString(36).substring(2, 10); // Gera ID alfanumérico
    app.locals.tasks[id] = {
        id,
        keyword,
        status: 'active',
        urls: []
    };

    res.status(200).json({ id });
});

// Rota GET para consultar resultados de busca
app.get('/crawl/:id', (req, res) => {
    const { id } = req.params;

    const task = app.locals.tasks[id];
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
});

// Inicia o servidor apenas se o arquivo for executado diretamente
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

module.exports = app;

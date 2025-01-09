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

// Função para buscar URLs nas sessões (1 a 8, exceto 6)
const scrapeByKeyword = async (keyword) => {
    const baseUrl = 'http://hiring.axreng.com/';
    const results = [];

    for (let session of [1, 2, 3, 4, 5, 7, 8]) {
        const sessionUrl = `${baseUrl}index${session}.html`;

        try {
            const response = await axios.get(sessionUrl);
            const html = response.data;
            const $ = cheerio.load(html);

            let keywordFound = false;

            $('a').each((_, element) => {
                let href = $(element).attr('href');
                if (href && href.includes(keyword)) {
                    keywordFound = true;
                    const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
                    results.push(fullUrl);
                }
            });

            if (keywordFound) {
                // Adiciona a URL da sessão ao resultado, caso a palavra-chave seja encontrada
                results.push(sessionUrl);
            }
        } catch (error) {
            console.error(`Error scraping session ${session}:`, error.message);
        }
    }

    return results;
};

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

    // Cria uma nova tarefa
    app.locals.tasks[id] = {
        id,
        keyword,
        status: 'active',
        urls: []
    };

    // Inicia o scraping em segundo plano
    (async () => {
        try {
            const urls = await scrapeByKeyword(keyword);
            app.locals.tasks[id].urls = urls;
            app.locals.tasks[id].status = 'completed';
        } catch (error) {
            app.locals.tasks[id].status = 'error';
            console.error(`Scraping failed for task ${id}:`, error.message);
        }
    })();

    // Retorna apenas o ID da tarefa
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

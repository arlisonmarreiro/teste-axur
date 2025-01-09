const crypto = require('crypto');
const cheerio = require('cheerio');

// Função para gerar um ID alfanumérico de 8 caracteres
const generateAlphanumericId = () => {
    let id = '';
    while (id.length < 8) {
        id += crypto.randomBytes(6)
            .toString('base64')
            .replace(/[^a-zA-Z0-9]/g, '');
    }
    return id.slice(0, 8); // Garante exatamente 8 caracteres
};

// Função para buscar uma palavra-chave em um conteúdo HTML
const findKeywordInHtml = (html, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i'); // Case insensitive
    return regex.test(html);
};

// Função para buscar links em um conteúdo HTML
const findLinksInHtml = (html, baseUrl) => {
    const $ = cheerio.load(html);
    const links = [];

    $('a').each((_, element) => {
        let href = $(element).attr('href');
        if (!href) return;

        // Resolve links relativos
        if (!href.startsWith('http')) {
            href = new URL(href, baseUrl).href;
        }

        links.push(href);
    });

    return links;
};

module.exports = { generateAlphanumericId, findKeywordInHtml, findLinksInHtml };

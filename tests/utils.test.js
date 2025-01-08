const { generateAlphanumericId, findKeywordInHtml, findLinksInHtml } = require('../src/utils');

describe('generateAlphanumericId', () => {
    it('should generate an ID with 8 alphanumeric characters', () => {
        const id = generateAlphanumericId();
        expect(id).toHaveLength(8);
        expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });

    it('should generate unique IDs', () => {
        const id1 = generateAlphanumericId();
        const id2 = generateAlphanumericId();
        expect(id1).not.toBe(id2);
    });
});

describe('findKeywordInHtml', () => {
    it('should find the keyword in HTML content', () => {
        const html = '<html><body>data is here</body></html>';
        const result = findKeywordInHtml(html, 'data');
        expect(result).toBe(true);
    });

    it('should be case insensitive', () => {
        const html = '<html><body>Data is here</body></html>';
        const result = findKeywordInHtml(html, 'data');
        expect(result).toBe(true);
    });

    it('should not find the keyword if not present', () => {
        const html = '<html><body>other content</body></html>';
        const result = findKeywordInHtml(html, 'data');
        expect(result).toBe(false);
    });
});

describe('findLinksInHtml', () => {
    it('should extract absolute links from HTML', () => {
        const html = '<html><body><a href="http://example.com">Link</a></body></html>';
        const links = findLinksInHtml(html, 'http://baseurl.com');
        expect(links).toEqual(['http://example.com']);
    });

    it('should resolve relative links', () => {
        const html = '<html><body><a href="/path">Link</a></body></html>';
        const links = findLinksInHtml(html, 'http://baseurl.com');
        expect(links).toEqual(['http://baseurl.com/path']);
    });

    it('should ignore elements without href', () => {
        const html = '<html><body><a>Link</a></body></html>';
        const links = findLinksInHtml(html, 'http://baseurl.com');
        expect(links).toEqual([]);
    });
});

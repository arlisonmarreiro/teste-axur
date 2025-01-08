const request = require('supertest');
const app = require('../src/server');

let server;
let baseUrl;

beforeAll((done) => {
    server = app.listen(0, () => {
        const { port } = server.address(); // Obtem uma porta aleatória disponível
        baseUrl = `http://localhost:${port}`;
        done();
    });
});

afterAll((done) => {
    server.close(done); // Fecha o servidor após os testes
});

beforeEach(() => {
    app.locals.tasks = {}; // Inicializa as tarefas antes de cada teste
});

describe('API Endpoints', () => {
    describe('POST /crawl', () => {
        it('should return 400 for missing keyword', async () => {
            const response = await request(baseUrl).post('/crawl').send({});
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Keyword is required');
        });

        it('should return 400 for a short keyword', async () => {
            const response = await request(baseUrl).post('/crawl').send({ keyword: 'abc' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Keyword must be between 4 and 32 characters');
        });

        it('should return 400 for a keyword longer than 32 characters', async () => {
            const longKeyword = 'a'.repeat(33); // Gera uma string com 33 caracteres
            const response = await request(baseUrl).post('/crawl').send({ keyword: longKeyword });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Keyword must be between 4 and 32 characters');
        });

        it('should return 200 and create a new task for a valid keyword', async () => {
            const response = await request(baseUrl).post('/crawl').send({ keyword: 'data' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body.id).toMatch(/^[a-zA-Z0-9]{8}$/); // Verifica que o ID é alfanumérico e possui 8 caracteres
        });

        it('should handle multiple simultaneous requests', async () => {
            const keywords = ['data', 'security', 'analysis', 'testing'];
            const requests = keywords.map(keyword =>
                request(baseUrl).post('/crawl').send({ keyword })
            );

            const responses = await Promise.all(requests);
            responses.forEach((response, index) => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('id');
                expect(response.body.id).toMatch(/^[a-zA-Z0-9]{8}$/); // Verifica que o ID é alfanumérico
            });
        });
    });

    describe('GET /crawl/:id', () => {
        it('should return 404 for a non-existent task ID', async () => {
            const response = await request(baseUrl).get('/crawl/invalidId');
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Task not found');
        });

        it('should return 200 with task details for an existing task (done)', async () => {
            const taskId = 'abcd1234';
            app.locals.tasks[taskId] = {
                id: taskId,
                keyword: 'data',
                status: 'done',
                urls: ['http://example.com/index.html', 'http://example.com/data.html']
            };

            const response = await request(baseUrl).get(`/crawl/${taskId}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(app.locals.tasks[taskId]);
        });

        it('should return 200 with partial results while task is active', async () => {
            const taskId = 'efgh5678';
            app.locals.tasks[taskId] = {
                id: taskId,
                keyword: 'data',
                status: 'active',
                urls: ['http://example.com/partial.html']
            };

            const response = await request(baseUrl).get(`/crawl/${taskId}`);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(app.locals.tasks[taskId]);
        });

        it('should handle multiple simultaneous queries without interference', async () => {
            const taskId1 = 'task1';
            const taskId2 = 'task2';

            app.locals.tasks[taskId1] = {
                id: taskId1,
                keyword: 'data',
                status: 'done',
                urls: ['http://example.com/data1.html']
            };

            app.locals.tasks[taskId2] = {
                id: taskId2,
                keyword: 'security',
                status: 'active',
                urls: ['http://example.com/security1.html']
            };

            // Executa duas consultas simultâneas
            const [response1, response2] = await Promise.all([
                request(baseUrl).get(`/crawl/${taskId1}`),
                request(baseUrl).get(`/crawl/${taskId2}`)
            ]);

            expect(response1.status).toBe(200);
            expect(response1.body).toEqual(app.locals.tasks[taskId1]);

            expect(response2.status).toBe(200);
            expect(response2.body).toEqual(app.locals.tasks[taskId2]);
        });
    });
});

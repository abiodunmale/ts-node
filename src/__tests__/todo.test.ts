import supertest from 'supertest';
import app from '../server'  // We'll export app later

describe('Todo API', () => {
  it('should create a todo', async () => {
    const res = await supertest(app)
      .post('/api/todos')
      .send({ title: 'TDD Todo' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('TDD Todo');
  });
});
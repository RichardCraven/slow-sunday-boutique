import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Etsy Shop API Tests', () => {
  describe('GET /api/health', () => {
    it('returns HTTP 200 and { status: "ok" }', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body.service).toBe('etsy-shop-api');
      expect(response.body.version).toBe('1.0.0');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /api/products', () => {
    it('returns 200 and a list of artisan products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const firstProduct = response.body.data[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('title');
      expect(firstProduct).toHaveProperty('price');
      expect(firstProduct).toHaveProperty('artisanName');
    });

    it('filters products by category correctly', async () => {
      const response = await request(app).get('/api/products?category=Vintage');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((p: { category: string }) => p.category === 'Vintage')).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns 404 for nonexistent product id', async () => {
      const response = await request(app).get('/api/products/non-existent-id-999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('returns 200 and product for valid id', async () => {
      const response = await request(app).get('/api/products/prod-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('prod-1');
    });
  });
});

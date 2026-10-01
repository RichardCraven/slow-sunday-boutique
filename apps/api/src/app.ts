import express, { Request, Response } from 'express';
import cors from 'cors';
import { ApiResponse, HealthResponse, Product, Order } from '@etsy-shop/shared';
import { initialProducts } from './data/products.js';

export const app = express();

app.use(cors());
app.use(express.json());

// In-memory state for products and orders
let products: Product[] = [...initialProducts];
const orders: Order[] = [];

/**
 * Health Check Endpoint
 * Requirements: returns HTTP 200 and { status: "ok" }
 */
app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'ok',
    service: 'etsy-shop-api',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /api/products
 * Fetch products with optional query filtering by category and search keyword
 */
app.get('/api/products', (req: Request, res: Response<ApiResponse<Product[]>>) => {
  try {
    const { category, search } = req.query;
    let filtered = [...products];

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(tag => tag.toLowerCase().includes(q)) ||
        p.artisanName.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      data: filtered,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID
 */
app.get('/api/products/:id', (req: Request, res: Response<ApiResponse<Product>>) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: `Product with id '${id}' not found`,
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json({
    success: true,
    data: product,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/orders
 * Simulate order placement
 */
app.post('/api/orders', (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
    const { items, customerEmail, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must include at least one item',
        timestamp: new Date().toISOString()
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Customer email is required',
        timestamp: new Date().toISOString()
      });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      items,
      totalAmount: Number(totalAmount.toFixed(2)),
      currency: 'USD',
      customerEmail,
      shippingAddress: shippingAddress || {
        name: 'Guest Customer',
        street: '123 Artisan Way',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
        country: 'USA'
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to place order';
    res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

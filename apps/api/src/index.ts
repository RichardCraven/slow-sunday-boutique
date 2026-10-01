import { app } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(` Etsy Shop API running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Products:     http://localhost:${PORT}/api/products`);
  console.log(`=========================================`);
});

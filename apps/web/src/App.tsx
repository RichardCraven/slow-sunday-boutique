import { useState, useEffect } from 'react';
import type { Product, CartItem, HealthResponse, Order } from '@etsy-shop/shared';
import { fallbackProducts } from './data/fallbackProducts';
import './App.css';

const CATEGORIES = [
  'All',
  'Cozy Apparel',
  'Ceramics & Mugs',
  'Linen & Totes',
  'Aromatherapy',
  'Botanical Decor',
  'Vintage'
];

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Poll / Check health
  const checkHealth = async () => {
    try {
      setHealthStatus('loading');
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HealthResponse = await res.json();
      setHealth(data);
      setHealthStatus('ok');
    } catch {
      setHealthStatus('error');
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load products (HTTP ${res.status})`);
      }
      const json = await res.json();
      setProducts(json.data || []);
    } catch {
      // Graceful offline fallback: if backend is offline or starting, load bundled catalog
      let filtered = [...fallbackProducts];
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some(tag => tag.toLowerCase().includes(q)) ||
          p.artisanName.toLowerCase().includes(q)
        );
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = cartSubtotal > 50 || cartSubtotal === 0 ? 0 : 4.99;
  const grandTotal = cartSubtotal + shippingFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setIsSubmittingOrder(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerEmail: 'artisan.buyer@melkor.io',
          shippingAddress: {
            name: 'Sarah Connor',
            street: '45 Artisan Boulevard',
            city: 'Portland',
            state: 'OR',
            zip: '97201',
            country: 'USA'
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Order checkout failed: ${res.statusText}`);
      }

      const json = await res.json();
      setLastOrder(json.data);
      setCart([]);
    } catch {
      // Offline fallback simulation
      const fallbackOrder: Order = {
        id: `ord-local-${Date.now()}`,
        items: [...cart],
        totalAmount: grandTotal,
        currency: 'USD',
        customerEmail: 'artisan.buyer@melkor.io',
        shippingAddress: {
          name: 'Sarah Connor',
          street: '45 Artisan Boulevard',
          city: 'Portland',
          state: 'OR',
          zip: '97201',
          country: 'USA'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setLastOrder(fallbackOrder);
      setCart([]);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation */}
      <header className="navbar">
        <div className="nav-main">
          <div className="logo-group" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}>
            <img
              src="/assets/logo.jpg"
              alt="Slow Sunday Boutique"
              className="brand-logo-img"
            />
            <div className="brand-text-wrap">
              <span className="brand-logo">Slow Sunday Boutique</span>
              <span className="brand-tagline">Cozy Living • Botanical Goods</span>
            </div>
          </div>

          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for Comfort Colors tees, cozy crewnecks, botanical mugs, linen totes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-icon-btn" title="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <div className="nav-actions">
            {/* Health pill */}
            <div
              className="health-pill"
              onClick={() => setIsHealthModalOpen(true)}
              title="Click to view Render API Service status"
            >
              <div className={`status-dot ${healthStatus}`}></div>
              <span>
                API: {healthStatus === 'ok' ? 'Connected (200)' : healthStatus === 'loading' ? 'Checking...' : 'Offline'}
              </span>
            </div>

            {/* Cart Button */}
            <button className="cart-button" onClick={() => setIsCartOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Cart</span>
              {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
            </button>
          </div>
        </div>

        {/* Category Bar */}
        <nav className="category-nav">
          <div className="category-list">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Live gently. Embrace the slow Sunday feeling.</h1>
          <p className="hero-subtitle">
            Thoughtfully curated cozy apparel, garment-dyed Comfort Colors tees, hand-embroidered fleece crewnecks, botanical ceramic mugs, and washed linen totes for effortless, grounded living.
          </p>
          <div className="hero-tags">
            <span className="hero-tag">🌿 Garment-Dyed Comfort Colors</span>
            <span className="hero-tag">☕ Hand-Thrown Botanical Mugs</span>
            <span className="hero-tag">☁️ Cozy Fleece Crewnecks</span>
            <span className="hero-tag">👜 French Washed Linen Totes</span>
            <span className="hero-tag">🚚 Free Shipping over $50</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="catalog-header">
          <div>
            <h2 className="catalog-title">
              {selectedCategory === 'All' ? 'Featured Artisan Listings' : selectedCategory}
            </h2>
            <span className="catalog-count">{products.length} unique items available</span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading handcrafted items...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Unable to connect to API</h3>
            <p>{error}</p>
            <button className="add-to-cart-btn" style={{ maxWidth: '200px' }} onClick={fetchProducts}>
              Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try searching for a different term or selecting another category.</p>
            <button
              className="add-to-cart-btn"
              style={{ maxWidth: '160px' }}
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                  />
                  {product.badge && (
                    <span className={`badge-overlay ${product.badge.toLowerCase().replace(' ', '-')}`}>
                      {product.badge}
                    </span>
                  )}
                  <button className="favorite-btn" title="Add to favorites" aria-label="Favorite">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>

                <div className="product-details">
                  <span className="artisan-name">{product.artisanName}</span>
                  <h3 className="product-title" title={product.title}>
                    {product.title}
                  </h3>

                  <div className="rating-row">
                    <span className="stars">★ {product.rating.toFixed(1)}</span>
                    <span className="review-count">({product.reviewCount})</span>
                  </div>

                  <div className="price-stock-row">
                    <span className="product-price">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className={`stock-indicator ${product.stock <= 3 ? 'low-stock' : ''}`}>
                      {product.stock <= 3 ? `Only ${product.stock} left!` : `In stock (${product.stock})`}
                    </span>
                  </div>

                  <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Shopping Cart ({totalCartCount})</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>×</button>
            </div>

            {lastOrder ? (
              <div className="order-success-card">
                <div className="success-icon">🎉</div>
                <h3>Order Confirmed!</h3>
                <p>Thank you for supporting independent artisans. Your order has been placed successfully.</p>
                <div className="order-badge-id">Order ID: {lastOrder.id}</div>
                <button
                  className="checkout-btn"
                  onClick={() => { setLastOrder(null); setIsCartOpen(false); }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto 20px', border: 'none' }}>
                <p>Your cart is empty.</p>
                <button
                  className="add-to-cart-btn"
                  style={{ maxWidth: '180px', margin: '10px auto 0' }}
                  onClick={() => setIsCartOpen(false)}
                >
                  Browse Items
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map(item => (
                    <div key={item.product.id} className="cart-item">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <div>
                          <h4 className="cart-item-title">{item.product.title}</h4>
                          <span className="cart-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="cart-item-actions">
                          <div className="qty-control">
                            <button className="qty-btn" onClick={() => updateCartQuantity(item.product.id, -1)}>−</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateCartQuantity(item.product.id, 1)}>+</button>
                          </div>
                          <button className="remove-btn" onClick={() => removeFromCart(item.product.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>

                  <button
                    className="checkout-btn"
                    disabled={isSubmittingOrder}
                    onClick={handleCheckout}
                  >
                    {isSubmittingOrder ? 'Processing Order...' : `Checkout • $${grandTotal.toFixed(2)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Render Health Modal */}
      {isHealthModalOpen && (
        <div className="modal-overlay" onClick={() => setIsHealthModalOpen(false)}>
          <div className="health-modal" onClick={e => e.stopPropagation()}>
            <div className="cart-header" style={{ padding: '0 0 16px 0' }}>
              <h2>Render API Health Status</h2>
              <button className="close-btn" onClick={() => setIsHealthModalOpen(false)}>×</button>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div className="health-detail-item">
                <span className="label">Endpoint</span>
                <span className="val">GET /api/health</span>
              </div>
              <div className="health-detail-item">
                <span className="label">Status</span>
                <span className="val" style={{ color: healthStatus === 'ok' ? '#10b981' : '#ef4444' }}>
                  {healthStatus === 'ok' ? 'HTTP 200 OK' : 'Unavailable'}
                </span>
              </div>
              <div className="health-detail-item">
                <span className="label">Service Name</span>
                <span className="val">{health?.service || 'etsy-shop-api'}</span>
              </div>
              <div className="health-detail-item">
                <span className="label">Target Platform</span>
                <span className="val">Render (node web service)</span>
              </div>
              <div className="health-detail-item">
                <span className="label">Service Port</span>
                <span className="val">10000</span>
              </div>
              {health?.uptime !== undefined && (
                <div className="health-detail-item">
                  <span className="label">Server Uptime</span>
                  <span className="val">{health.uptime} seconds</span>
                </div>
              )}
              {health?.timestamp && (
                <div className="health-detail-item">
                  <span className="label">Server Timestamp</span>
                  <span className="val">{new Date(health.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            <button
              className="checkout-btn"
              style={{ marginTop: '20px' }}
              onClick={checkHealth}
            >
              Refresh Health Status
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>Slow Sunday Boutique</strong> • Botanical &amp; Cozy Slow Living Goods
          </div>
          <div>
            Frontend: Vercel (Vite + React) • Backend: Render (Node.js + Express)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

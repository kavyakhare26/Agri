import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = [
  { id: '', label: 'All Products', icon: '🛒' },
  { id: 'seed', label: 'Certified Seeds', icon: '🌾' },
  { id: 'fertilizer', label: 'Fertilizers', icon: '🧪' },
  { id: 'pesticide', label: 'Pest & Fungicide', icon: '🛡️' },
  { id: 'tool', label: 'Tools & Sprayers', icon: '🔧' },
];

function Store() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [quantities, setQuantities] = useState({});

  const { addToCart, itemCount } = useCart();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await API.get(`/resources?${params.toString()}`);
      setResources(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load store products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, search]);

  const handleQtyChange = (id, delta, max) => {
    const current = quantities[id] || 1;
    const next = Math.max(1, Math.min(max, current + delta));
    setQuantities({ ...quantities, [id]: next });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product._id] || 1;
    if (product.stock < qty) {
      toast.error('Selected quantity exceeds available stock');
      return;
    }
    addToCart(product, qty);
    toast.success(`Added ${qty} × ${product.name} to cart!`);
  };

  const getProductEmoji = (cat) => {
    switch (cat) {
      case 'seed': return '🌾';
      case 'fertilizer': return '🧪';
      case 'pesticide': return '🛡️';
      case 'tool': return '⚙️';
      default: return '📦';
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">🛒 Farmer Resource & Input Store</h2>
          <p className="text-muted mb-0">Subsidized seeds, certified fertilizers, crop protection chemicals, and farming tools</p>
        </div>
        <Link to="/cart" className="btn btn-success px-4 py-2 position-relative">
          View Cart 🛍️
          {itemCount > 0 && (
            <Badge bg="danger" pill className="position-absolute" style={{ top: '-8px', right: '-8px' }}>
              {itemCount}
            </Badge>
          )}
        </Link>
      </div>

      {/* Categories & Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center">
            <Col md={8}>
              <Nav variant="pills" activeKey={category} onSelect={(k) => setCategory(k)}>
                {CATEGORIES.map((c) => (
                  <Nav.Item key={c.id}>
                    <Nav.Link eventKey={c.id} className="py-2 px-3 fw-semibold">
                      {c.icon} {c.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </Col>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search products or brands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : resources.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">📦</div>
            <h5>No products available</h5>
            <p className="text-muted">Try choosing another category or clearing your search filter.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {resources.map((item) => {
            const qty = quantities[item._id] || 1;
            const inStock = item.stock > 0;

            return (
              <Col key={item._id}>
                <Card className="h-100 border-0 shadow-sm store-card d-flex flex-column">
                  <div className="text-center py-4 bg-light border-bottom">
                    <span style={{ fontSize: '3.5rem' }}>{getProductEmoji(item.category)}</span>
                  </div>
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <Badge bg="secondary" className="text-capitalize small">
                          {item.category}
                        </Badge>
                        {inStock ? (
                          <Badge bg="success" className="small">In Stock ({item.stock})</Badge>
                        ) : (
                          <Badge bg="danger" className="small">Out of Stock</Badge>
                        )}
                      </div>
                      <h5 className="fw-bold text-dark mb-1 mt-2">{item.name}</h5>
                      <p className="small text-muted mb-2">Brand: {item.brand || 'Verified Agri Input'}</p>
                      <p className="small text-secondary mb-3">{item.description}</p>
                    </div>

                    <div className="border-top pt-3 mt-auto">
                      <div className="d-flex justify-content-between align-items-baseline mb-3">
                        <h4 className="fw-bold text-success mb-0">₹{item.price}</h4>
                        <span className="text-muted small">/{item.unit}</span>
                      </div>

                      {inStock ? (
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="small text-muted">Quantity:</span>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => handleQtyChange(item._id, -1, item.stock)}
                              >
                                -
                              </Button>
                              <span className="fw-bold px-2">{qty}</span>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() => handleQtyChange(item._id, 1, item.stock)}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="success"
                            className="w-100 fw-semibold"
                            onClick={() => handleAddToCart(item)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      ) : (
                        <Button variant="secondary" disabled className="w-100">
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default Store;


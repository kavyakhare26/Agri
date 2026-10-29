import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Cart() {
  const { items, removeFromCart, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    village: '',
    district: '',
    state: user?.state || 'Maharashtra',
    pincode: '',
    paymentMethod: 'cod',
    notes: '',
  });

  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }

    try {
      setPlacing(true);
      const payload = {
        items: items.map((i) => ({
          resource: i.resource._id,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          name: delivery.name,
          phone: delivery.phone,
          village: delivery.village,
          district: delivery.district,
          state: delivery.state,
          pincode: delivery.pincode,
        },
        paymentMethod: delivery.paymentMethod,
        notes: delivery.notes,
      };

      const res = await API.post('/orders', payload);
      toast.success('Order placed successfully! Delivery initiated.');
      clearCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Card className="border-0 shadow-sm p-5 max-w-600 mx-auto">
          <Card.Body>
            <div className="fs-1 mb-3">🛒</div>
            <h3>Your Cart is Empty</h3>
            <p className="text-muted">Explore our store for certified seeds, fertilizers, and agricultural equipment.</p>
            <Link to="/store" className="btn btn-success px-4 py-2 mt-2">
              Browse Store →
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-success mb-4">🛍️ Checkout & Cart</h2>

      <Row className="g-4">
        {/* Cart Items Table */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Cart Items ({items.length})</h5>
              <Button size="sm" variant="outline-danger" onClick={clearCart}>
                Clear Cart
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Item</th>
                    <th>Rate</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => {
                    const r = i.resource;
                    const subtotal = (r.price || 0) * i.quantity;
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="fw-bold text-dark">{r.name}</div>
                          <small className="text-muted">{r.brand} | {r.unit}</small>
                        </td>
                        <td>₹{r.price}</td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              className="px-2 py-0"
                              onClick={() => updateQty(r._id, i.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="fw-bold px-2">{i.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              className="px-2 py-0"
                              onClick={() => updateQty(r._id, i.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="fw-bold text-success">₹{subtotal.toLocaleString()}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="link"
                            className="text-danger p-0 text-decoration-none"
                            onClick={() => removeFromCart(r._id)}
                          >
                            ✕
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Delivery Address & Order Summary */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-success text-white py-3">
              <h5 className="fw-bold mb-0">📍 Delivery & Payment Details</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handlePlaceOrder}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Receiver Name *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={delivery.name}
                        onChange={(e) => setDelivery({ ...delivery, name: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Phone Number *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={delivery.phone}
                        onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Village / Farm Address *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="e.g. Plot 12, Khed Shivapur Road"
                    value={delivery.village}
                    onChange={(e) => setDelivery({ ...delivery, village: e.target.value })}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">District *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={delivery.district}
                        onChange={(e) => setDelivery({ ...delivery, district: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">State *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={delivery.state}
                        onChange={(e) => setDelivery({ ...delivery, state: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">Pincode *</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={delivery.pincode}
                        onChange={(e) => setDelivery({ ...delivery, pincode: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold">Payment Option</Form.Label>
                  <Form.Select
                    value={delivery.paymentMethod}
                    onChange={(e) => setDelivery({ ...delivery, paymentMethod: e.target.value })}
                  >
                    <option value="cod">Cash on Delivery (Pay upon delivery)</option>
                    <option value="online">Online / UPI (Pay at dispatch)</option>
                  </Form.Select>
                </Form.Group>

                <div className="border-top pt-3 my-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subsidized Delivery:</span>
                    <span className="text-success fw-bold">FREE</span>
                  </div>
                  <div className="d-flex justify-content-between fs-4 fw-bold text-success border-top pt-2">
                    <span>Total Amount:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  variant="success"
                  type="submit"
                  size="lg"
                  className="w-100 fw-bold py-2 shadow-sm"
                  disabled={placing}
                >
                  {placing ? 'Placing Order...' : 'Confirm & Place Order →'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;


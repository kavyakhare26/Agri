import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/orders?status=${statusFilter}` : '/orders';
      const res = await API.get(url);
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <Badge bg="success" className="px-3 py-1 text-uppercase">Delivered</Badge>;
      case 'shipped':
        return <Badge bg="primary" className="px-3 py-1 text-uppercase">In Transit / Shipped</Badge>;
      case 'confirmed':
        return <Badge bg="info" text="dark" className="px-3 py-1 text-uppercase">Confirmed</Badge>;
      case 'cancelled':
        return <Badge bg="danger" className="px-3 py-1 text-uppercase">Cancelled</Badge>;
      default:
        return <Badge bg="warning" text="dark" className="px-3 py-1 text-uppercase">Pending</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">📦 My Orders & Tracking</h2>
          <p className="text-muted mb-0">Track delivery status, view invoices, and item details</p>
        </div>
        <div style={{ minWidth: '180px' }}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">📦</div>
            <h5>No orders found</h5>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Link to="/store" className="btn btn-success">Browse Products</Link>
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => (
            <Card key={order._id} className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <span className="fw-bold text-dark me-2">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <small className="text-muted">
                    Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                  </small>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={8}>
                    <h6 className="fw-bold mb-3">Purchased Items:</h6>
                    <Table responsive hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Unit Price</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((it, idx) => (
                          <tr key={idx}>
                            <td className="fw-medium text-success">{it.name}</td>
                            <td>₹{it.price}</td>
                            <td>{it.quantity}</td>
                            <td className="fw-bold">₹{((it.price || 0) * (it.quantity || 1)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>

                  <Col md={4} className="border-start-md ps-md-4">
                    <h6 className="fw-bold mb-3">Delivery Address:</h6>
                    <div className="bg-light p-3 rounded small mb-3">
                      <div className="fw-bold text-dark">{order.deliveryAddress?.name}</div>
                      <div>📞 {order.deliveryAddress?.phone}</div>
                      <div>📍 {order.deliveryAddress?.village}</div>
                      <div>
                        {order.deliveryAddress?.district}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                      </div>
                      <div className="mt-2 text-uppercase text-secondary">
                        Payment: <strong>{order.paymentMethod}</strong>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-baseline border-top pt-2">
                      <span className="fw-bold">Order Total:</span>
                      <span className="fs-4 fw-bold text-success">₹{order.totalAmount?.toLocaleString()}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export default Orders;


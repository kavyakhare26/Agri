import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Table, Button, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const [key, setKey] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [resources, setResources] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const [resourceForm, setResourceForm] = useState({
    name: '',
    category: 'seed',
    price: '',
    unit: 'per kg',
    stock: 100,
    brand: '',
    description: '',
  });

  const [alertForm, setAlertForm] = useState({
    title: '',
    description: '',
    severity: 'high',
    type: 'fungal',
    region: 'Punjab',
    affectedCrops: 'Wheat, Rice',
  });

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load platform stats');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get('/admin/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    }
  };

  const fetchResources = async () => {
    try {
      const res = await API.get('/resources');
      setResources(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load resources');
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await API.get('/admin/pest-alerts');
      setAlerts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load alerts');
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchOrders(), fetchResources(), fetchAlerts()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  // Handlers
  const handleToggleUserStatus = async (user) => {
    try {
      await API.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await API.post('/resources', {
        ...resourceForm,
        price: parseFloat(resourceForm.price),
        stock: parseInt(resourceForm.stock),
      });
      toast.success('Resource added to store!');
      setShowResourceModal(false);
      setResourceForm({ name: '', category: 'seed', price: '', unit: 'per kg', stock: 100, brand: '', description: '' });
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding resource');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource from the store?')) return;
    try {
      await API.delete(`/resources/${id}`);
      toast.success('Resource removed');
      fetchResources();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pest-alerts', {
        title: alertForm.title,
        description: alertForm.description,
        severity: alertForm.severity,
        type: alertForm.type,
        region: alertForm.region,
        affectedCrops: alertForm.affectedCrops.split(',').map((c) => c.trim()),
      });
      toast.success('Official pest alert broadcasted');
      setShowAlertModal(false);
      setAlertForm({ title: '', description: '', severity: 'high', type: 'fungal', region: 'Punjab', affectedCrops: 'Wheat, Rice' });
      fetchAlerts();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Delete this pest alert?')) return;
    try {
      await API.delete(`/pest-alerts/${id}`);
      toast.success('Alert deleted');
      fetchAlerts();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  if (loading) return <LoadingSpinner />;

  // Chart data
  const statsChartData = {
    labels: ['Registered Farmers', 'Active Farms', 'Crops Planted', 'Store Orders', 'Catalog Products'],
    datasets: [
      {
        label: 'Platform Totals',
        data: [
          stats?.users || 0,
          stats?.farms || 0,
          stats?.crops || 0,
          stats?.orders || 0,
          stats?.resources || 0,
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.7)',
          'rgba(23, 162, 184, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(0, 123, 255, 0.7)',
          'rgba(111, 66, 193, 0.7)',
        ],
      },
    ],
  };

  const orderDoughnutData = {
    labels: ['Pending Orders', 'Delivered / Completed'],
    datasets: [
      {
        data: [stats?.pendingOrders || 0, Math.max(0, (stats?.orders || 0) - (stats?.pendingOrders || 0))],
        backgroundColor: ['#ffc107', '#28a745'],
      },
    ],
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-success mb-1">👑 AgriConnect Admin Console</h2>
          <p className="text-muted mb-0">Platform telemetry, user role authorization, agricultural catalog, and logistics</p>
        </div>
      </div>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-4">
        {/* TAB 1: Platform Stats */}
        <Tab eventKey="stats" title="📊 Statistics & Telemetry">
          {/* Top Metrics Cards */}
          <Row className="g-3 mb-4">
            <Col sm={6} md={3}>
              <Card className="border-0 shadow-sm p-3 text-center border-start border-4 border-success">
                <small className="text-muted">Total Users</small>
                <h3 className="fw-bold text-success mb-0">{stats?.users || 0}</h3>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="border-0 shadow-sm p-3 text-center border-start border-4 border-primary">
                <small className="text-muted">Registered Farms</small>
                <h3 className="fw-bold text-primary mb-0">{stats?.farms || 0}</h3>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="border-0 shadow-sm p-3 text-center border-start border-4 border-warning">
                <small className="text-muted">Orders Handled</small>
                <h3 className="fw-bold text-warning mb-0">{stats?.orders || 0}</h3>
              </Card>
            </Col>
            <Col sm={6} md={3}>
              <Card className="border-0 shadow-sm p-3 text-center border-start border-4 border-danger">
                <small className="text-muted">Active Alerts</small>
                <h3 className="fw-bold text-danger mb-0">{stats?.pestAlerts || 0}</h3>
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row className="g-4">
            <Col md={8}>
              <Card className="border-0 shadow-sm p-4">
                <h6 className="fw-bold text-success mb-3">Overall Platform Scale</h6>
                <Bar data={statsChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-between">
                <h6 className="fw-bold text-success mb-3">Order Fulfillment Ratio</h6>
                <div style={{ maxWidth: '240px', margin: '0 auto' }}>
                  <Doughnut data={orderDoughnutData} />
                </div>
                <div className="text-center mt-3 small text-muted">
                  Pending: {stats?.pendingOrders || 0} | Total Revenue: ₹{stats?.totalRevenue?.toLocaleString() || 0}
                </div>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* TAB 2: Users Management */}
        <Tab eventKey="users" title="👥 User Management">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">Platform Accounts ({users.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>State</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-semibold text-dark">{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <Badge bg={u.role === 'admin' ? 'danger' : 'success'} className="text-capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td>{u.state || 'India'}</td>
                      <td>
                        <Badge bg={u.isActive ? 'success' : 'secondary'}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant={u.isActive ? 'outline-warning' : 'outline-success'}
                            onClick={() => handleToggleUserStatus(u)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 3: Store & Catalog */}
        <Tab eventKey="resources" title="🛒 Product Catalog">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Store Resources ({resources.length})</h5>
              <Button size="sm" variant="success" onClick={() => setShowResourceModal(true)}>
                + Add Product
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Unit</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="fw-bold text-dark">{r.name}</div>
                        <small className="text-muted">{r.brand}</small>
                      </td>
                      <td><Badge bg="secondary" className="text-capitalize">{r.category}</Badge></td>
                      <td className="fw-bold text-success">₹{r.price}</td>
                      <td>{r.unit}</td>
                      <td>
                        <Badge bg={r.stock > 20 ? 'success' : 'danger'}>{r.stock} units</Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteResource(r._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 4: Orders Management */}
        <Tab eventKey="orders" title="📦 Orders & Logistics">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="fw-bold mb-0">Platform Orders ({orders.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Destination</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="fw-bold">#{o._id.slice(-6).toUpperCase()}</td>
                      <td>
                        <div className="fw-semibold">{o.farmer?.name || 'Farmer'}</div>
                        <small className="text-muted">{o.farmer?.phone || o.deliveryAddress?.phone}</small>
                      </td>
                      <td>{o.deliveryAddress?.district}, {o.deliveryAddress?.state}</td>
                      <td className="fw-bold text-success">₹{o.totalAmount?.toLocaleString()}</td>
                      <td>
                        <Badge bg={o.status === 'delivered' ? 'success' : o.status === 'pending' ? 'warning' : 'primary'}>
                          {o.status}
                        </Badge>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          style={{ maxWidth: '140px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* TAB 5: Alerts Broadcast */}
        <Tab eventKey="alerts" title="🚨 Pest Advisories">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Pest Alert Management ({alerts.length})</h5>
              <Button size="sm" variant="danger" onClick={() => setShowAlertModal(true)}>
                + Broadcast Advisory
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Threat Type</th>
                    <th>Region</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a._id}>
                      <td className="fw-bold text-dark">{a.title}</td>
                      <td>
                        <Badge bg={a.severity === 'critical' ? 'danger' : a.severity === 'high' ? 'warning' : 'success'}>
                          {a.severity}
                        </Badge>
                      </td>
                      <td className="text-capitalize">{a.type}</td>
                      <td>{a.region || 'India'}</td>
                      <td>
                        <Badge bg={a.autoGenerated ? 'info' : 'dark'}>
                          {a.autoGenerated ? 'Weather Triggered' : 'Admin Broadcast'}
                        </Badge>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteAlert(a._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Add Product Modal */}
      <Modal show={showResourceModal} onHide={() => setShowResourceModal(false)} centered>
        <Form onSubmit={handleCreateResource}>
          <Modal.Header closeButton>
            <Modal.Title>Add Store Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Bio-NPK Granules"
                value={resourceForm.name}
                onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
              />
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    value={resourceForm.category}
                    onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                  >
                    <option value="seed">Seed</option>
                    <option value="fertilizer">Fertilizer</option>
                    <option value="pesticide">Pesticide / Fungicide</option>
                    <option value="tool">Tool / Equipment</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. IFFCO, Bayer"
                    value={resourceForm.brand}
                    onChange={(e) => setResourceForm({ ...resourceForm, brand: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    required
                    value={resourceForm.price}
                    onChange={(e) => setResourceForm({ ...resourceForm, price: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Unit *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    placeholder="per kg / per bag"
                    value={resourceForm.unit}
                    onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Initial Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    value={resourceForm.stock}
                    onChange={(e) => setResourceForm({ ...resourceForm, stock: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResourceModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Create Resource</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Broadcast Alert Modal */}
      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)} centered>
        <Form onSubmit={handleCreateAlert}>
          <Modal.Header closeButton>
            <Modal.Title>Broadcast Pest & Disease Advisory</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Alert Title *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Yellow Rust Outbreak Warning"
                value={alertForm.title}
                onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
              />
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Severity</Form.Label>
                  <Form.Select
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                  >
                    <option value="low">Low / Notice</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Threat Type</Form.Label>
                  <Form.Select
                    value={alertForm.type}
                    onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                  >
                    <option value="fungal">Fungal</option>
                    <option value="bacterial">Bacterial</option>
                    <option value="insect">Insect</option>
                    <option value="weed">Weed</option>
                    <option value="flood">Flood</option>
                    <option value="drought">Drought</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Region / State *</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={alertForm.region}
                    onChange={(e) => setAlertForm({ ...alertForm, region: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Affected Crops</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Wheat, Mustard, etc."
                    value={alertForm.affectedCrops}
                    onChange={(e) => setAlertForm({ ...alertForm, affectedCrops: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Advisory Description & Treatment Steps *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                value={alertForm.description}
                onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAlertModal(false)}>Cancel</Button>
            <Button variant="danger" type="submit">Broadcast Alert</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminDashboard;


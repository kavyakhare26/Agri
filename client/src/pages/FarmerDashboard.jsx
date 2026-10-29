import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

function StatCard({ icon, label, value, color, link }) {
  const card = (
    <Card className="h-100 border-0 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
      <Card.Body className="d-flex align-items-center gap-3">
        <div style={{ fontSize: '2.5rem' }}>{icon}</div>
        <div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color }}>{value}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </Card.Body>
    </Card>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

function FarmerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [farmsRes, cropsRes, alertsRes, ordersRes] = await Promise.allSettled([
          API.get('/farms'),
          API.get('/crops'),
          API.get('/pest-alerts?limit=3'),
          API.get('/orders?limit=5'),
        ]);

        const farms = farmsRes.status === 'fulfilled' ? (farmsRes.value.data?.data || []) : [];
        const crops = cropsRes.status === 'fulfilled' ? (cropsRes.value.data?.data || []) : [];
        const pestAlerts = alertsRes.status === 'fulfilled' ? (alertsRes.value.data?.data || []) : [];
        const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || []) : [];

        setStats({
          farms: farms.length,
          crops: crops.length,
          alerts: pestAlerts.length,
          orders: orders.filter((o) => o.status === 'pending').length,
        });

        setAlerts(pestAlerts.slice(0, 3));
        setRecentActivity(orders.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
        setStats({ farms: 0, crops: 0, alerts: 0, orders: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const quickActions = [
    { label: 'Add Farm', icon: '🏡', link: '/farms', color: 'success' },
    { label: 'Add Crop', icon: '🌱', link: '/crops', color: 'success' },
    { label: 'Check Weather', icon: '🌤️', link: '/weather', color: 'info' },
    { label: 'Visit Store', icon: '🛒', link: '/store', color: 'warning' },
    { label: 'Ask Expert', icon: '👨‍💼', link: '/consultation', color: 'primary' },
    { label: 'Soil Report', icon: '🧪', link: '/soil', color: 'secondary' },
  ];

  if (loading) return <div className="loading-overlay"><LoadingSpinner /></div>;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header border-bottom bg-white py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h2 className="mb-0">
                👋 Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</span>!
              </h2>
              <p className="text-muted mb-0 mt-1">Here&apos;s your smart farm overview for today</p>
            </Col>
            <Col xs="auto">
              <Badge bg="success" className="px-3 py-2">
                📍 {user?.state || 'India'}
              </Badge>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats Cards */}
        <Row className="g-3 mb-4">
          <Col xs={6} lg={3}>
            <StatCard icon="🏡" label="Registered Farms" value={stats?.farms ?? 0}
              color="var(--primary)" link="/farms" />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard icon="🌾" label="Monitored Crops" value={stats?.crops ?? 0}
              color="#52b788" link="/crops" />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard icon="⚠️" label="Active Alerts" value={stats?.alerts ?? 0}
              color="#f4a261" link="/pest-alerts" />
          </Col>
          <Col xs={6} lg={3}>
            <StatCard icon="📦" label="Pending Orders" value={stats?.orders ?? 0}
              color="#4895ef" link="/orders" />
          </Col>
        </Row>

        <Row className="g-4">
          {/* Quick Actions */}
          <Col lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-success text-white py-3 fw-bold">⚡ Quick Actions</Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      as={Link}
                      to={action.link}
                      variant={`outline-${action.color}`}
                      size="sm"
                      className="d-flex align-items-center gap-1 py-2 px-3 fw-medium"
                    >
                      <span>{action.icon}</span> {action.label}
                    </Button>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Pest Alerts */}
          <Col lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center fw-bold">
                <span>🐛 Regional Disease Alerts</span>
                <Link to="/pest-alerts" className="text-success text-decoration-none small">View all →</Link>
              </Card.Header>
              <Card.Body>
                {alerts.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <div style={{ fontSize: '2rem' }}>✅</div>
                    <p className="mb-0">No active hazard alerts!</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert._id} className="d-flex align-items-start gap-2 mb-3 pb-2 border-bottom">
                      <Badge bg={alert.severity === 'critical' ? 'danger' : 'warning'} className="text-capitalize">
                        {alert.severity}
                      </Badge>
                      <div>
                        <div className="fw-semibold small text-dark">{alert.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {alert.region} • {alert.affectedCrops?.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Orders */}
          <Col lg={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center fw-bold">
                <span>📦 Store Orders</span>
                <Link to="/orders" className="text-success text-decoration-none small">View all →</Link>
              </Card.Header>
              <Card.Body>
                {recentActivity.length === 0 ? (
                  <div className="text-center text-muted py-3">
                    <div style={{ fontSize: '2rem' }}>🛒</div>
                    <p className="mb-0">No recent orders</p>
                    <Link to="/store" className="btn btn-sm btn-success mt-2">Shop Store</Link>
                  </div>
                ) : (
                  recentActivity.map((order) => (
                    <div key={order._id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div>
                        <div className="small fw-semibold">Order #{order._id?.slice(-6).toUpperCase()}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <Badge bg={
                        order.status === 'delivered' ? 'success' :
                        order.status === 'shipped' ? 'info' :
                        order.status === 'confirmed' ? 'primary' :
                        order.status === 'cancelled' ? 'danger' : 'warning'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tips */}
        <Card className="mt-4 border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #d8f3dc, #b7e4c7)' }}>
          <Card.Body className="d-flex align-items-center gap-3">
            <div style={{ fontSize: '2.5rem' }}>💡</div>
            <div>
              <strong className="text-dark">Scientific Agronomy Tip:</strong>{' '}
              <span className="text-secondary">
                Applying bio-fertilizers (Rhizobium & Azotobacter) enhances soil nitrogen fixation and reduces reliance on synthetic urea by up to 25%.
              </span>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default FarmerDashboard;

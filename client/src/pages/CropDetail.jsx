import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const STAGES = [
  'seed',
  'germination',
  'vegetative',
  'flowering',
  'fruiting',
  'ripening',
  'harvested',
];

function CropDetail() {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const [activityForm, setActivityForm] = useState({
    type: 'watering',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchCrop = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/crops/${id}`);
      setCrop(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const handleUpdateStage = async (newStage) => {
    try {
      await API.put(`/crops/${id}`, { growthStage: newStage });
      toast.success(`Stage updated to ${newStage}`);
      fetchCrop();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/crops/${id}/activities`, activityForm);
      toast.success('Activity logged to timeline');
      setShowActivityModal(false);
      setActivityForm({
        type: 'watering',
        note: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchCrop();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!crop) return <Container className="py-5 text-center"><h4>Crop not found</h4></Container>;

  const currentStageIndex = STAGES.indexOf(crop.growthStage);
  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'watering': return '💧';
      case 'fertilizing': return '🧪';
      case 'pest_control': return '🛡️';
      case 'planting': return '🌱';
      case 'harvesting': return '🌾';
      case 'observation': return '🔍';
      default: return '📝';
    }
  };

  return (
    <Container className="py-4">
      <Link to="/crops" className="text-decoration-none text-muted mb-3 d-inline-block">
        ← Back to Crops
      </Link>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">
            🌱 {crop.name} <small className="text-muted fs-5">({crop.variety || 'Standard'})</small>
          </h2>
          <p className="text-muted mb-0">
            Plot: <strong>{crop.farm?.name || 'Assigned Farm'}</strong> | Area: {crop.areaHectares || '—'} Ha
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setShowActivityModal(true)}>
            + Log Activity
          </Button>
        </div>
      </div>

      {/* Growth Stage Tracker */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Growth Stage Progression</h5>
            <span className="badge bg-success fs-6 text-capitalize px-3 py-2">
              Current: {crop.growthStage} ({progressPercent}%)
            </span>
          </div>

          <ProgressBar now={progressPercent} variant="success" className="mb-4" style={{ height: '10px' }} />

          <div className="d-flex flex-wrap justify-content-between gap-2">
            {STAGES.map((stage, idx) => {
              const isPast = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <Button
                  key={stage}
                  size="sm"
                  variant={isCurrent ? 'success' : isPast ? 'outline-success' : 'outline-secondary'}
                  className="text-capitalize px-3"
                  onClick={() => handleUpdateStage(stage)}
                >
                  {isCurrent && '✓ '}
                  {stage}
                </Button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Field Details & Dates */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <h6 className="text-muted small">Planted On</h6>
            <h5 className="fw-bold text-dark">
              {crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : 'Not Set'}
            </h5>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <h6 className="text-muted small">Expected Harvest Date</h6>
            <h5 className="fw-bold text-success">
              {crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString() : 'Not Set'}
            </h5>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <h6 className="text-muted small">Field Notes</h6>
            <p className="text-secondary small mb-0">{crop.notes || 'No notes added for this crop.'}</p>
          </Card>
        </Col>
      </Row>

      {/* Activity Timeline */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">📅 Crop Activity Log Timeline</h5>
          <Button size="sm" variant="outline-success" onClick={() => setShowActivityModal(true)}>
            + Log Event
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          {!crop.activityLog || crop.activityLog.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No activity logged yet. Keep track of irrigation, fertilizers, sprays, and observations.</p>
              <Button size="sm" variant="success" onClick={() => setShowActivityModal(true)}>
                Record First Event
              </Button>
            </div>
          ) : (
            <div className="timeline">
              {[...crop.activityLog].reverse().map((act, index) => (
                <div key={index} className="d-flex gap-3 mb-4 border-start border-3 border-success ps-3">
                  <div className="fs-3">{getActivityIcon(act.type)}</div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong className="text-capitalize text-success">{act.type.replace('_', ' ')}</strong>
                      <small className="text-muted">
                        {act.date ? new Date(act.date).toLocaleDateString() : 'Recent'}
                      </small>
                    </div>
                    <p className="mb-1 text-dark">{act.note || 'Activity performed.'}</p>
                    {act.performedBy?.name && (
                      <small className="text-muted">Logged by: {act.performedBy.name}</small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Log Activity Modal */}
      <Modal show={showActivityModal} onHide={() => setShowActivityModal(false)} centered>
        <Form onSubmit={handleAddActivity}>
          <Modal.Header closeButton>
            <Modal.Title>Log Crop Field Activity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Activity Type *</Form.Label>
              <Form.Select
                value={activityForm.type}
                onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
              >
                <option value="watering">💧 Watering / Irrigation</option>
                <option value="fertilizing">🧪 Fertilizer Application</option>
                <option value="pest_control">🛡️ Pest / Disease Spray</option>
                <option value="observation">🔍 Scouting / Growth Observation</option>
                <option value="planting">🌱 Sowing / Re-planting</option>
                <option value="harvesting">🌾 Harvesting</option>
                <option value="other">📝 Other Activity</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date Performed</Form.Label>
              <Form.Control
                type="date"
                required
                value={activityForm.date}
                onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes & Observations *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                required
                placeholder="e.g. Applied 50kg Urea per acre, observed good tiller formation..."
                value={activityForm.note}
                onChange={(e) => setActivityForm({ ...activityForm, note: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowActivityModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Save Activity</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default CropDetail;


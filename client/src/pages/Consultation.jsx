import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Accordion, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['soil', 'crop', 'pest', 'weather', 'market', 'equipment', 'other'];

function Consultation() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAskModal, setShowAskModal] = useState(false);
  const [replyTexts, setReplyTexts] = useState({});

  const [form, setForm] = useState({
    title: '',
    question: '',
    category: 'crop',
    tags: '',
  });

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'admin' || user?.role === 'expert' ? '/consultations/all' : '/consultations';
      const res = await API.get(endpoint);
      setConsultations(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        question: form.question,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      };
      await API.post('/consultations', payload);
      toast.success('Consultation question submitted! Our agronomists will review.');
      setShowAskModal(false);
      setForm({ title: '', question: '', category: 'crop', tags: '' });
      fetchConsultations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting question');
    }
  };

  const handleAddReply = async (consId) => {
    const text = replyTexts[consId]?.trim();
    if (!text) return;

    try {
      await API.post(`/consultations/${consId}/replies`, { content: text });
      toast.success('Reply submitted');
      setReplyTexts({ ...replyTexts, [consId]: '' });
      fetchConsultations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting reply');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'answered':
        return <Badge bg="success" className="px-3 py-1">Answered by Expert</Badge>;
      case 'closed':
        return <Badge bg="secondary" className="px-3 py-1">Closed</Badge>;
      default:
        return <Badge bg="warning" text="dark" className="px-3 py-1">Awaiting Expert</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">👨‍🌾 Expert Agronomist Consultation</h2>
          <p className="text-muted mb-0">Ask agronomy questions, diagnose crop diseases, and get certified advice</p>
        </div>
        <Button variant="success" className="px-4 py-2 fw-semibold" onClick={() => setShowAskModal(true)}>
          + Ask Expert Question
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : consultations.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">💬</div>
            <h5>No Consultations Yet</h5>
            <p className="text-muted">Have a query about soil, pests, seeds, or irrigation? Ask our agricultural specialists.</p>
            <Button variant="success" onClick={() => setShowAskModal(true)}>Submit Your First Question</Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {consultations.map((c) => (
            <Card key={c._id} className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="secondary" className="text-capitalize">{c.category}</Badge>
                  <span className="fw-bold fs-5 text-dark">{c.title}</span>
                </div>
                <div>{getStatusBadge(c.status)}</div>
              </Card.Header>
              <Card.Body className="p-4">
                <p className="text-dark fs-6 mb-3">{c.question}</p>

                {c.tags?.length > 0 && (
                  <div className="d-flex gap-1 mb-3 flex-wrap">
                    {c.tags.map((t, idx) => (
                      <Badge key={idx} bg="light" text="dark" className="border">
                        #{t}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="small text-muted mb-4 d-flex justify-content-between">
                  <span>Asked by: <strong>{c.farmer?.name || 'Farmer'}</strong></span>
                  <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}</span>
                </div>

                {/* Expert Replies Section */}
                <div className="border-top pt-3">
                  <h6 className="fw-bold mb-3 text-success">
                    💬 Responses & Agronomist Solutions ({c.replies?.length || 0}):
                  </h6>

                  {c.replies?.length === 0 ? (
                    <p className="text-muted small">No replies yet. An agricultural officer will respond shortly.</p>
                  ) : (
                    <div className="d-flex flex-column gap-3 mb-3">
                      {c.replies.map((r, rIdx) => (
                        <div
                          key={rIdx}
                          className={`p-3 rounded ${r.isExpert ? 'bg-success bg-opacity-10 border-start border-4 border-success' : 'bg-light'}`}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-dark">
                              {r.author?.name || 'Consultant'}
                              {r.isExpert && (
                                <Badge bg="success" className="ms-2 small">
                                  ✓ Certified Agronomist
                                </Badge>
                              )}
                            </span>
                          </div>
                          <p className="mb-0 text-secondary">{r.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  <InputGroup className="mt-3">
                    <Form.Control
                      type="text"
                      placeholder="Write an agronomic recommendation or follow-up note..."
                      value={replyTexts[c._id] || ''}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [c._id]: e.target.value })}
                    />
                    <Button variant="success" onClick={() => handleAddReply(c._id)}>
                      Send Reply
                    </Button>
                  </InputGroup>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      <Modal show={showAskModal} onHide={() => setShowAskModal(false)} centered size="lg">
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title>Ask an Agronomist / Expert</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question Subject / Title *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Yellow stripe rust appearing on wheat crop"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="text-capitalize">{c}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Detailed Question / Symptoms *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                placeholder="Describe leaf symptoms, plant age, watering frequency, recent fertilizers, and weather..."
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. wheat, rust, punjab, fungicide"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAskModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Submit Question</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Consultation;


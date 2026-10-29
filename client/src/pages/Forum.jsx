import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const FORUM_CATEGORIES = [
  { id: '', label: 'All Discussions' },
  { id: 'general', label: 'General Agri' },
  { id: 'crop', label: 'Crops & Yield' },
  { id: 'soil', label: 'Soil Health' },
  { id: 'pest', label: 'Pest Management' },
  { id: 'equipment', label: 'Machinery & Solar' },
  { id: 'market', label: 'Mandi Rates' },
];

function Forum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentInput, setCommentInput] = useState({});

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: '',
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const res = await API.get(`/forum?${params.toString()}`);
      setPosts(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load forum discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, search]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
      };
      await API.post('/forum', payload);
      toast.success('Discussion posted successfully!');
      setShowNewModal(false);
      setForm({ title: '', content: '', category: 'general', tags: '' });
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error posting to forum');
    }
  };

  const handleLike = async (postId, e) => {
    e.stopPropagation();
    try {
      const res = await API.put(`/forum/${postId}/like`);
      // Update local state
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: res.data.data.likes } : p))
      );
    } catch (err) {
      toast.error('Failed to toggle like');
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInput[postId]?.trim();
    if (!text) return;

    try {
      const res = await API.post(`/forum/${postId}/comments`, { content: text });
      toast.success('Comment posted');
      setCommentInput({ ...commentInput, [postId]: '' });
      setExpandedPost(res.data.data);
      fetchPosts();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleViewPost = async (postId) => {
    if (expandedPost?._id === postId) {
      setExpandedPost(null);
      return;
    }
    try {
      const res = await API.get(`/forum/${postId}`);
      setExpandedPost(res.data.data);
    } catch (err) {
      toast.error('Failed to load post details');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-success mb-1">🌾 Farmer Community Forum</h2>
          <p className="text-muted mb-0">Exchange local farming wisdom, market prices, subsidies, and regional techniques</p>
        </div>
        <Button variant="success" className="px-4 py-2 fw-semibold" onClick={() => setShowNewModal(true)}>
          + Start Discussion
        </Button>
      </div>

      {/* Categories & Search */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={8}>
              <div className="d-flex gap-2 flex-wrap">
                {FORUM_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={category === cat.id ? 'success' : 'outline-secondary'}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </Col>
            <Col md={4}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search forum topics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Posts List */}
      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <Card className="text-center p-5 border-dashed">
          <Card.Body>
            <div className="fs-1 mb-3">💬</div>
            <h5>No Discussions Found</h5>
            <p className="text-muted">Be the first to share advice or ask a question in this topic.</p>
            <Button variant="success" onClick={() => setShowNewModal(true)}>Create Post</Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.map((post) => {
            const isLiked = post.likes?.some((id) => id === user?._id || id?._id === user?._id);
            const isExpanded = expandedPost?._id === post._id;

            return (
              <Card key={post._id} className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Badge bg="secondary" className="text-capitalize me-2">
                        {post.category}
                      </Badge>
                      {post.isPinned && <Badge bg="warning" text="dark" className="me-2">📌 Pinned</Badge>}
                    </div>
                    <small className="text-muted">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recent'}
                    </small>
                  </div>

                  <h5 className="fw-bold text-dark mb-2" style={{ cursor: 'pointer' }} onClick={() => handleViewPost(post._id)}>
                    {post.title}
                  </h5>

                  <p className="text-secondary mb-3">{post.content}</p>

                  {post.tags?.length > 0 && (
                    <div className="d-flex gap-1 mb-3 flex-wrap">
                      {post.tags.map((t, idx) => (
                        <Badge key={idx} bg="light" text="dark" className="border">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <div className="small text-muted">
                      Posted by <strong>{post.author?.name || 'Farmer'}</strong> ({post.author?.state || 'India'})
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                      <Button
                        size="sm"
                        variant={isLiked ? 'success' : 'outline-secondary'}
                        onClick={(e) => handleLike(post._id, e)}
                      >
                        👍 {post.likes?.length || 0}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => handleViewPost(post._id)}
                      >
                        💬 {isExpanded ? 'Hide Comments' : 'Comments'}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Comments Section */}
                  {isExpanded && (
                    <div className="border-top pt-3 mt-3 bg-light p-3 rounded">
                      <h6 className="fw-bold mb-3">Comments:</h6>
                      {expandedPost.comments?.length === 0 ? (
                        <p className="text-muted small">No comments yet. Share your experience!</p>
                      ) : (
                        <div className="d-flex flex-column gap-2 mb-3">
                          {expandedPost.comments?.map((c, cIdx) => (
                            <div key={cIdx} className="bg-white p-3 rounded border">
                              <div className="d-flex justify-content-between">
                                <strong className="text-success small">{c.author?.name || 'Community Member'}</strong>
                              </div>
                              <p className="mb-0 text-dark small mt-1">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <InputGroup className="mt-2">
                        <Form.Control
                          type="text"
                          placeholder="Write a helpful response..."
                          value={commentInput[post._id] || ''}
                          onChange={(e) => setCommentInput({ ...commentInput, [post._id]: e.target.value })}
                        />
                        <Button variant="success" onClick={() => handleAddComment(post._id)}>
                          Comment
                        </Button>
                      </InputGroup>
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      {/* Start Discussion Modal */}
      <Modal show={showNewModal} onHide={() => setShowNewModal(false)} centered size="lg">
        <Form onSubmit={handleCreatePost}>
          <Modal.Header closeButton>
            <Modal.Title>Start Community Discussion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Topic Title *</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="e.g. Subsidy on Solar Pumps in Maharashtra 2024"
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
                {FORUM_CATEGORIES.filter((c) => c.id).map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content / Details *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                required
                placeholder="Share your question, experience, or tip in detail..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. wheat, solar, subsidy, drip"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>Cancel</Button>
            <Button variant="success" type="submit">Publish Discussion</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default Forum;


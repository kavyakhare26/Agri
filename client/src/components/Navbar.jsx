import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import i18n from '../i18n';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

function NavbarComponent() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm border-bottom">
      <Container fluid="xl">
        <Navbar.Brand as={Link} to="/">
          🌾 AgriConnect
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={NavLink} to="/dashboard">{t('nav.dashboard')}</Nav.Link>
                <Nav.Link as={NavLink} to="/farms">{t('nav.farms')}</Nav.Link>
                <Nav.Link as={NavLink} to="/crops">{t('nav.crops')}</Nav.Link>
                <Nav.Link as={NavLink} to="/soil">{t('nav.soil')}</Nav.Link>
                <Nav.Link as={NavLink} to="/weather">{t('nav.weather')}</Nav.Link>
                <Nav.Link as={NavLink} to="/pest-alerts">{t('nav.pests')}</Nav.Link>
                <Nav.Link as={NavLink} to="/store">{t('nav.store')}</Nav.Link>
                <Nav.Link as={NavLink} to="/forum">{t('nav.forum')}</Nav.Link>
                <Nav.Link as={NavLink} to="/consultation">{t('nav.consultation')}</Nav.Link>
                {user?.role === 'admin' && (
                  <Nav.Link as={NavLink} to="/admin">{t('nav.admin')}</Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav className="align-items-center gap-2">
            {/* Language Switcher */}
            <NavDropdown title={`🌐 ${currentLang.label}`} id="lang-dropdown" align="end">
              {languages.map((lang) => (
                <NavDropdown.Item
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  active={i18n.language === lang.code}
                >
                  {lang.label}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                <Nav.Link as={NavLink} to="/cart" className="position-relative">
                  🛒
                  {itemCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute"
                      style={{ top: 0, right: 0, fontSize: '0.65rem' }}
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Nav.Link>

                <NavDropdown
                  title={`👤 ${user?.name?.split(' ')[0] || 'User'}`}
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={NavLink} to="/orders">{t('nav.orders')}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    {t('nav.logout')}
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">{t('nav.login')}</Nav.Link>
                <Nav.Link
                  as={NavLink}
                  to="/register"
                  className="btn btn-primary text-white px-3 py-1 rounded"
                >
                  {t('nav.register')}
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;

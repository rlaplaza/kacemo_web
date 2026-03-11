import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    // Redirect to backend serverless function to initiate Google OAuth
    // Pass current path as state to redirect back after login
    const currentPath = window.location.pathname;
    window.location.href = `/api/auth/google?state=${currentPath}`;
  };

  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand className="navbar-brand">KACEMOS HOY</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Calendario</Nav.Link>
            </LinkContainer>
            {user && ( // Only show Add Event/Venue if authenticated
              <>
                <LinkContainer to="/add-event">
                  <Nav.Link>Añadir Evento</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/add-venue">
                  <Nav.Link>Añadir Lugar</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
          <Nav className="align-items-center gap-2">
            <button 
              className="theme-toggle me-2" 
              onClick={toggleTheme}
              title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user ? (
              <>
                <Navbar.Text className="me-3 d-none d-sm-block">
                  Sesión iniciada como: <span className="text-info">{user.name}</span>
                </Navbar.Text>
                <Button variant="outline-secondary" onClick={logout}>Cerrar Sesión</Button>
              </>
            ) : (
              <Button variant="outline-secondary" onClick={handleLogin}>Iniciar Sesión</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
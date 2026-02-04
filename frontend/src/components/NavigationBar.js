import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../AuthContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();

  const handleLogin = () => {
    // Redirect to backend serverless function to initiate Google OAuth
    // Pass current path as state to redirect back after login
    const currentPath = window.location.pathname;
    window.location.href = `/api/auth/google?state=${currentPath}`;
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>KACEMOS HOY COMPAE</Navbar.Brand>
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
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Sesión iniciada como: <span className="text-info">{user.name}</span>
                </Navbar.Text>
                <Button variant="outline-light" onClick={logout}>Cerrar Sesión</Button>
              </>
            ) : (
              <Button variant="outline-light" onClick={handleLogin}>Iniciar Sesión con Google</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
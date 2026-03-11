import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venueAddress, setVenueAddress] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // New state for image URL

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventsResponse = await axios.get('/api/events');
        const allIssues = eventsResponse.data;

        const foundIssue = allIssues.find(issue => issue.number.toString() === eventId);

        if (foundIssue) {
          const body = foundIssue.body || '';
          const title = foundIssue.title;

          const dateMatch = body.match(/^(\*\*Fecha:\*\*|Fecha:) (.*)/m);
          const timeMatch = body.match(/^(\*\*Hora:\*\*|Hora:) (.*)/m);
          const venueMatch = body.match(/^(\*\*Lugar:\*\*|Lugar:) (.*)/m);
          const visibleMatch = body.match(/^(\*\*Visible:\*\*|Visible:) (.*)/m);
          const descriptionMatch = body.match(/\*\*Descripción:\*\*\n(.*)/s);
          const posterMatch = body.match(/\*\*Póster:\*\* !\[Póster del evento\]\((.*)\)/); // Extract image URL

          const isVisible = visibleMatch ? visibleMatch[2].trim().toLowerCase() === 'true' : true;
          const eventDetails = {
            title: isVisible ? title : `[Privado] ${title}`,
            date: dateMatch ? dateMatch[2].trim() : 'N/A',
            time: timeMatch ? timeMatch[2].trim() : 'N/A',
            venue: venueMatch ? venueMatch[2].trim() : 'N/A',
            description: descriptionMatch ? descriptionMatch[1].trim() : 'N/A',
            imageUrl: posterMatch ? posterMatch[1].trim() : '', // Store image URL
            url: foundIssue.html_url
          };
          setEvent(eventDetails);
          setImageUrl(eventDetails.imageUrl);

          const venuesResponse = await axios.get('/api/venues');
          const venues = venuesResponse.data;
          const venueData = venues.find(v => v.name === eventDetails.venue);
          setVenueAddress(venueData ? venueData.address : 'Dirección no disponible');

        } else {
          setError('Evento no encontrado.');
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError('Error al cargar los detalles del evento.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <Card className="border-0">
            <Card.Header className="py-4">
              <h1 className="mb-0 text-center">{event.title}</h1>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {imageUrl && (
                <div className="mb-5 text-center">
                  <img 
                    src={imageUrl} 
                    alt="Póster del Evento" 
                    className="img-fluid shadow-lg" 
                    style={{ borderRadius: 'var(--radius-md)', maxHeight: '600px' }} 
                  />
                </div>
              )}
              
              <div className="event-details-grid">
                <Row className="mb-4">
                  <Col sm={6} className="mb-3 mb-sm-0">
                    <div className="detail-item">
                      <label className="form-label text-uppercase small">Fecha</label>
                      <div className="h5 mb-0">{event.date}</div>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="detail-item">
                      <label className="form-label text-uppercase small">Hora</label>
                      <div className="h5 mb-0">{event.time}</div>
                    </div>
                  </Col>
                </Row>

                <div className="detail-item mb-4">
                  <label className="form-label text-uppercase small">Lugar</label>
                  <div className="h5 mb-1">{event.venue}</div>
                  <div className="text-muted small">{venueAddress}</div>
                </div>

                <div className="detail-item mb-5">
                  <label className="form-label text-uppercase small">Descripción</label>
                  <p className="lead mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {event.description.replace(/\*\*Póster:\*\* !\[Póster del evento\]\(.*\)/, '').trim()}
                  </p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 pt-4 border-top">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => window.open(googleMapsUrl, "_blank")}
                >
                  Ver en Google Maps
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="lg"
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Ver en GitHub
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventDetailPage;
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap'; // Import Spinner and Card
import axios from 'axios';

const AddEventPage = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [visible, setVisible] = useState(true);
  const [imageFile, setImageFile] = useState(null); // New state for image file
  const [imageUrl, setImageUrl] = useState(''); // New state for uploaded image URL
  const [uploadingImage, setUploadingImage] = useState(false); // New state for upload status
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');
  const [venues, setVenues] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get('/api/venues');
        setVenues(response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImage(true); // Start image upload
    setImageUrl(''); // Clear previous image URL

    let finalImageUrl = '';

    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
        const uploadResponse = await axios.post('/api/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        finalImageUrl = uploadResponse.data.url;
        setImageUrl(finalImageUrl); // Store URL for display/confirmation
        setUploadingImage(false); // Image upload finished
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError.response ? uploadError.response.data : uploadError.message);
        setAlertVariant('danger');
        setAlertMessage('Error al subir la imagen. Por favor, inténtalo de nuevo.');
        setShowAlert(true);
        setUploadingImage(false);
        return; // Stop further submission if image upload fails
      }
    } else {
      setUploadingImage(false); // No image to upload
    }

    // Construct issue body with image URL and visibility if available
    const issueBody = `**Fecha:** ${date}
**Hora:** ${time}
**Lugar:** ${venue}
**Visible:** ${visible}
**Descripción:**
${description}
${finalImageUrl ? `**Póster:** ![Póster del evento](${finalImageUrl})` : ''}`; // Add image if URL exists

    try {
      const response = await axios.post('/api/events', {
        title: title,
        body: issueBody
      });

      if (response.status === 201) {
        setAlertVariant('success');
        setAlertMessage('¡Evento creado correctamente!');
        setShowAlert(true);
        // Clear all fields after successful submission
        setTitle('');
        setDate('');
        setTime('');
        setVenue('');
        setDescription('');
        setVisible(true);
        setImageFile(null);
        setImageUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setAlertVariant('danger');
      setAlertMessage('Error al crear el evento. Por favor, inténtalo de nuevo.');
      setShowAlert(true);
      console.error("Error creating event:", error);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="py-4 text-center">
              <h1 className="h2 mb-0">Añadir Nuevo Evento</h1>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              {showAlert && (
                <Alert 
                  variant={alertVariant} 
                  onClose={() => setShowAlert(false)} 
                  dismissible 
                  className="mb-4"
                >
                  {alertMessage}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formEventTitle">
                  <Form.Label>Título del Evento</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Ej: Concierto de Jazz" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required
                  />
                </Form.Group>

                <Row className="mb-4">
                  <Col md={6} className="mb-4 mb-md-0">
                    <Form.Group controlId="formEventDate">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="formEventTime">
                      <Form.Label>Hora</Form.Label>
                      <Form.Control 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formEventVenue">
                  <Form.Label>Lugar</Form.Label>
                  <Form.Select 
                    value={venue} 
                    onChange={(e) => setVenue(e.target.value)}
                    required
                  >
                    <option value="">Selecciona un lugar</option>
                    {venues.map((v, index) => (
                      <option key={index} value={v.name}>{v.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formEventVisible">
                  <Form.Check 
                    type="checkbox"
                    label="Visible para todos (si no se marca, solo lo verán usuarios autenticados)"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="small"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formEventDescription">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    placeholder="Detalles del evento, artistas, precios..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-5" controlId="formEventImage">
                  <Form.Label>Póster del Evento (opcional)</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      ref={fileInputRef}
                    />
                    {uploadingImage && <Spinner animation="border" size="sm" />}
                  </div>
                  {imageUrl && (
                    <div className="mt-2 small text-success">
                      ✓ Imagen lista: <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">Ver póster</a>
                    </div>
                  )}
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Subiendo imagen...' : 'Crear Evento'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddEventPage;

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]); // State to hold venues
  const navigate = useNavigate(); // Initialize useNavigate

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

    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');

        const parsedEvents = response.data.map(issue => {
          const body = issue.body;
          const title = issue.title;

          const dateMatch = body.match(/\*\*Date:\*\* (.*)/);
          const timeMatch = body.match(/\*\*Time:\*\* (.*)/);
          const venueMatch = body.match(/\*\*Venue:\*\* (.*)/);
          const descriptionMatch = body.match(/\*\*Description:\*\*\n(.*)/s);

          if (dateMatch && timeMatch) {
            const date = dateMatch[1].trim();
            const time = timeMatch[1].trim();
            const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm').toDate();

            return {
              title: title,
              start: start,
              end: start, // Assuming events are for a single moment
              allDay: false,
              resource: {
                venue: venueMatch ? venueMatch[1].trim() : '',
                description: descriptionMatch ? descriptionMatch[1].trim() : '',
                url: issue.html_url
              },
              id: issue.number // Add issue number as id for routing
            };
          }
          return null;
        }).filter(event => event !== null);

        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);
  
  const handleSelectEvent = (event) => {
    navigate(`/events/${event.id}`); // Navigate to EventDetailPage
  };

  return (
    <div>
      <h1>Calendario de Eventos</h1>
      <div style={{ height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
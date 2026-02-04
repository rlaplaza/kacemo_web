import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]); // State to hold venues

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
              }
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
    const venueName = event.resource.venue;
    const venue = venues.find(v => v.name === venueName);
    const address = venue ? venue.address : 'Address not found';
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div>
      <h1>Event Calendar</h1>
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
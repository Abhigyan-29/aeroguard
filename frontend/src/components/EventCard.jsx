import React from "react";

const EventCard = ({ event }) => {
  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
      <h3>{event.title}</h3>
      <p>Type: {event.categories[0]?.title}</p>
      <p>Date: {event.geometry[0]?.date}</p>
    </div>
  );
};

export default EventCard;
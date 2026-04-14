# AeroGuard

AeroGuard is a modern, premium SaaS application designed for disaster tracking and monitoring. By leveraging global datasets (such as the NASA EONET API and live news sources), AeroGuard provides timely alerts, historical heatmaps, and context-aware disaster reporting.

## Features
- **Disaster Tracking:** Real-time visibility into global natural events using the NASA EONET API.
- **Authentication System:** Secure user accounts via JWT, with the ability to maintain personalized watchlists.
- **Live News Integration:** Context-aware reporting with up-to-date news surrounding disasters.
- **Automated Alerts:** Email notification system for regional disaster monitoring.
- **Modern UI/UX:** A highly optimized dark-themed aesthetic providing a premium experience across desktop and mobile devices.

## Tech Stack
- **Frontend:** React, Tailwind CSS (or traditional CSS depending on features), and interactive mapping libraries.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB for user management and watchlist capabilities.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)
- NASA EONET API endpoint access

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhigyan-29/aeroguard.git
   cd aeroguard
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   Create a `.env` file in the `backend` folder with necessary environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, etc.).
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm start
   ```
   The application will generally run on `http://localhost:3000`.

## License
MIT License

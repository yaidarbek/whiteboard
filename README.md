# Real-time Collaborative Whiteboard

A web-based collaborative whiteboard using WebSocket for real-time communication and HTML5 Canvas for rendering.

## Features

- Real-time drawing synchronization
- Unique color assigned to each client
- WebSocket-based communication
- Automatic reconnection on network disruption
- Vanilla JavaScript frontend

## How to Run

### Prerequisites
- Node.js (for the backend server)

### Installation
1. Clone this repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Start the server: `node server.js`
5. Open `frontend/index.html` in your browser or visit `http://localhost:3000`

## Technical Explanation

### WebSocket Communication
1. **Connection**: Each client establishes a WebSocket connection to the server.
2. **Color Assignment**: The server assigns a random color to each client upon connection.
3. **Message Flow**:
   - When a user draws, the frontend sends mouse coordinates to the server.
   - The server broadcasts these coordinates to all connected clients.
   - Each client renders the received coordinates using the sender's color.

### Canvas Rendering
- The HTML5 Canvas API is used to draw lines based on mouse movements.
- Local drawing is immediately rendered, while remote drawings are rendered upon receiving WebSocket messages.

### State Synchronization
- The server acts as a message broker but doesn't maintain drawing state.
- New clients only see drawings made after they connect (for persistent state, you would need to implement a history mechanism).

### Network Disruptions
- The client automatically attempts to reconnect if the WebSocket connection is lost.
- Drawings made during disconnection are only visible locally until reconnection.

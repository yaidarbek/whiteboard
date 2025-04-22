const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.static(path.join(__dirname, '../frontend')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map();

function getRandomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
}

wss.on('connection', (ws) => {
    const color = getRandomColor();
    const id = Date.now();
    clients.set(ws, { id, color });

    ws.on('message', (message) => {
        // Broadcasting
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'drawing',
                    data: JSON.parse(message),
                    clientId: id,
                    color
                }));
            }
        });
    });

    ws.on('close', () => {
        clients.delete(ws);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
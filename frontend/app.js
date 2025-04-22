document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    const statusElement = document.getElementById('status');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let socket;
    let clientColor;

    function updateStatus(text, className) {
        statusElement.textContent = text;
        statusElement.className = `status ${className}`;
        console.log(`Status: ${text}`);
    }

    function connectWebSocket() {
        updateStatus('Connecting...', 'disconnected');
        
        const wsUrl = `ws://${window.location.hostname}:3000`;
        console.log(`Connecting to: ${wsUrl}`);
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            updateStatus('Connected', 'connected');
            console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            console.log('Message received:', event.data);
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'drawing') {
                    drawRemote(message.data, message.color);
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };

        socket.onclose = () => {
            updateStatus('Disconnected - Reconnecting...', 'disconnected');
            console.log('WebSocket connection closed');
            setTimeout(connectWebSocket, 1000);
        };

        socket.onerror = (error) => {
            updateStatus('Connection Error', 'disconnected');
            console.error('WebSocket error:', error);
        };
    }

    function drawRemote(data, color) {
        console.log('Drawing remote:', data, color);
        ctx.beginPath();
        ctx.moveTo(data.lastX, data.lastY);
        ctx.lineTo(data.x, data.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();
    }

    function startDrawing(e) {
        console.log('Start drawing at:', e.offsetX, e.offsetY);
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e) {
        if (!isDrawing) return;
        
        console.log('Drawing to:', e.offsetX, e.offsetY);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.strokeStyle = clientColor || '#000000'; 
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        if (socket && socket.readyState === WebSocket.OPEN) {
            const drawingData = {
                lastX,
                lastY,
                x: e.offsetX,
                y: e.offsetY
            };
            console.log('Sending:', drawingData);
            socket.send(JSON.stringify(drawingData));
        } else {
            console.warn('WebSocket not ready');
        }

        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        console.log('Stopped drawing');
        isDrawing = false;
    }

    function init() {
        console.log('Initializing whiteboard');
        clientColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
        console.log('Client color:', clientColor);
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        connectWebSocket();
    }

    init();
});
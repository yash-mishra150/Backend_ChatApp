require('dotenv').config();
const express = require('express');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import socket.io
const app = express();
const connect = require('./DB/connect');
const PORT = process.env.PORT || 8080;
const helmet = require('helmet');
const Login_Routes = require('./routes/AuthRoute');
const Message_Route = require('./routes/MessRoute');
const cors = require('cors');

// Import the message controller functions
const { createMessage, getAllMessages } = require('./controllers/MessagesHandleController');

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust the origin as needed
    methods: ['GET', 'POST'],
  },
});

// Middleware and routes
app.get("/", (req, res) => {
  res.send("I am live from backend");
});
app.use(helmet());
app.use(express.json());
app.set('trust proxy', 1,2,3);
app.use('/api/auth', Login_Routes);
app.use('/api/messages', Message_Route);
app.use(cors());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for messages sent from the client
  socket.on('messageSent', async (msg) => {
    try {
      // Extract the message text and email from the msg object
      const { text, userEmail: email } = msg;
      
      // Call the createMessage controller function to save the message to the database
      await createMessage({ query: { text, email } }, {
        status: (code) => ({ json: (data) => socket.emit('messageError', { code, data }) }),
      });

      // Broadcast the message to all connected clients
      io.emit('messageReceived', msg);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('messageError', { error: 'Failed to save message' });
    }
  });

  // Listen for fetchMessages event from the client
  socket.on('fetchMessages', async (params) => {
    try {
      // Call the getAllMessages controller function to fetch messages
      await getAllMessages({ query: params }, {
        status: (code) => ({
          json: (data) => {
            if (code === 200) {
              socket.emit('messagesFetched', data);
            } else {
              socket.emit('fetchMessagesError', { code, data });
            }
          },
        }),
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('fetchMessagesError', { error: 'Failed to fetch messages' });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const start = async () => {
  try {
    await connect();
    server.listen(PORT, () => { // Start the HTTP server
      console.log(`Connected to ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

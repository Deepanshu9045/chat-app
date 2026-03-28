const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: '*', // For development
    },
  });

  io.on('connection', (socket) => {
    console.log('Connected to socket.io');

    socket.on('setup', (userData) => {
      socket.join(userData._id);
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing', room));
    
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing', room));

    socket.on('new message', (newMessageRecieved) => {
      var chat = newMessageRecieved.chatId;

      if (!chat.participants) return console.log('chat.participants not defined');

      chat.participants.forEach((user) => {
        if (user._id == newMessageRecieved.senderId._id) return;

        socket.in(user._id).emit('message recieved', newMessageRecieved);
      });
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED');
    });
  });
};

module.exports = { initSocket };

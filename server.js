var express = require('express');
var path = require('path');
const http = require('http');
const https = require('https');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const socketio = require('socket.io');
const server = express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/', (rqe, res) => { res.sendFile(__dirname + '/index.html') })
    .get('/chat', (req, res) => { res.sendFile(__dirname + '/chat.html') })
    .listen(PORT, () => console.log(`Listening on ${PORT}`));



const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}
    = require('./utils/users');



const io = socketio(server);

// set static folder
// app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html') });
// app.get('/chat', (req, res) => { res.sendFile(__dirname + '/chat.html') });







const moontalk = 'moontalk!'
// Run when client connect
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);


        // welcome to current user
        socket.emit('message', formatMessage(moontalk, 'welcome to moon talk'));
        // Broadcast when a user connect
        socket.broadcast.to(user.room).emit('message', formatMessage(moontalk, `${user.username} has joined the chat`));

        // send users and room Info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });



    //listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    // Run when user has disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(moontalk, `${user.username} has left the chat`));

            // send users and room Info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });

});





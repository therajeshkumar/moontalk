const path = require('path');
const http = require('http');
const express = require('express');
const fs = require('fs');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
}
    = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // req.url stores the path in the url 
    var url = req.url;
    if (url === "/") {
        res.sendFile(__dirname+'/index.html');
    } else {
        res.send('Page not found')
    }


});




app.use(express.static(path.join(__dirname, 'public')));



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


const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => { console.log(`server running on port ${PORT}`) });

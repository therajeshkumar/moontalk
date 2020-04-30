const chatForm = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chat room
socket.emit('joinRoom', { username, room })

// Get user and room
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})
socket.on('message', message => {
    // console.log(message);
    outputMessage(message);
    //scroll down
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // get message text
    const msg = e.target.elements.msg.value;

    //emit message to server
    socket.emit('chatMessage', msg);
    // clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


//outputMessage to Dom

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time} </span></p> <p class="text"> ${message.text}</P>`;
    document.querySelector('.chat-messages').appendChild(div);

}


// Add room name to Dom
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to Dom

function outputUsers(users) {
    userList.innerHTML = `
${users.map(user => `<li> ${user.username}</li>`).join('')}
`;

}
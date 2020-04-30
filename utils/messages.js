const mement = require('moment');

function formatMessage(username, text){
    return{
        username,
        text,
        time: mement().format('h:mm:a')
    }
}

module.exports = formatMessage;
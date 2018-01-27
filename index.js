const TelegramBot = require('node-telegram-bot-api')
const token = '522240407:AAEL1Q3JrFGeOiLgSY-ctWL_pcYTyBSJLSw'
const axios = require('axios')




const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/events/, (msg,match) => {
    const response = "here are the events"
    let events = []
    axios.post('https://ticketsoko.nouveta.co.ke/api/index.php?function=getEvents')
        .then(response => {
            const data = response.data.data
            data.forEach(event => {
                events.push( [event.Events.event_name] )
            });    
        }).then(() => {
            console.log(events);
            bot.sendMessage(msg.chat.id, response, {
                "reply_markup" : {
                    "keyboard": events,
                    "one_time_keyboard": false
                }
            } )           
        }).then(() =>{
            bot.onText(/.+/g, function(msg, match) {
                bot.sendMessage(msg.chat.id, "You selected " + match);
                ///var selectedSerie = msg.query;
            });

        })
});

bot.on('message', (msg) => {
    var help = "help"
    if (msg.text.includes(help)) {
        bot.sendMessage(msg.from.id, "Hello " + msg.from.first_name + " here are the commands you can use: \n 1. /events - get all the events and ticket prices \n 2. /add - create a new event \n about- get information about this bot")

    }
});

bot.on('polling_error', (error) => {
    console.log(error.code);
})
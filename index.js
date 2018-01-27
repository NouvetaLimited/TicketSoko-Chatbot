const TelegramBot = require('node-telegram-bot-api')
const token = '522240407:AAEL1Q3JrFGeOiLgSY-ctWL_pcYTyBSJLSw'
const axios = require('axios')




const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/events/, (msg,match) => {
    let events = []
    axios.post('https://ticketsoko.nouveta.co.ke/api/index.php?function=getEvents')
        .then(response => {
            const data = response.data.data
            data.forEach(event => {
                events.push({
                    name: event.Events.event_name,
                    venue: event.Events.event_venue,
                    description: event.Events.event_description,
                    date: event.Events.event_date,
                    price:event.Options[0].OptionChoice[0].price,
                    image : event.Events.event_image
                })
            });    
        }).then(() => {
             console.log(`!!!!!!!! ${events}`);
            let event_names = events.map(event =>{
                return[event.name]
            })
            bot.sendMessage(msg.chat.id, "The events Are:", {
                "reply_markup" : {
                    "keyboard": event_names,
                    "one_time_keyboard": false
                }
            } )           
        }).then(() =>{
            bot.onText(/.+/g, function(msg, match) {
                let selectedEvent = events.find( event => {
                    return event.name  === match.input
                })
                console.log(`@@@@@@@@@@ ${match}`);
                
               //console.log(`###### ${selectedEvent.name}`);
                let mesg = `
                            <strong>${selectedEvent.name}</strong> 
                            <pre>
                                Price: KSH ${selectedEvent.price} 
                                Venue: ${selectedEvent.venue}
                                Date: ${selectedEvent.date}
                                
                            </pre> 
                             `
                bot.sendMessage(msg.chat.id, mesg, {parse_mode : "HTML"});
                bot.sendPhoto(msg.chat.id, selectedEvent.image)
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
   // console.log(error.code);
})
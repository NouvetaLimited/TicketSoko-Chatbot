const TelegramBot = require('node-telegram-bot-api')
const token = '522240407:AAEL1Q3JrFGeOiLgSY-ctWL_pcYTyBSJLSw'
const axios = require('axios')

const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/start/, (msg, match)=>{
    let firstName = msg.from.first_name
    let welcomeMessage = "Hello " + firstName + " here are the commands you can use: \n 1. /events - get all the events and ticket prices \n 2. /add - create a new event \n about- get information about this bot"
    bot.sendMessage(msg.from.id, welcomeMessage)

})

bot.onText(/\/events/, (msg, match) => {
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
                    price: event.Options[0].OptionChoice[0].price,
                    type: event.Options[0].OptionChoice[0].name,
                    image: event.Events.event_image
                })
            });
        }).then(() => {
            console.log(JSON.stringify(events));
            let event_names = events.map(event => {
                return [event.name]
            })
            bot.sendMessage(msg.chat.id, "The events Are:", {
                "reply_markup": {
                    "keyboard": event_names,
                    "one_time_keyboard": true
                }
            })
        }).then(() => {
            bot.onText(/.+/g, function (msg, match) {
                let selectedEvent = events.find(event => {
                    return event.name === match.input
                })
                console.log(`@@@@@@@@@@ ${match}`);

                let mesg = `
                            <strong>${selectedEvent.name}</strong> 
                            <pre>
                                Price: KSH ${selectedEvent.price} 
                                Venue: ${selectedEvent.venue}
                                Date: ${selectedEvent.date}   
                            </pre> 
                            ${selectedEvent.image}
                             `
                bot.sendMessage(msg.chat.id, mesg, {
                    parse_mode: "HTML"
                })

                bot.sendMessage(msg.chat.id, "here are the ticket  options for the event:", {
                    "reply_markup": {
                        "keyboard": [
                            [selectedEvent.type, selectedEvent]['back']
                        ],
                        "one_time_keyboard": true
                    }
                });
                bot.sendMessage(msg.chat.id, "how many tickets do you want?", {

                })
            })
        })
});

bot.on('polling_error', (error) => {
     console.log(error.code);
})
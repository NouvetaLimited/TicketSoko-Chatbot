
const TelegramBot = require('node-telegram-bot-api')
const token = '522240407:AAEL1Q3JrFGeOiLgSY-ctWL_pcYTyBSJLSw'
const axios = require('axios')
const needle = require('needle')

const bot = new TelegramBot(token, {
    polling: true
});


let events = [];
let selectedEvent = '';
let ticketOptions = '';
let totalAmount = '';

// initialize bot
(function () {
    start();
    getEvents();
    selectedEventData();
    numberOfTicekts();
    botShop();
})()

//Keyboards
const contactKeyboard = [
    [{
        text: "Allow transaction",
        request_contact: true
    }]
]
const confirmKeyboard = [
    ['Yes'],
    ['No, Cancel Request']

]

const ticketNumber = [
    [{
            text: "1"
        },
        {
            text: "2"
        },
        {
            text: "3"
        },
        {
            text: "4"
        },
        {
            text: "5"
        }
    ],
    [{
            text: "6"
        },
        {
            text: "7"
        },
        {
            text: "8"
        },
        {
            text: "9"
        },
        {
            text: "10"
        }
    ]
]


function start() {
    bot.onText(/\/start/, (msg, match) => {
        let firstName = msg.from.first_name
        let welcomeMessage = "Hello " + firstName + " here are the commands you can use: \n 1. /events - get all the events and ticket prices \n 2. /start - get usage instructions \n 3. /about - info about the bot"
        bot.sendMessage(msg.from.id, welcomeMessage)

    })
}
function getEvents() {
    bot.onText(/\/events/, (msg, match) => {
        events = []
        selectedEvent = '';
        ticketOptions = '';
        axios.post('https://ticketsoko.nouveta.co.ke/api/index.php?function=getEvents')

            .then(response => {
                const data = response.data.data
                data.forEach(event => {
                    events.push({
                        name: event.Events.event_name,
                        venue: event.Events.event_venue,
                        description: event.Events.event_description,
                        date: event.Events.event_date,
                        id: event.Events.id,
                        ticketOptions: event.Options[0].OptionChoice.map(option => {
                            return {
                                name: option.name,
                                price: option.price
                            }
                        }),
                        image: event.Events.event_image
                    })
                });
                console.log(events);


            })
            .then(() => {
                let event_names = events.map(event => {
                    return [event.name]
                })
                bot.sendMessage(msg.chat.id, "The events Are:", {
                    "reply_markup": {
                        "keyboard": event_names,
                        "hide_keyboard": false,
                        "resize_keyboard": true
                    }
                })
            })
    });
}

function selectedEventData() {
    bot.onText(/.+/g, function (msg, match) {
        if (!selectedEvent) {
            selectedEvent = events.find(event => {
                return event.name === match.input
            })
            console.log(`this is  selected event ${selectedEvent}`);
            if (selectedEvent) {
                let mesg = `
                            <strong>${selectedEvent.name}</strong> 
                            <pre>
                                ${selectedEvent.name}
                                Venue: ${selectedEvent.venue}
                                Date: ${selectedEvent.date}   
                            </pre> 
                            ${selectedEvent.image}
                                `
                bot.sendMessage(msg.chat.id, mesg, {
                        parse_mode: "HTML"
                    })
                    .then(() => {
                        ticketOptions = selectedEvent.ticketOptions.map(option => {
                            return [`${option.name.toString()} KSH ${option.price.toString()}`]
                        })
                        bot.sendMessage(msg.chat.id, "here are the ticket  options for the event:", {
                            "reply_markup": {
                                "keyboard": ticketOptions,
                                "hide_keyboard": false,
                                "resize_keyboard": true,
                                "one_time_keyboard": true
                            }
                        });
                    })
            }
        }
    })
}


function numberOfTicekts() {
    bot.onText(/.+/g, function (msg, match) {
        if (ticketOptions) {
            console.log("this is ticket options inside number" + ticketOptions)

            let ticketOption = ticketOptions.find(option => {
                return option == match.input
            })
            if (ticketOption) {
                const confirmOptions = {

                    reply_markup: JSON.stringify({
                        keyboard: confirmKeyboard,
                        "hide_keyboard": true,
                        "one_time_keyboard": true,
                        "resize_keyboard": true
                    })
                }
                const ticketQuantity = {
                    reply_markup: JSON.stringify({
                        keyboard: ticketNumber,
                        "hide_keyboard": false,
                        "resize_keyboard": true,
                        "one_time_keyboard": true,
                    })

                }
                bot.sendMessage(msg.chat.id, "How many tickets do you want?", ticketQuantity).then(() => {
                    bot.once("message", (msg) => {
                        const ticketValue = msg.text
                        let price = ticketOption[0].split(' ')
                        totalAmount = Number(price[price.length - 1]) * Number(ticketValue)

                        bot.sendMessage(msg.chat.id, `Your total is ${totalAmount}KSH. Are you sure you want to buy?`, confirmOptions).then(() => {
                            bot.once("message", (msg) => {
                                if (msg.text === "Yes") {
                                    console.log("Hello World!");
                                    const options = {
                                        "parse_mode": "Markdown",
                                        "reply_markup": JSON.stringify({
                                            "keyboard": contactKeyboard,
                                            "resize_keyboard": true,
                                            "one_time_keyboard": true
                                        })
                                    };
                                    bot.sendMessage(msg.chat.id, "Send your number to facilitate the transaction", options).then(() => {

                                        bot.once("contact", function (msg) {
                                            const phoneNumber = "+" + msg.contact.phone_number
                                            console.log("selected event in contact" + JSON.stringify(selectedEvent));
                                                needle.post('https://ticketsoko.nouveta.co.ke/api/index.php?function=checkOut',{
                                                   valueRegular: ticketValue,
                                                   totalSum: totalAmount,
                                                   event_id: selectedEvent.id,
                                                   phone_number: phoneNumber 
                                                },

                                                function(err, resp, body){
                                                    const ParseConfirmMessage = JSON.parse(body)
                                                    const confirmMessage = ParseConfirmMessage.message;
                                                    bot.sendMessage(msg.chat.id, confirmMessage);
                                                    console.log(ticketValue);
                                                    
                                                    
                                                    
                                                } 
                                            )

 
                                        })
                                    });
                                } else if(msg.text === "No, Cancel Request"){
                                    bot.sendMessage(msg.chat.id, "You cancelled the purchase request.\n is there anything else I can do for you? \n send /start for a list of commands")
                                }
                            })
                        })
                    })
                })
            }
        }
    })
}

function botShop() {
    bot.onText(/\/shop/, (msg, match) => {
        bot.sendMessage(msg.chat.id, "Merchandise shop coming soon! Stay tuned!")
    })
}


bot.on('polling_error', (error) => {
    console.log(error);
})
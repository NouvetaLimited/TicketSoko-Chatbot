require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const token = '522240407:AAEL1Q3JrFGeOiLgSY-ctWL_pcYTyBSJLSw'
const axios = require('axios')

console.log(process.env.TOKEN);

const bot = new TelegramBot(process.env.TOKEN, {
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
[   {text:  "1"  },
    { text: "2"  },
    { text: "3"  },
    { text: "4"  },
    { text: "5"  } ],
  [ { text: "6"  },
    { text: "7"  },
    { text: "8"  },
    { text: "9"  },
    { text: "10"} ] 
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
        axios.post(process.env.EVENTS_API)

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
                        "one_time_keyboard": false
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

           // bot.sendMessage(msg.chat.id, 'How many do you want?')
            console.log("this is ticket options inside number" + ticketOptions)

            let ticketOption = ticketOptions.find(option => {
                return option == match.input
            })
            if (ticketOption) {
                const confirmOptions = {

                    reply_markup: JSON.stringify({
                        keyboard: confirmKeyboard,
                        "one_time_keyboard": true,
                        "resize_keyboard": true
                    })
                }
                const ticketQuantity = {
                    reply_markup: JSON.stringify({
                        keyboard: ticketNumber,
                        "one_time_keyboard": true,
                        "resize_keyboard": true
                    })
                    
                }
                bot.sendMessage(msg.chat.id, "How many tickets do you want?", ticketQuantity).then(() => {
                    bot.once("message", (msg) => {
                        let price = ticketOption[0].split(' ')
                        totalAmount = Number(price[price.length - 1]) * Number(msg.text)
                                          
                bot.sendMessage(msg.chat.id, `Your total is ${totalAmount}KSH. Are you sure you want to buy?`, confirmOptions).then(() => {
                    bot.once("message", (msg) => {
                        if (msg.text === "Yes") {
                            console.log("Hello World!");
                            const options = {
                                "parse_mode": "Markdown",
                                "reply_markup": JSON.stringify({
                                    "keyboard": contactKeyboard,
                                    "one_time_keyboard": true,
                                    "resize_keyboard": true
                                })
                            };
                            bot.sendMessage(msg.chat.id, "Send your number to facilitate the transaction", options).then(() => {

                        bot.once("contact", function (msg) {
                            const phoneNumber = "+" + msg.contact.phone_number
                            console.log("selected event in contact" + JSON.stringify(selectedEvent));

                            var postData = {
                                totalSum: totalAmount,
                                event_id: selectedEvent.id,
                                phone_number: phoneNumber
                            };



                            let axiosConfig = {
                                headers: {
                                    'Content-Type': 'application/json;charset=UTF-8',
                                    "Access-Control-Allow-Origin": "*",

                                }
                            };

                            axios({
                                    method: 'post',
                                    url: process.env.PAYMENTS_API,
                                    headers: axiosConfig,
                                    data: postData
                                })
                                .then((res) => {
                                    const message = res.data.message;
                                    bot.sendMessage(msg.chat.id, message)
                                    console.log(selectedEvent.id);
                                    console.log(totalAmount);



                                })




                        })

                            });

                        }

                    })

                })

                    })
                  

                })





            }
        }
    })
}


bot.on('polling_error', (error) => {
    console.log(error);
})
process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api')
const token = '469532956:AAFOeOvCtGcjSCQb8Y7mUUYWFd8-SMn-exg'
const axios = require('axios')
const needle = require('needle')
const options = {
    webHook: {
     
         port : process.env.VCAP_APP_PORT || 8080
      
    }
  }
 


  const url = 'https://ticketsokochatbot-ectomorphic-countercheck.eu-gb.mybluemix.net/'
  const bot = new TelegramBot(token, options)

  bot.setWebHook(`${url}/bot${token}`);



let events = [];
let selectedEvent = '';
let ticketOptions = '';
let totalAmount = '';
let orderNumber = '';
let data = '';
let status = '';
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
    }],
    [{
        text: 'HOME'
    }]
]

const confirmKeyboard = [
    ['Yes'],
    ['No, Cancel Request'],
    [{
        text: 'HOME'
    }]

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
        fetchEvents(msg)
    });
}

function fetchEvents(msg) {
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
                    image: event.Events.event_image,
                    company: event.Events.event_company
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
                                `

                bot.sendMessage(msg.chat.id, mesg, {
                        parse_mode: "HTML"
                    })
                    .then(() => {
                        ticketOptions = selectedEvent.ticketOptions.map(option => {
                            return [`${option.name.toString()} KES ${option.price.toString()}`]
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
                let picture = selectedEvent.image
                bot.sendPhoto(msg.chat.id, picture)
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

                        bot.sendMessage(msg.chat.id, `Your total is KES ${totalAmount}. Are you sure you want to buy?`, confirmOptions).then(() => {
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
                                            const phoneNumber = msg.contact.phone_number
                                            console.log("selected event in contact" + JSON.stringify(selectedEvent));


                                            needle('post', 'https://ticketsoko.nouveta.co.ke/api/index.php?function=checkOut', {
                                                    valueRegular: ticketValue,
                                                    totalSum: totalAmount,
                                                    event_id: selectedEvent.id,
                                                    phone_number: phoneNumber,
                                                    event_company: selectedEvent.company,
                                                    OptionChoiceSelectedRegular: ticketOption[0]
                                                })
                                                .then((resp) => {
                                                      console.log('#####',ticketOption);
                                                                                                        const ParseConfirmMessage = JSON.parse(resp.body)
                                                    const confirmMessage = ParseConfirmMessage.message;
                                                    orderNumber = ParseConfirmMessage.data
                                                    // console.log(orderNumber);
                                                    bot.sendMessage(msg.chat.id, confirmMessage)
                                                    setTimeout(() => {

                                                        // needle('post', 'http://ticketsoko.nouveta.co.ke/api/index.php?function=paymentCallBack', {
                                                        //         order_number: orderNumber,
                                                        //         phone_number: phoneNumber,
                                                        //         amount_paid: totalAmount,
                                                        //         code: 'XBRB-IENE-KELE',
                                                        //         payment_method: 'Mpesa'
                                                        //     })
                                                        //     .then(function (resp) {
                                                        //         console.log(resp.body);
                                                                needle('post', 'http://ticketsoko.nouveta.co.ke/api/index.php?function=checkTicketsPayments', {
                                                                        order_number: orderNumber
                                                                    })
                                                                    .then((resp) => {
                                                                        console.log(resp.body);
                                                                        const parseReceivedPayments = JSON.parse(resp.body)
                                                                        status = parseReceivedPayments.success
                                                                        data = parseReceivedPayments.data
                                                                        console.log(data);
                                                                        console.log(orderNumber);



                                                                        if (data != null) {
                                                                            let resultString = "";
                                                                            data.map(singleTicket => {
                                                                                resultString += singleTicket + " \n";
                                                                            });
                                                                            bot.sendMessage(msg.chat.id, "request received, you'll get a confirmation shortly ").then(() => {
                                                                                bot.sendMessage(msg.chat.id, resultString)
                                                                            })


                                                                        } else if (data === null) {
                                                                            bot.sendMessage(msg.chat.id, "Sorry, request unsuccessful")

                                                                        }




                                                                    })
                                                           // })




                                                    }, 40000);


                                                })



                                        })
                                    });
                                } else if (msg.text === "No, Cancel Request") {
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

bot.on("message", (msg) => {
    if (msg.text === 'HOME') {
        fetchEvents(msg)
    }
})

bot.on('polling_error', (error) => {
    console.log(error.code);
})
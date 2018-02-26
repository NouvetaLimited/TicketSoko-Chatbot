const needle = require('needle')
const axios = require('axios')

needle.post('http://ticketsoko.nouveta.co.ke/api/index.php?function=checkTicketsPayments', {
    order_number: '297A1C'

}, (err, resp, body) => {
    console.log(body);
    const parseReceivedPayments = JSON.parse(body)
    const data = parseReceivedPayments.data

    const ticket = data.forEach(ticket => {
    console.log(ticket);
    

        
    })
})


//     const tickets = data.toString()
//     console.log(tickets);
// })

// let tickets = ['Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A1',
// 'Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A1',
// 'Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A18',
// 'Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A3',
// 'Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A1',
// 'Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A1',
// 'Follow link to download your ticket https://ticketsoko.nouveta.co.ke/ticket.html?ticket_number=201711297A1']

//let ticket = tickets.map(ticket => {
//return ticket
//});
//console.log(ticket); // undefined why?

//  let ticket = tickets.forEach(element => {
//      console.log(element);

//  });

// let resultString = "";
// tickets.map(singleTicket => {
//     resultString += singleTicket + " ";
// });
// console.log(resultString);

// let resultString = "";
// data.map(singleTicket => {
//     resultString += singleTicket + " ";
// });



    // axios.post('https://ticketsoko.nouveta.co.ke/api/index.php?function=getEvents')

    //     .then(response => {
    //         const data = response.data.data
    //         console.log(data);
    //         data.forEach(event => {
    //             console.log(event.Events.event_company);
                
    //         });


    //     })
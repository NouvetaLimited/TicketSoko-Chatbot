const axios = require('axios')

var postData = {
  totalSum: '4000',
  event_id: '100',
  phone_number: '0708512358'
};



let axiosConfig = {
  headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      "Access-Control-Allow-Origin": "*",

  }
};

axios({
      method: 'post',
      url: 'https://ticketsoko.nouveta.co.ke/api/index.php?function=checkOut',
      headers: axiosConfig,
      data: postData
  })
  .then((res) => {
      const message = res.data.message;
      // bot.sendMessage(msg.chat.id, message)
      // console.log(selectedEvent.id);
      console.log(message);
      


  })
# TicketSoko Bot roadmap

## ticketSoko Bot(v1-beta-test)

* [x] Fix the bug where ticket status is sent twice  
* [x] Add a better information about the bot
* [x] Fix the checkout api just sending the same message even with fake parameters 
* [x] Add a home button that takes the users back to events keyboard   
* [ ] Find a way of getting the number of bot users(with the help of kibana)  
* [ ] Find a way of sending notifications to the users of the bot  
* [x] decide on a way of deploying the app either in a container i.e    
* [x] Come up with a framework for remotely monitoring the bot via a log-file. 
* [ ] understand kibana to help me monitor the bot and extract useful data from it 
* [ ] Add continuous integration functionality to easen the deploying to ibm cloud 
* [x] move to needle for processing api requests in order to reduce the number of dependencies my bot has or find a way of fixing axios
* [ ] clean the code to get rid of log messages that were used for debugging(wont be possible at the moment since it's used for monitoring the bot)

## ticketSoko Bot(v1.0.0)

* [] The v1-beta-test must be fully complete before anything below is done.
* [ ] Move to inline keyboards to display the events.  
* [ ] Create a shop area for buying the events merchandise. 
* [x] Add an option where users can raise an issue.(might be impossible)

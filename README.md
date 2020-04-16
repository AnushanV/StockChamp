![alt text](https://github.com/QuangMinhHuynh/StockChamp/blob/master/public/images/logo.png)
===========
Final Project for CSCI 3230U Winter 2020

## Team Members
* Minh Huynh
* Ken Zhou
* Anushan Vimalathasan

## Project Description
StockChamp is a web application software that allows users to search and view information about stocks (market prices and trends, related news, etc.). Users can subscribe to a maximum of three different stocks at the same time and save them as shortcuts for ease of access.

In the future, users can edit their subscriptions at any time.

## Requirements
* Node.js (npm included)
* MongoDB (choose to install MongoCompass during the installation)

## Powered By
* [Alpha Vantage](https://www.alphavantage.co/) 
* [News API](https://newsapi.org/)

## Setting up the environment
1. Clone the repo
2. Open Powershell in project folder and enter `npm install`
3. To run the project, enter `nodemon` in Powershell
4. Open any web browser and enter `localhost:3000` which will lead you to the Login page
5. For first time user, you can Sign Up for an account!
6. To view detailed info about user data, open MongoCompass

## Notes
1. Since we do not have the paid version of the stocks API we're using, we can only request from the free API **5 times per minute**. 
If you try to request more than that from the API on our stock page by **changing the time interval or generating a new stock page too many times within a minute, it will fail to load the graph.**

2. The news column searches news using the stock symbol, so the **results may not match the company if the company not well known.**

3. This project is **optimized for full-screen display.**

## References
Some references were used to learn how to do things, and we tried to expand on the code that we referenced.

 1. Making sure the database info was received before the data was used:
   * https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
 2. Making line graph:
   * https://www.d3-graph-gallery.com/graph/line_cursor.html
   * https://bl.ocks.org/d3noob/402dd382a51a4f6eea487f9a35566de0

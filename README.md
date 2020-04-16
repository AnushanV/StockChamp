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

## Setting up the environment
1. Clone the repo
2. Open Powershell in project folder and enter `npm install`
3. To run the project, enter `nodemon` in Powershell
4. Open any web browser and enter `localhost:3000` which will lead you to the Login page
5. For first time user, you can Sign Up for an account!
6. To view detailed info about user data, open MongoCompass

## Notes
Since we do not have the paid version of the stocks API we're using, we can only request from the free API **5 times per minute**. 

If you try to request more than that from the API on our stock page by **changing the time interval or generating a new stock page too many times within a minute, it will fail to load the graph.**

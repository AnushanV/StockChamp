let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let session = require('express-session');
let uuid = require('uuid/v1');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let assert = require('assert');
let d3   = require('d3');

//Setting up database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/StockChamp', {
					useUnifiedTopology: true,
					useNewUrlParser: true,
					useCreateIndex: true});
                 //,{useMongoClient: true});

//Middleware				 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var storedUsers = ["JoeSmith123", "Ken", "admin"]

//Set view engines
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//Configure Sessions
app.use(session({
	genid: function(request) {
	  return uuid();
	},
	resave: false,
	saveUninitialized: false,
	//cookie: {secure: true},
	secret: "StockChamp"
}));

// Making database schema
var Schema = mongoose.Schema;

// Making user table
var userSchema = new Schema({
  username:{type: String,
            unique: true,
            index: true},
  hashedPassword: String,
  stock1: {type: String, default: ''},
  stock2: {type: String, default: ''},
  stock3: {type: String, default: ''}
}, {collection: 'users'});

var User = mongoose.model('users', userSchema);

// change to login page
app.get('/', (request, response)=>{
	response.render('login', {});
});

// sign up page
app.get('/signup', (request, response)=>{
	let username = request.body.username;
	console.log(username);
	response.render('signup', {systemMessage: ''});
});

// resolve sign up process
app.post('/signupProcess', (request, response) =>{
	let username = request.body.username;
	let password = request.body.password;
	let hashedPassword = bcrypt.hashSync(password);

	
	if (username == null || password == null
		|| username == "" || password == "") {
		response.render('signup', {systemMessage: 'Please enter both Username and Password'});
		response.redirect('/signup');
	}

	var newUser = new User({username: username,
		hashedPassword: hashedPassword,
		stock1: '',
		stock2: '',
		stock3: ''});

		//Check if user already exist
		User.find({username: username}).then(function(results){
			if (results.length > 0) {
			  response.render('signup', {systemMessage: 'This username already exists'});
			} else {
			  //username unavailable
			  newUser.save(function(error) {
				if (error) {
				console.log('Unable to Sign Up: ' + error);
				respone.render('signup', {systemMessage: 'Unable to Sign Up'});
				} else {
				response.render('login', {systemMessage: 'Successfully Sign Up!'});
				}
			})
		  }

		
		});
	//TODO: check if username are taken and add to database if it hasn't
	//	response.render('signup', {
//		verification: false
//	})

});

// change to stock page
app.get('/stockPage', (request, response)=>{
	response.render('stockPage', {});
});

// change to search page
app.get('/searchPage', (request, response)=>{
	response.render('searchPage', {});
});


// resolve log in
app.post('/loginProcess', (request, response)=>{
	let username = request.body.username;
	let password = request.body.password;

	User.find({username: username}).then(function(results) {
		if (results.length == 0) {
		  	response.render('login', {systemMessage: 'Incorrect Username!'});
		} else {
		  if (bcrypt.compareSync(password, results[0].hashedPassword)) {
			request.session.username = username;
			request.session.stock1 = results[0].stock1;
			request.session.stock2 = results[0].stock2;
			request.session.stock3 = results[0].stock3;
			response.render('searchPage', {});
		  } else {
			response.render('login', {systemMessage: 'Incorrect Password!'});
		  }
		}
	  });
	
	// TODO: check credentials and move to main page if valid
//	response.render('login', {
//		verification: false
//	})
});

//Get user stock list
app.get("/api/getStock", (request, response) =>{
    var session = request.session;
    User.find({
      username: session.username
    }).then(function(result) {
      User.find({
        username: result[0].username
      }).then(function(result) {
		//console.log(result);
        response.send(result);
      }).catch(function(error) {
        response.send(error);
      });
    }).catch(function(error) {
      response.send(error);
    });
});

app.post('/updateStock', (request, response) =>{
	var session = request.session;
	console.log(request.body);

	//update user here
	/*
	User.find({
		username: session.username
	}).then(function(result){
		
	});*/

});

app.set('port', 3000);

app.listen(app.get('port'), ()=>{
	console.log('Listening on port ' + app.get('port'));
});
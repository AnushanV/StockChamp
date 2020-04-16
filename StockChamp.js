// Setting up dependencies
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let session = require('express-session');
let uuid = require('uuid/v1');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');

// Setting up database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/StockChamp', {
					useUnifiedTopology: true,
					useNewUrlParser: true,
					useCreateIndex: true});

// Middleware				 
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var stocks = ["", "", ""];

// Set view engines
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Configure Sessions
app.use(session({
	genid: function(request) {
	  return uuid();
	},
	resave: false,
	saveUninitialized: false,
	secret: "StockChamp"
}));

// Making database schema
var Schema = mongoose.Schema;

// Making user collection
var userSchema = new Schema({
  username:{type: String,
            unique: true,
            index: true},
  hashedPassword: String,
  stock1: {type: String, default: ''},
  stock2: {type: String, default: ''},
  stock3: {type: String, default: ''}
}, {collection: 'users'});

// Get the users collection in the database
var User = mongoose.model('users', userSchema);

// Change to login page (landing page)
app.get('/', (request, response)=>{
	response.render('login', {});
});

// Sign up page
app.get('/signup', (request, response)=>{
	let username = request.body.username;
	console.log(username);
	response.render('signup', {systemMessage: ''});
});

// Resolve sign up process
app.post('/signupProcess', (request, response) =>{
	let username = request.body.username;
	let password = request.body.password;
	let hashedPassword = bcrypt.hashSync(password);

	// If user did not enter both of the field when sign up
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

		// Check if username already exist
		User.find({username: username}).then(function(results){
			if (results.length > 0) {
			  response.render('signup', {systemMessage: 'This username already exists'});
			} else {
			  //Catch any error while signing up
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

});

// Render the Search Page
app.get('/searchPage', (request, response)=>{
	response.render('searchPage', {stock1: stocks[0],
									stock2: stocks[1],
									stock3: stocks[2]});
});

// Render the appriate Stock Page
app.get('/stockPage/:name', (request, response)=>{
	response.render("stockPage", {stock1: stocks[0],
								stock2: stocks[1],
								stock3: stocks[2],
								title: request.params.name});
});

// Resolve log in
app.post('/loginProcess', (request, response)=>{
	let username = request.body.username;
	let password = request.body.password;
	
	// Looks for username
	User.find({username: username}).then(function(results) {
		if (results.length == 0) {
			// If username not found
		  	response.render('login', {systemMessage: 'Incorrect Username or Password!'});
		} else {
			// Compares passwords
		  if (bcrypt.compareSync(password, results[0].hashedPassword)) {
			// If password is the same
			request.session.username = username;
			
			stocks[0] = results[0].stock1;
			stocks[1] = results[0].stock2;
			stocks[2] = results[0].stock3;
			response.render('searchPage', {stock1: stocks[0],
											stock2: stocks[1],
											stock3: stocks[2]});
		  } else {
			  // If password is incorrect
			response.render('login', {systemMessage: 'Incorrect Username or Password!'});
		  }
		}
	  });
	
});

// Get user stock list
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

// Updates the stock shortcuts
app.post('/updateStock', (request, response) =>{
	var session = request.session;
	console.log(request.body);
	User.collection.updateOne(
		{"username": request.body[0].username},
		{$set: {
			"stock1": request.body[0].stock1,
			"stock2": request.body[0].stock2,
			"stock3": request.body[0].stock3
		}}
		
	);
	stocks[0] = request.body[0].stock1;
	stocks[1] = request.body[0].stock2;
	stocks[2] = request.body[0].stock3;
});

// Logout of account
app.get('/logout', (request, response)=>{
	stocks[0] = "";
	stocks[1] = "";
	stocks[2] = "";
	request.session.username = "";
	response.redirect("/");
});

// Setting port
app.set('port', 3000);

app.listen(app.get('port'), ()=>{
	console.log('Listening on port ' + app.get('port'));
});
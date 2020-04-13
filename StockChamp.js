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
  isSub: { type: Boolean, default: false},
  stock1: String,
  stock2: String,
  stock3: String
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
	response.render('signup', {});
});

// resolve sign up process
app.post('/signup', (request, response) =>{
	//TODO: check if username and email are taken and add to accounts if it hasn't
});

// change to stock page
app.get('/stockPage', (request, response)=>{
	response.render('stockPage', {});
});


// resolve log in
app.post('/', (request, response)=>{
	console.log(request.body.username);
	console.log(request.body.password);
	
	// TODO: check credentials and move to main page if valid
//	response.render('login', {
//		verification: false
//	})
	
	response.redirect('/stockPage');
});

app.set('port', 3000);

app.listen(app.get('port'), ()=>{
	console.log('Listening on port ' + app.get('port'));
});
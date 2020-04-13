let express = require('express');
let app = express();
let bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var storedUsers = ["JoeSmith123", "Ken", "admin"]

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

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
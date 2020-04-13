let express = require('express');
let app = express();
let bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', (request, response)=>{
	response.render('header', {});
});

app.get('/stockPage', (request, response)=>{
	response.render('stockPage', {});
});

app.get('/signup', (request, response)=>{
	response.render('signup', {});
});

app.get('/login', (request, response)=>{
	response.render('login', {});
});

app.set('port', 3000);
app.listen(app.get('port'), ()=>{
	console.log('Listening on port ' + app.get('port'));
});
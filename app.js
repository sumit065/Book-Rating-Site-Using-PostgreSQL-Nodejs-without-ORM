var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cons = require('consolidate'),
	dust = require('dustjs-helpers'),
	pg = require('pg'),
	app = express();

//DB connection string
//var connectionString = 'postgresql://sumit:12345@localhost/prodb'	

//Assign dust engine to .dust files
app.engine('dust', cons.dust);

//Set default ext .dust
app.set('view engine', 'dust'); //so that the ext of dust files need not be specified in res.render
app.set('views', __dirname+'/views');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

const config = {
	  user: 'sumit',
	  host: '127.0.0.1',
	  database: 'prodb',
	  password: '12345',
	  port: 5432
};

const pool = new pg.Pool(config);


app.get('/', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM book', function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('index', {'books':result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.rows is an array of objects

		});
	});
});

app.post('/add', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO book(name, id) VALUES($1,$2)',[req.body.name, req.body.id]);
			
		done();
		res.redirect('/');	
		
	});
});


app.listen(3000, ()=>{
	console.log('Server Started on port 3000');
})


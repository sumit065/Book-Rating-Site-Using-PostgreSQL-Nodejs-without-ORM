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
		client.query('SELECT * FROM (select * from books order by average_rating desc limit 5)as hehe', function(err, result){
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


app.post('/login', (req, res)=>{
	
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM users WHERE userid= $1 AND password=$2',[req.body.uname, req.body.psw], function(err, result){
			if(err){
				return console.error('error running query', err);
				
			}
			if(result.rowCount == 0){res.render('index', {'wrongid':'a'});}
			else{
				var x= result.rows[0].userid;
				res.send('Hello '+ x);
			}
			
		});
	});
	
});


app.get('/newpage', function(req, res){	
		res.sendFile(__dirname+"/display.html");
		//res.sendStatus(200);	
});



app.post('/add', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO book(name, id) VALUES($1,$2)',[req.body.name, req.body.id])
			
		done();
		res.redirect('/');	
		
	});
});

app.post('/signup', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO users(userid, password) VALUES($1,$2)',[req.body.uid, req.body.pwd],(err,result)=>{
			if(err){
				res.render('index', {'already':['a']});
			}
		});
		
		done();

	});
});

app.delete('/delete/:id', function(req, res){
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('DELETE FROM book WHERE id= $1',[req.params.id]);
			
		done();
		res.sendStatus(200);	
		
	});
});


app.listen(3000, ()=>{
	console.log('Server Started on port 3000');
})


var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cons = require('consolidate'),
	dust = require('dustjs-helpers'),
	pg = require('pg'),
	app = express();





app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
var jsonParser = bodyParser.json();
//DB connection string
//var connectionString = 'postgresql://sumit:12345@localhost/prodb'	

//Assign dust engine to .dust files
app.engine('dust', cons.dust);

//Set default ext .dust
app.set('view engine', 'dust'); //so that the ext of dust files need not be specified in res.render
app.set('views', __dirname+'/views');

//Set public folder
app.use(express.static(path.join(__dirname, 'public')));


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
		client.query('SELECT * FROM (SELECT * FROM books ORDER BY average_rating DESC LIMIT 5)AS hehe', function(err, result){
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

app.get('/top20', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('select * from books where original_publication_year>=2009 order by average_rating desc limit 20 ', function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('index2',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
	});
});

app.get('/favourites', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
    const query1 = {
	   text: "select books.book_id,books.isbn13,books.authors,books.original_publication_year,books.title,books.language_code,books.average_rating from(select * from viewbookidtagname where tag_name ilike $1)as hehe inner join books on books.book_id=hehe.book_id order by average_rating desc limit 50",
	   values: ['all-time-favourites'],
 	};
		client.query(query1, function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('indexfavourites',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
	});
});

app.get('/review/:leg', function(req, res, next) {
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    const query1 = {
   text: "select * from books inner join reviews on reviews.book_id=books.book_id where books.book_id=$1",
   values:[req.params.leg],
 };
    client.query(query1, function(err, result){
      if(err){
        return console.error('error running query', err);
      }
      //myFunction(result);
      var array=[];
      array=result.rows;
      //res.sendFile(path.join(__dirname+'display.html'));
      res.render('indexreview',{books: result.rows,book:array[0]});
     
    });
  });
});


app.get('/:leg', function(req, res, next) {
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    const query1 = {
	   text: "SELECT * FROM books WHERE original_publication_year=$1",
	   values:[req.params.leg],
	 };
    client.query(query1, function(err, result){
      if(err){
        return console.error('error running query', err);
      }
      res.render('indexfavourites',{books: result.rows});
      
    });
  });
});


app.post('/login', (req, res)=>{
	

	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM users WHERE username= $1 AND userid=$2',[req.body.uname, req.body.psw], function(err, result){
			if(err){
				return console.error('error running query', err);
				
			}
			if(result.rowCount == 0){res.render('invalidlogin', {'wrongid':'a'});}
			else{
				var x= result.rows[0].userid;
				res.render('login', {'loginpage':result.rows});
			}
			
		});
	});
	
});

app.post('/review/:leg', function(req, res, next) {
  pool.connect(function(err, client, done){
    if(err){
      return console.error('error fetching client from pool', err);
    }
    const query1 = {
   text: "insert into reviews values($1,$2,$3)",
   values:[req.params.leg,req.body.review,req.body.name1],
 };
    client.query(query1, function(err, result){
      if(err){
        return console.error('error running query', err);
      }
      //myFunction(result);
      var array=[];
      array=result.rows;
      //res.sendFile(path.join(__dirname+'display.html'));
      //res.render('indexreview',{books: result.rows,book:array[0]});
      var redirecturl="/review/"+req.params.leg;
      res.redirect(redirecturl);
  		done();


 		});
 	});
});

					
/*
app.get('/newpage', function(req, res){	
		res.sendFile(__dirname+"/display.html");
		//res.sendStatus(200);	
});
*/


app.post('/add', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO userbook(userid, book_name) VALUES($1, $2)',[req.body.uname,req.body.name]);
			var arr=[{book:req.body.name}]
      		res.render('addpage', {'newpage':arr});	
		
	});
});

app.post('/signup', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('INSERT INTO users(username, userid) VALUES($1,$2)',[req.body.uid, req.body.pwd],(err,result)=>{
			if(err){
				res.render('invalidlogin', {'already':'a'});
			}
			else{
				res.redirect('/');
			}
		});
		
		

	});
});


app.post('/addedbooks', (req, res)=>{
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT * FROM userbook WHERE userid=$1',[req.body.uId],function(err, result){
	      if(err){
	        return console.error('error running query', err);
	      }
	      res.render('indexfavourites',{'addedbook': result.rows});
      
    
			
		done();

			});
		
	});
});

app.post('/ratedbooks', (req, res)=>{
	
	pool.connect(function(err, client, done){
		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query('SELECT DISTINCT title FROM toread,books WHERE user_id=$1 limit 10',[req.body.uId],function(err, result){
			if(err){
				return console.error('error running query', err);
				console.log(req.body.uId);
			}
			
			
			res.render('indexfavourites', {'userbook':result.rows});
			console.log(req.body.uId);  
			done();
			
		});
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

app.post('/search', (req, res)=>{
	pool.connect(function(err, client, done){
    const data = {
     name : req.body.name,
      year : req.body.year,
   }
   if(data.year!='')
   {
   const query1 = {
  text: "SELECT * from books where title ilike '%' || $1 || '%' and authors ilike '%' || $2 || '%' and original_publication_year=$3",
  values: [req.body.name,req.body.Author,req.body.year],
};

		if(err){
			return console.error('error fetching client from pool', err);
		}
		client.query(query1, function(err, result){
			if(err){
				return console.error('error running query', err);
			}
			//myFunction(result);
			//res.sendFile(path.join(__dirname+'display.html'));
			res.render('index1',{books: result.rows});
			//console.log(res);  //uncomment to see result object on console
			//note that result.row is an array of objects
		});
  }
  else
  {
    const query1 = {
   text: "SELECT * from books where title ilike '%' || $1 || '%' and authors ilike '%' || $2 || '%' ",
   values: [req.body.name,req.body.Author],
 };

 		if(err){
 			return console.error('error fetching client from pool', err);
 		}
 		client.query(query1, function(err, result){
 			if(err){
 				return console.error('error running query', err);
 			}
 			//myFunction(result);
 			//res.sendFile(path.join(__dirname+'display.html'));
 			res.render('index1',{books: result.rows});

 			//console.log(res);  //uncomment to see result object on console
 			//note that result.row is an array of objects
 		});
  }
	});
});

app.listen(3000, ()=>{
	console.log('Server Started on port 3000');
})


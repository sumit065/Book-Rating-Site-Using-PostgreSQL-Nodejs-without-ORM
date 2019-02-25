$(document).ready(function(){ //applies this fn of the referencing document
	//This is to prevent any jQuery code from running before the document is finished loading (is ready).
	$('.delete-book').on('click', function(){ //applies the on() fn on elements with class delete-book
		var id = $(this).data('id');
		var url = '/delete/' + id;

		if(confirm('Are you sure?')){
			$.ajax({
				url: url,
				type: 'DELETE',
				success: function(result){
					console.log('Deleting ..');
					window.location.href= '/';
				},
				error: function(err){
					console.log('Error Occurred');
				}
			});
		}
	});

	

	$('.home-page').on('click', function(){ //applies the on() fn on elements with class delete-book
		var url = '/'

		
			$.ajax({
				url: url,
				type: 'GET',
				success: function(result){
					console.log("Fetching");
					window.location.href= '/';
				},
				error: function(err){
					console.log('Error Occurred');
				}
			});
		
	});

	$('.to-read').on('click', function(){ //applies the on() fn on elements with class delete-book
		var url = '/ratedbooks'

		
		$.ajax({
			url: url,
			type: 'GET',
			success: function(result){
				console.log("Fetching");
				window.location.href= url;
			},
			error: function(err){
				console.log('Error Occurred');
			}
		});
		
	});



	
});




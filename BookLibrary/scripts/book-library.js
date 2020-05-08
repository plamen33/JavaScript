function startApplication(){
	//firebase initialization

    // Your web app's Firebase configuration
     var firebaseConfig = {
       apiKey: "AIzaSyAZClmVVZwgBXFP2tl3cZzsn0GRkISIeV4",
       authDomain: "booklibrary-57192.firebaseapp.com",
       databaseURL: "https://booklibrary-57192.firebaseio.com",
       projectId: "booklibrary-57192",
       storageBucket: "booklibrary-57192.appspot.com",
       messagingSenderId: "209763431057",
       appId: "1:209763431057:web:a88f688eeedec5f61a8530",
       measurementId: "G-M3PKSQYHHL"
     };
     // Initialize Firebase
     firebase.initializeApp(firebaseConfig);

   'use strict';

   const kinveyBaseUrl = "https://baas.kinvey.com/";
   const kinveyAppKey = "kid_BysPrvXlz";
   const kinveyAppSecret = "b741d837b8034ce5bd42b02c510013b5";
   
   const BOOKS_PER_PAGE = 10;

   function showView(viewId) {     // function which by name of section hides and showes the others
       $('main > section').hide(); // hide all the views
       $('#' + viewId).show();     //
   }
    sessionStorage.clear();
    //  $(function () {  // $ (function (){}) means in jQuery that after the DOM tree is loaded then load this function
    showHideMenuLinks();
    showView('viewHome');
    $('#linkHome').click(showHomeView);  // these code activates the form of view which we set -> when we click on the screen the specific form/page opens
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView)
    $('#linkListBooks').click(listBooksLink);
    $('#linkCreateBooks').click(showCreateBookView);
    $('#linkLogout').click(logout);  /// when we click on the Logout link activate the logout function and do the logout itself
    
	// Bind the info / error boxes
    $("#infoBox, #errorBox").on('click', function() {
        $(this).fadeOut()
    })
	
    $('#formLogin').submit(function (e) {
        e.preventDefault();
		authenticateInFirebase();
		//let token = tokenReturn();
        //login(token);
    });
    $('#formRegister').submit(function (e) {
        e.preventDefault();
        register();
    })
    $('#formCreateBook').submit(function (e) {
        e.preventDefault();
        createBook();
    });
    // when Edit button is clicked on Edit form:
    $('#buttonEditBook').click(editBook);
    
	// AJAX "loading" event listener
    $(document).on({
        ajaxStart: function () {
            $('main').hide();
            $('#loader').show();
			// $('#loadingBox').show();
        },
        ajaxStop: function () {
            $('#loader').hide();
            $('main').fadeIn(500);
			// $('#loadingBox').hide();
        }
    });
    // }) // end of IIFE

    function showView(viewId) {     // function which by
        $('main > section').hide(); // hide all the views
        $('#' + viewId).show();     
    }
    function showHideMenuLinks() {
        $('#linkHome').show();
        if (sessionStorage.getItem('authToken') == null) {
            // No logged in user
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListBooks').hide();
            $('#linkCreateBooks').hide();
            $('#linkLogout').hide();
        } else {
			console.log("user logged in hide panels");
            /// user logged in, so we hide these panels
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListBooks').show();
            $('#linkCreateBooks').show();
            $('#linkLogout').show();
        }
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function () {
            $('#infoBox').fadeOut()
        }, 3000);
    }

    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
		setTimeout(function () {
            $('#errorBox').fadeOut()
        }, 12000);
    }

    function showHomeView(){
        showView('viewHome');
    }

    function showLoginView() {
        showView('viewLogin');
    }
	
	// here we develop new Firebase authentication:
	const firebaseBaseUrl = 'https://booklibrary-57192.firebaseio.com/';
    const timerFirebaseUrl = firebaseBaseUrl + 'books'
	
	

	function authenticateInFirebase(){
			// firebase authentication:
		firebase.auth().signInWithEmailAndPassword($('#loginUser').val(), $('#loginPass').val())
            .then(response => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    sessionStorage.setItem('authToken', token);
                    sessionStorage.setItem('username', response.user.email);		
                    sessionStorage.setItem('userId', response.user.uid);
					$('#loggedInUser').text(`Welcome, ${response.user.email}!`);
					tokenReturn(token);
					showHideMenuLinks();
                    showInfo('Login successful.');
	                listBooks(token);
                });
        }).then(function(user){
		   console.log("authentification check"); // then can be skipped
		}).catch(function(error) {
                console.log('Error logging in Firebase: ', error);
				//console.log(Object.entries(error));
				let errorArray = Object.entries(error);
				console.log("Login failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
				showError("Login failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
        });
      
	}
	function tokenReturn(token){
		sessionStorage.setItem('authToken', token);
		return token;
	}

	
		
    //function login(token) {
    //    const kinveyLoginUrl = kinveyBaseUrl + 'user/' + kinveyAppKey + '/login';
    //    const kinveyAuthHeaders = {
    //        'Authorization': 'Basic ' + btoa(kinveyAppKey + ":" + kinveyAppSecret),
    //    };
    //    let userData = {
    //        username: $('#loginUser').val(),
    //        password: $('#loginPass').val()
    //    };
        //$.ajax({
        //    method: 'POST',
        //    url: kinveyLoginUrl,
        //    headers: kinveyAuthHeaders,
        //    data: userData,
        //    success: loginSuccess,
        //    error: handleAjaxError
        //});
    //   function loginSuccess(response) {
    //        let userAuth = response._kmd.authtoken;
    //        sessionStorage.setItem('authToken', userAuth);
    //        // save the user in sessionStorage:
    //        let userId = response._id; // get the user id
    //        sessionStorage.setItem('userId', userId);
	//		$('#loggedInUser').text(`Welcome, ${response.username}!`);
    //        showHideMenuLinks();
    //        showInfo('Login successful.');
	//        listBooks();
    //    }
    //}

     function handleAjaxError (response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0) {
            errorMsg = 'Cannot connect due to network error.';
        }
        if (response.responseJSON && response.responseJSON.description) {
            errorMsg = response.responseJSON.description;
        }
        showError(errorMsg);
    }

    function showRegisterView(){
        showView('viewRegister')
    }

    function register(){
		// old kinvey code:
        //const kinveyRegisterUrl = kinveyBaseUrl + 'user/' + kinveyAppKey + '/';
        //const kinveyAuthHeaders = {
        //    'Authorization':'Basic ' + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        //};
		//  $.ajax({
        //    method: 'POST',
        //   url: kinveyRegisterUrl,
        //    headers: kinveyAuthHeaders,
        //    data: userData,
        //    success: registerSuccess,
        //    error: handleAjaxError
        //});
		// function used for kinvey
        //function registerSuccess(response){
        //     let userAuth = response._kmd.authtoken;
        //     sessionStorage.setItem('authToken', userAuth);
        //     // save the user in sessionStorage:
        //     let userId = response._id; // get the user id
        //     sessionStorage.setItem('userId', userId);
        //	   other code removed from method	
        //}
        let userData = {
            username: $('#registerUser').val(),
            password: $('#registerPass').val()
        };
		
        firebase.auth().createUserWithEmailAndPassword($('#registerUser').val(), $('#registerPass').val())
            .then(response => {
                firebase.auth().currentUser.getIdToken().then(token => {
                    sessionStorage.setItem('authToken', token);
                    sessionStorage.setItem('username', response.user.email);		
                    sessionStorage.setItem('userId', response.user.uid);
					$('#loggedInUser').text(`Welcome, ${response.user.email}!`);
					showHideMenuLinks();
                    showInfo('User registration successful.');
					listBooks(token);
                });
            }).then(() => {
				// clear register user and password fields:
                $('#registerUser').val("");
                $('#registerPass').val("");
            }).catch(function(error) {
                console.log('Error creating new user in Firebase: ', error);
				//console.log(Object.entries(error));
				let errorArray = Object.entries(error);
				showError("Registration failed. Firebase response is: " + errorArray[0][1] + " " + errorArray[1][1]);
            });
    }
	
	// enter method when List Books link is clicked
	function listBooksLink(){
		let token = sessionStorage.getItem('authToken');
		listBooks(token);
	}

    function listBooks(token) {
        console.log("list books");
        //$('#books').empty();
        showView('viewBooks');

		// old kinvey call to get books looked liked this:
        //const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
        //$.ajax({
        //    method: 'GET',
        //    url: kinveyBooksUrl,
        //    headers: getKinveyUserAuthHeaders(),
        //    success: displayPaginationAndBooks,
        //    error: handleAjaxError
        //});
		
		// Firebase get call to get the books
		$.ajax({
               method: 'GET',
               url: timerFirebaseUrl + ".json?auth=" + token,
         //this was wrong to be used: //headers:  JSON.stringify(loginFirebaseHeaders),
	     // not needed:			   //contentType : 'application/json',
               success: displayPaginationAndBooks,
	 		   error : handleAjaxError
        });
    }

    function loadBookForEdit(book, token) {
        //$.ajax({
        //    method: "GET",
        //    url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + book._id,
        //    headers: getKinveyUserAuthHeaders(),
        //    success: loadBookForEditSuccess,
        //    error: handleAjaxError
        //});
		
		// Firebase get call to get the book
		$.ajax({
               method: 'GET',
               url: timerFirebaseUrl + "/" + book[0] + ".json?auth=" + token,
         //this was wrong to be used: //headers:  JSON.stringify(loginFirebaseHeaders),
	     // not needed:			   //contentType : 'application/json',
               success: loadBookForEditSuccess,
	 		   error : handleAjaxError
        });
		
        function loadBookForEditSuccess(latestBookValue) {
			console.log("book data loaded from DB successfully !")
            $('#formEditBook input[name=id]').val(book[0]); // book[0] is the ID (external ID of the record in Firebase)
            $('#formEditBook input[name=title]').val(latestBookValue.title);
            $('#formEditBook input[name=author]').val(latestBookValue.author);
			$('#formEditBook input[name=link]').val(latestBookValue.link);
            $('#formEditBook textarea[name=description]').val(latestBookValue.description);

            showView('viewEditBook');
        }
    }

    function getKinveyUserAuthHeaders() {
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem('authToken')
        };
    }

    function deleteBook(book, token){
		// old kinvey delete code:
        //const kinveyDeleteUrl = kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/books/' + book._id;
        //$.ajax({
        //    method: "DELETE",
        //    url: kinveyDeleteUrl,
        //    headers: getKinveyUserAuthHeaders(),
        //    success: deleteBookSuccess,
        //    error: handleAjaxError
        //});
		
		$.ajax({
               method: 'DELETE',
               url: timerFirebaseUrl + "/" + book[0] + ".json?auth=" + token,
               success: deleteBookSuccess,
	 		   error : handleAjaxError
        });
        function deleteBookSuccess(response){
			showInfo("Book was successfully deleted !");
            listBooks(token);
           
        }
    }

    function showCreateBookView(){
        showView('viewCreateBook');
    }

    function createBook(){
        let token = sessionStorage.getItem('authToken');
        let creatorID = sessionStorage.getItem('userId');		
        // let bookID = Math.random().toString(33).substr(2, 7) + Date.now(); // no need to create self-made ID
		
		let bookData = { 
			_aclcreator: creatorID,
            title: $('#bookTitle').val().substr(0,37),
            author: $('#bookAuthor').val().substr(0,37),
			link: $('#bookLink').val().substr(0,121),
            description: $('#bookDescription').val().substr(0,177)
        };
		//   console.log("book data : " + bookData)
		$.ajax({
            method: 'POST',
            url: timerFirebaseUrl + ".json" + "?auth=" + token,
            data: JSON.stringify(bookData),
		    success: createBookSuccess,
		    error: handleAjaxError
        });
       

		// old kinvey data POST call:
		//const kinveyBooksUrl = kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/books';
        //$.ajax({
        //    method: 'POST',
        //    url: kinveyBooksUrl,
        //    headers: getKinveyUserAuthHeaders(),
        //    data: bookData,
        //    success: createBookSuccess,
        //    error: handleAjaxError
        //});
        function createBookSuccess(response){
            listBooks(token);
            showInfo('Book created.');
        }
    }
    //Math.random().toString(33).substr(2, 7) + Date.now();
    function editBook(){
		let token = sessionStorage.getItem('authToken');
        let bookData = {
			title: $('#formEditBook input[name=title]').val().substr(0,37),
            author: $('#formEditBook input[name=author]').val().substr(0,37),
			link: $('#formEditBook input[name=link]').val().substr(0,121),
            description: $('#formEditBook textarea[name=description]').val().substr(0,177)
        };
		// old kinvey call, the call was based on the id of the book:
        //$.ajax({
        //    method: "PUT",
        //    url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + $('#formEditBook input[name=id]').val(),
        //    headers: getKinveyUserAuthHeaders(),
        //    data: bookData,
        //    success: editBookSuccess,
        //    error: handleAjaxError
        //});
		// with PATCH we make a partial update, instead of whole update, as PUT does:
		console.log("Id is: " + $('#formEditBook input[name=id]').val())
	    $.ajax({
            method: 'PATCH',
            url: timerFirebaseUrl + "/" + $('#formEditBook input[name=id]').val() +".json" + "?auth=" + token,
            data: JSON.stringify(bookData),
	    	success: editBookSuccess,
	    	error: handleAjaxError
         });
        function editBookSuccess(response){
			console.log("book successfully edited !");
            listBooks(token);
            showInfo("Book edited.");
        }
    }

    function logout(){
        sessionStorage.clear();
		firebase.auth().signOut();
		 $('#loggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
    }

    function displayPaginationAndBooks(books) {
		let token = sessionStorage.getItem('authToken');
        // display the list of books in descending order by creation
		// convert books Object to array with data, in order to get it properly:
		let booksReversed = Object.entries(books).reverse()
		
		// value check:
		//console.log(Object.keys(books));
		//console.log(booksReversed); // get all data in array mode
		//console.log(Object.entries(books)[0]); // get first value
		//console.log(Object.entries(books)[0][0]); // get the global ID
		//console.log(Object.entries(books)[0][1].author); // get author
		
        showView('viewBooks');
        let pagination = $('#pagination-of-books');
        if(pagination.data("twbs-pagination")){
            pagination.twbsPagination('destroy')
        }
        pagination.twbsPagination({
            // how much pages we will have:
            totalPages: Math.ceil(booksReversed.length / BOOKS_PER_PAGE),
            // how much pages will be visible in the menu:
            visiblePages: 5,
            // paging buttons
            next: 'Next',
            prev: 'Prev',
            // when you click on the page do these actions:
            onPageClick: function (event, page) {
                //define our table:
                let table = $('#books > table');
                // remove the old pages:
                table.find('tr').each((index, el) => {
                    if(index > 0) {
                        $(el).remove()
                    }
                });
                // page is the current page
                // first book on the page:
                let startBook = (page - 1) * BOOKS_PER_PAGE;
                // the last book on the page
                let endBook = Math.min(startBook + BOOKS_PER_PAGE, booksReversed.length);
                $(`a:contains(${page})`).addClass('active');
                for (let i = startBook; i < endBook; i++) {
                    let tr = $(`<tr>`);
                    table.append(
                        $(tr).append($(`<td>${booksReversed[i][1].title.substr(0,37)}</td>`))
                             .append($(`<td>${booksReversed[i][1].author.substr(0,37)}</td>`))
                             .append($(`<td>${booksReversed[i][1].description.substr(0,100)}</td>`))
							 // target="_blank" makes link open in new tab or window
							 .append($(`<td><a href=\"${booksReversed[i][1].link}\" target="_blank">${booksReversed[i][1].link.substr(0,33)}</a></td>`))
                    );
                    if(booksReversed[i][1]._aclcreator === sessionStorage.getItem('userId')) {
                        $(tr).append(
                            $(`<td>`).append(
                                $('<a href=\"#\" class=\"editButton\">Edit</a>').on('click', function () {
                                    loadBookForEdit(booksReversed[i], token)
                                })
                            ).append(
                                $('<a href=\"#\" class=\"deleteButton\">Delete</a>').on('click', function () {
                                    deleteBook(booksReversed[i], token)
                                })
                            )
                        );
                        // end of if
                    } else{
                        $(tr).append($('<td>'));
                    }
                } // end of for cycle
            }// end of onPageClick
        });// end of displayPaginationAndBooks
    } // end of displayPaginationAndBooks
} // end of startApplication

// attach loader to the body
$(document).ready( function () {
    var id = 'loader', fill = '#FFC477',
        size = 30, radius = 3, duration = 1000,
        maxOpacity = 1, minOpacity = 0.15;
    $('<svg id="'+id+'" width="'+(size*3.5)+'" height="'+size+'">' +
        '<rect width="'+size+'" height="'+size+'" x="0" y="0" rx="'+radius+'" ry="'+radius+'" fill="'+fill+'" fill-opacity="'+maxOpacity+'">' +
        '<animate attributeName="opacity" values="1;'+minOpacity+';1" dur="'+duration+'ms" repeatCount="indefinite"/>' +
        '</rect>' +
        '<rect width="'+size+'" height="'+size+'" x="'+(size*1.25)+'" y="0" rx="'+radius+'" ry="'+radius+'" fill="'+fill+'" fill-opacity="'+maxOpacity+'">' +
        '<animate attributeName="opacity" values="1;'+minOpacity+';1" dur="'+duration+'ms" begin="'+(duration/4)+'ms" repeatCount="indefinite"/>' +
        '</rect>' +
        '<rect width="'+size+'" height="'+size+'" x="'+(size*2.5)+'" y="0" rx="'+radius+'" ry="'+radius+'" fill="'+fill+'" fill-opacity="'+maxOpacity+'">' +
        '<animate attributeName="opacity" values="1;'+minOpacity+';1" dur="'+duration+'ms" begin="'+(duration/2)+'ms" repeatCount="indefinite"/>' +
        '</rect>' +
        '</svg>').appendTo('body');
    $('#loader').hide();
});

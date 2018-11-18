function startApplication(){

   'use strict';
   // working data of some guy
   // const kinveyBaseUrl = "https://baas.kinvey.com/";
   // const kinveyAppKey = "kid_HJFh6nWL";
   // const kinveyAppSecret = "299c85c5a1af47e7978c40ba2dff565d";

   const kinveyBaseUrl = "https://baas.kinvey.com/";
   const kinveyAppKey = "kid_BysPrvXlz";
   const kinveyAppSecret = "b741d837b8034ce5bd42b02c510013b5";

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
    $('#linkListBooks').click(listBooks);
    $('#linkCreateBooks').click(showCreateBookView);
    $('#linkLogout').click(logout);  /// when we click on the Logout link activate the logout function and do the logout itself
    
	// Bind the info / error boxes
    $("#infoBox, #errorBox").on('click', function() {
        $(this).fadeOut()
    })
	
    $('#formLogin').submit(function (e) {
        e.preventDefault();
        login();
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
        }, 5000);
    }

    function showHomeView(){
        showView('viewHome');
    }

    function showLoginView() {
        showView('viewLogin');
    }

    function login() {
        const kinveyLoginUrl = kinveyBaseUrl + 'user/' + kinveyAppKey + '/login';
        const kinveyAuthHeaders = {
            'Authorization': 'Basic ' + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        };
        let userData = {
            username: $('#loginUser').val(),
            password: $('#loginPass').val()
        };
        $.ajax({
            method: 'POST',
            url: kinveyLoginUrl,
            headers: kinveyAuthHeaders,
            data: userData,
            success: loginSuccess,
            error: handleAjaxError
        });
        function loginSuccess(response) {
            let userAuth = response._kmd.authtoken;
            sessionStorage.setItem('authToken', userAuth);
            // save the user in sessionStorage:
            let userId = response._id; // get the user id
            sessionStorage.setItem('userId', userId);
			$('#loggedInUser').text(`Welcome, ${response.username}!`);
            showHideMenuLinks();
            listBooks();
            showInfo('Login successful.');
        }
    }

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
        const kinveyRegisterUrl = kinveyBaseUrl + 'user/' + kinveyAppKey + '/';
        const kinveyAuthHeaders = {
            'Authorization':'Basic ' + btoa(kinveyAppKey + ":" + kinveyAppSecret),
        };
        let userData = {
            username: $('#registerUser').val(),
            password: $('#registerPass').val()
        };
        $.ajax({
            method: 'POST',
            url: kinveyRegisterUrl,
            headers: kinveyAuthHeaders,
            data: userData,
            success: registerSuccess,
            error: handleAjaxError
        });
        function registerSuccess(response){
             let userAuth = response._kmd.authtoken;
             sessionStorage.setItem('authToken', userAuth);
             // save the user in sessionStorage:
             let userId = response._id; // get the user id
             sessionStorage.setItem('userId', userId);
             $('#loggedInUser').text(`Welcome, ${response.username}!`);
             showHideMenuLinks();
             listBooks();
             showInfo('User registration successful.');
         }
    }

    function listBooks() {

        $('#books').empty();
        showView('viewBooks');

        const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
        
        $.ajax({
            method: 'GET',
            url: kinveyBooksUrl,
            headers: getKinveyUserAuthHeaders(),
            success: loadBooksSuccess,
            error: handleAjaxError
        });

        function loadBooksSuccess(books){
            // showInfo('Books loaded.');
            if (books.length == 0){
                $('#books').text('No books in the library.');
            }else {
                let booksTable = $('<table>')
                    .append($('<tr>').append(
                        '<th>Title</th>',
                        '<th>Author</th>',
                        '<th>Description</th>',
                        '<th>Actions</th>'
                      )
                    );

                for (let book of books) {

                    // functionality for edit and delete a book:
                    let links = [];
                    // show edit and delete buttons for author of the book:
                    if(book._acl.creator == sessionStorage['userId']) {
                        let editLink = $('<a href=\"#\" class=\"editButton\">Edit</a>').click(function () {
                            loadBookForEdit(book);
                        });
                        let deleteLink = $('<a href=\"#\" class=\"deleteButton\">Delete</a>').click(function () {
                            deleteBook(book);
                        });
                        links = [editLink,' ', deleteLink];
                    }


                    booksTable.append($('<tr>').append(
                        $('<td>').text(book.title),
                        $('<td>').text(book.author),
                        $('<td>').text(book.description),
                        // display the edit and delete buttons:
                        $('<td>').append(links)
                        )
                        // if we add it here it will be shown for each of the users
                        //.append("<a href=\"#\" class=\"editButton\">Edit</a>")
                        //.append("<a href=\"#\" class=\"deleteButton\">Delete</a>")
                    );
                }
                $('#books').append(booksTable);
            }
        } // end of loadBooksSuccess
    }

    function loadBookForEdit(book) {
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + book._id,
            headers: getKinveyUserAuthHeaders(),
            success: loadBookForEditSuccess,
            error: handleAjaxError
        });

        function loadBookForEditSuccess(book) {
            $('#formEditBook input[name=id]').val(book._id);
            $('#formEditBook input[name=title]').val(book.title);
            $('#formEditBook input[name=author]').val(book.author);
            $('#formEditBook textarea[name=description]').val(book.description);

            showView('viewEditBook');
        }
    }

    function getKinveyUserAuthHeaders() {
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem('authToken')
        };
    }

    function deleteBook(book){
        const kinveyDeleteUrl = kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/books/' + book._id;
        $.ajax({
            method: "DELETE",
            url: kinveyDeleteUrl,
            headers: getKinveyUserAuthHeaders(),
            success: deleteBookSuccess,
            error: handleAjaxError
        });
        function deleteBookSuccess(response){
            listBooks();
            showInfo("Book was successfully deleted !");
        }
    }

    function showCreateBookView(){
        showView('viewCreateBook');
    }

    function createBook(){
        const kinveyBooksUrl = kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/books';

        let bookData = {
            title: $('#bookTitle').val(),
            author: $('#bookAuthor').val(),
            description: $('#bookDescription').val()
        };
        $.ajax({
            method: 'POST',
            url: kinveyBooksUrl,
            headers: getKinveyUserAuthHeaders(),
            data: bookData,
            success: createBookSuccess,
            error: handleAjaxError
        });
        function createBookSuccess(response){
            listBooks();
            showInfo('Book created.');
        }
    }

    function editBook(){
        let bookData = {
            title: $('#formEditBook input[name=title]').val(),
            author: $('#formEditBook input[name=author]').val(),
            description: $('#formEditBook textarea[name=description]').val()
        };
        $.ajax({
            method: "PUT",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + $('#formEditBook input[name=id]').val(),
            headers: getKinveyUserAuthHeaders(),
            data: bookData,
            success: editBookSuccess,
            error: handleAjaxError
        });
        function editBookSuccess(response){
            listBooks();
            showInfo("Book edited.");
        }
    }

    function logout(){
        sessionStorage.clear();
		 $('#loggedInUser').text("");
        showHideMenuLinks();
        showView('viewHome');
    }

}

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

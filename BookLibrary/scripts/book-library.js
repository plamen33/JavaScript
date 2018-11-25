function startApplication(){

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
            showInfo('Login successful.');
			listBooks();
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

        //$('#books').empty();
        showView('viewBooks');

        const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
        
        $.ajax({
            method: 'GET',
            url: kinveyBooksUrl,
            headers: getKinveyUserAuthHeaders(),
            success: displayPaginationAndBooks,
            error: handleAjaxError
        });
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
            description: $('#bookDescription').val().substr(0,100)
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
            description: $('#formEditBook textarea[name=description]').val().substr(0,100)
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

    function displayPaginationAndBooks(books) {
        // display the list of books in descending order by creation
        let booksReversed = books.reverse();
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
                        $(tr).append($(`<td>${booksReversed[i].title}</td>`))
                             .append($(`<td>${booksReversed[i].author}</td>`))
                             .append($(`<td>${booksReversed[i].description}</td>`))
                    );
                    if(booksReversed[i]._acl.creator === sessionStorage.getItem('userId')) {
                        $(tr).append(
                            $(`<td>`).append(
                                $('<a href=\"#\" class=\"editButton\">Edit</a>').on('click', function () {
                                    loadBookForEdit(booksReversed[i])
                                })
                            ).append(
                                $('<a href=\"#\" class=\"deleteButton\">Delete</a>').on('click', function () {
                                    deleteBook(booksReversed[i])
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

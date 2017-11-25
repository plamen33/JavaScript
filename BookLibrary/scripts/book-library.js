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

$(function () {  // $ (function (){}) means in jQuery that after the DOM tree is loaded then load this function
    showHideMenuLinks();
    showView('viewHome');

    $('#linkHome').click(showHomeView);  // these code activates the form of view which we set -> when we click on the screen the specific form/page opens
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView)
    $('#linkListBooks').click(listBooks);
    $('#linkCreateBooks').click(showCreateBookView);
    $('#linkLogout').click(logout);  /// when we click on the Logout link activate the logout function and do the logout itself

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
        createBook()
    });

    $(document).on({
        ajaxStart: function () {
            $('#loadingBox').show()
        },
        ajaxStop: function () {
            $('#loadingBox').hide()
        }
    });
})

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
        showHideMenuLinks();
        listBooks();
        showInfo('Login successful.');
    }
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify((response));
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.repsonseJSON.description)
        errorMsg = response.responseJSON.description;
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
        showHideMenuLinks();
        listBooks();
        showInfo('User registration successful.');
    }
}

function listBooks() {
    $('#books').empty();
    showView('viewBooks');

    const kinveyBooksUrl = kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books";
    const kinveyAuthHeaders = {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
    };
    $.ajax({
        method: 'GET',
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        success: loadBooksSuccess,
        error: handleAjaxError
    });

    function loadBooksSuccess(books){
        showInfo('Books loaded.');
        if (books.length == 0){
            $('#books').text('No books in the library.');
        }else {
            let booksTable = $('<table>')
                .append($('<tr>').append(
                    '<th>Title</th>',
                    '<th>Author</th>',
                    '<th>Description</th>')
                );
            for (let book of books) {
                booksTable.append($('<tr>').append(
                    $('<td>').text(book.title),
                    $('<td>').text(book.author),
                    $('<td>').text(book.description))
                );
            }
            $('#books').append(booksTable);
        }
    }
}

function showCreateBookView(){
    showView('viewCreateBook');
}

function createBook(){
    const kinveyBooksUrl = kinveyBaseUrl + 'appdata/' + kinveyAppKey + '/books';
    const kinveyAuthHeaders = {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
    };
    let bookData = {
        title: $('#bookTitle').val(),
        author: $('#bookAuthor').val(),
        description: $('#bookDescription').val()
    };
    $.ajax({
        method: 'POST',
        url: kinveyBooksUrl,
        headers: kinveyAuthHeaders,
        data: bookData,
        success: createBookSuccess,
        error: handleAjaxError
    });
    function createBookSuccess(response){
        listBooks();
        showInfo('Book created.');
    }
}

function logout(){
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');
}


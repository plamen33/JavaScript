// Search bar Handler:

$(function(){
    let searchField = $('#query');
    let icon = $('#search-button');

    // Focus Handler
    $(searchField).on('focus', function(){
       $(this).animate({
           width: '100%'
       }, 400); // 400 is the speed

        $(icon).animate({
            right: '10px'
        }, 400);
    });

    // Blur Event Handler
    $(searchField).on('blur', function(){
      if(searchField.val()==""){
          $(searchField).animate({
              width:'45%'
          }, 400, function(){});
          $(icon).animate({
              right: '420px'  // use here the same value as in #search-button css
          }, 400);
      }
    });
    
    $('#search-form').submit( function(event){
       event.preventDefault();
    });
});

// we added two args (they are blank if you use the search form) so that same function can be used for paging instead of copying
// all the code TWICE into the Prev and Next Page functions.
function search(token, q) {
    // clear the containers we already have in HTML
    $('#results').html('');
    $('#buttons').html('');

    // Get the form field input
    // I added the if-test to streamline Prev and Next Page functions
    if (!q) {
        q = $('#query').val(); // id of the search input field in HTML
    }

    // send GET request to the API (jQuery GET method)
    // the URL for GET came from:
    // https://developers.google.com/youtube/v3/docs/search/list
    // also the options, such as part and q, come from there (long list)

    $.get(
        "https://www.googleapis.com/youtube/v3/search",{ // URL for GET
            part: 'snippet, id',  // parameter from YouTube API
            q: q,
            pageToken: token,
            key: 'AIzaSyCesJtY39LzTpR4XaMetWopcWgWfv_GZ0I' // API Key 
        },
        function(data){ // see below re: "data"
            let nextPageToken = data.nextPageToken;
            let prevPageToken = data.prevPageToken;
            // nextPageToken and prevPageToken are supplied by YouTube
            // and will allow us to retrieve the next set of results
            //console.log("the token is :" + token);
            console.log(data);
            // "data" contains all the data sent from YouTube API.
            // By logging it, we can see that, and we can open the
            // "snippet" in the Console and see title, descrip, etc.
            // for each video (see http://api.jquery.com/jquery.get/
            // for origin of "data")

            // we do a each loop to loop through the list of videos we get:
            $.each(data.items, function(i, item) {
                // get HTML output; see below for the function
                let output = getOutput(item);

                // Display results on our index HTML page
                // output comes from getOutput() below
                $('#results').append(output);
            });

            var buttons = getButtons(prevPageToken, nextPageToken, q);

            // Display the two buttons in HTML; see below for the function
            // buttons comes from getButtons() below
            $('#buttons').append(buttons);

        }
    ); // end .get() method
} // end search function

function prevPage() {
    var token = $('#prev-button').data('token');
    var q = $('#prev-button').data('query');
    // above does not exist in HTML; is written by getButtons() below
    search(token, q);
}

function nextPage() {
    var token = $('#next-button').data('token');
    var q = $('#next-button').data('query');
    // above does not exist in HTML; is written by getButtons() below
    search(token, q);
}



// build the output to be displayed in our HTML
function getOutput(item) {

    // parameter names come from the data object example: Object > Items > 0-7 > id, snippet
    let videoId = item.id.videoId;
    let title = item.snippet.title;
    let description = item.snippet.description;
    let thumb = item.snippet.thumbnails.medium.url;
    let channelTitle = item.snippet.channelTitle;
    // sometimes this value is empty:
    let videoDate = item.snippet.publishedAt;

    // Build output string with HTML for one video
    // we're building two divs to float left & right inside a single <li>
    // all styled in the CSS
    let output = '<li>' +
        '<div class="list-left">' +
        '<img src="' +thumb+ '">' +
        '</div>' +
        '<div class="list-right">' +
        '<h3><a class="fancybox fancybox.iframe"' +
        ' href="https://www.youtube.com/embed/' +videoId+ '">' +title+ '</a></h3>' +
        '<p class="small">By <span class="channelTitle">' +channelTitle+ '</span> on ' +videoDate+
        '</p>' +
        '<p>' +description+ '</p>' +
        '</div>' +
        '</li>' +
        '<div class="clearfloats"></div>' +
        '';

    return output;
}


// A function to get the buttons to be displayed in our HTML
function getButtons(prevPageToken, nextPageToken, q) {
    let prevButton = '<button id="prev-button" class="paging-button"' +
        ' data-token="' + prevPageToken + '" data-query="' + q + '"' +
        ' onclick="prevPage();">Prev Page</button>';

    let nextButton = '<button id="next-button" class="paging-button"' +
        ' data-token="' + nextPageToken + '" data-query="' + q + '"' +
        ' onclick="nextPage();">Next Page</button>';

    if(!prevPageToken){
        var buttonOutput = '<div class="button-container">' +
            nextButton + '</div>';
        // probably should add if-not-nextPageToken they might go on forever anyway
    } else {
        var buttonOutput = '<div class="button-container">' +
            prevButton + ' ' +nextButton+ '</div>';
    }
    return buttonOutput;
}

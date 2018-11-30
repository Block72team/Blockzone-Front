
function getParameterByName(target) {
    // Get request URL
    let url = window.location.href;
    // Encode target parameter name to url encoding
    target = target.replace(/[\[\]]/g, "\\$&");

    // Ues regular expression to find matched parameter value
    let regex = new RegExp("[?&]" + target + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    // Return the decoded parameter value
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function handleTags(tags) {
    var result = '<h5>Tags:<br>';
    for(let i = 0; i < tags.length; i++) {
        result += '<a href="post-preview.html?tag=' + tags[i]['id'] + '&tagName=' + tags[i]['name'] + '" style="padding: 5px">' + tags[i]['name'] + ' </a>';
    }
    return result;
}

/** 
 * Handles the data returned by the API, read the jsonObject and populate data into html elements
 * @param resultData jsonObject
 */
function handlePostResult(resultData) {
    console.log("handlePostResult:");
    console.log(resultData)

    document.title = resultData[0]['title'];

    // Populate the star table
    // Find the empty table body by id "star_table_body"
    let postPreviewElement = jQuery("#post");

    // Iterate through resultData, no more than 10 entries
    for (let i = 0; i < resultData.length; i++) {
        // Concatenate the html tags with resultData jsonObject
        let rowHTML = '';
        rowHTML += '<h2 style="font-weight: 200;margin-bottom: 50px;margin-top: 50px;">' + resultData[i]['title'] + '</h2>';
        rowHTML += '<img class="col-12 col-lg-11 p-0 w-100" src="' + resultData[i]['photo_url'] + '" alt="Generic placeholder image">';
        rowHTML += '<div class="row" style="margin-top: 50px">';
        rowHTML += '<div class="col-12 col-lg-3"><div class="sticky-top"><h5>Category:<br><a href="post-preview.html?category=' + resultData[i]['c_id'] + '">' + resultData[i]['c_name'] + '</a></h5><hr>';
        rowHTML += handleTags(resultData[i]['tags']) + '<hr>';
        rowHTML += '<h5>Share This:</h5>';
        rowHTML += '<a class="btn btn-social-icon btn-twitter" style="font-size: 2em;" href="https://twitter.com/intent/tweet/?url=blockzone.com/post?id=' + resultData[i]['id'] + '"><span class="fab fa-twitter"></span> </a>';
        rowHTML += '<a class="btn btn-social-icon btn-facebook" style="font-size: 2em;" href="https://facebook.com/sharer/sharer.php?u=blockzone.com/post?id=' + resultData[i]['id'] + '"><span class="fab fa-facebook"></span> </a>';
        rowHTML += '<a class="btn btn-social-icon btn-linkedin" style="font-size: 2em;" href="https://www.linkedin.com/shareArticle?mini=true&amp;url=blockzone.com/post?id=' + resultData[i]['id'] + '"><span class="fab fa-linkedin"></span> </a>';
        rowHTML += '</div></div>';
        rowHTML += '<div class="col-12 col-lg-8">';
        rowHTML += '<p>' + resultData[i]['content'] + '</p>';
        rowHTML += '<br><center><button id="like" class="btn btn-outline-secondary" type="button" onclick="like()"><i id="like-icon" class="fas fa-thumbs-up" style="margin-right: 10px;"></i>Like this!</button></center>';
        rowHTML += '</div></div><hr>';

        postPreviewElement.append(rowHTML);
    }
}

function handleTopPostResult(resultData) {
    console.log("handleTopPostResult:");
    console.log(resultData)

    // Populate the star table
    // Find the empty table body by id "star_table_body"
    let handleTopPostResult = jQuery("#topnews");

    // Iterate through resultData, no more than 10 entries
    for (let i = 0; i < resultData.length; i++) {
        // Concatenate the html tags with resultData jsonObject
        let rowHTML = '<div class="media">';
        rowHTML += '<img class="align-self-start mr-3" src="' + resultData[i]['thumb_url'] + '" style="width: 30%" alt="Generic placeholder image">';
        rowHTML += '<div class="media-body">';
        rowHTML += '<h5 class="mt-0"><a href="post.html?id=' + resultData[i]['id'] + '">' + resultData[i]['title'] + '</a></h5>';
        rowHTML += '<div style="display: inline-block;color: gray;float: right">';
        rowHTML += '<small><i class="far fa-clock" style="margin-right: 5px;margin-left: 10px"></i>' + resultData[i]['update_time'].substring(0,10) + '</small>'
        rowHTML += '</div></div></div><hr>';

        handleTopPostResult.append(rowHTML);
    }
}


/**
 * Once this .js is loaded, following scripts will be executed by the browser
 */

let id = getParameterByName('id');

// Makes the HTTP GET request and registers on success callback function handleStarResult
jQuery.ajax({
    dataType: "json", // Setting return data type
    method: "GET", // Setting request method
    url: "http://167.99.238.182:8080/Blockzone/api/post?id=" + id, // Setting request url, which is mapped by StarsServlet in Stars.java
    success: (resultData) => handlePostResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
});

let limit = 10;
jQuery.ajax({
    dataType: "json", // Setting return data type
    method: "GET", // Setting request method
    url: "http://167.99.238.182:8080/Blockzone/api/topnews?limit=" + limit, // Setting request url, which is mapped by StarsServlet in Stars.java
    success: (resultData) => handleTopPostResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
});

function like() {
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "http://167.99.238.182:8080/Blockzone/api/like?id=" + id,
        success: function(resultData) {
            console.log(resultData);
            document.getElementById("like").setAttribute('disabled', 'disabled');
            jQuery("#like").html('<i id="like-icon" class="fas fa-thumbs-up" style="margin-right: 10px;"></i>Liked!');
        }
    })
}

function search() {
    var keyword = jQuery("#search-input").val();
    if(keyword.length == 0) {
        return;
    }
    window.location.href = "post-preview.html?keyword="+keyword;
}

function subscribe() {
    var email = jQuery("#subscribe-field-blog_subscription-3").val();
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "http://167.99.238.182:8080/Blockzone/api/subscribe?email=" + email,
        success: function(resultData) {
            console.log(resultData);
            if(resultData['status'] == true) {
                alert("Please Check your email to confirm the subscribtion");
            } else {
                alert("Fail to subsribe.");
            }
        }
    })
}
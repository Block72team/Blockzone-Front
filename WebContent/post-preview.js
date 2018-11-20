
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

/**
 * Handles the data returned by the API, read the jsonObject and populate data into html elements
 * @param resultData jsonObject
 */
function handlePostPreviewResult(resultData) {
    console.log("handlePostPreviewResult:");
    console.log(resultData);

    if(page == 0){
        document.title = category ? resultData[0]['c_name'] : (keyword ? 'Search Results: '+keyword : (tag ? 'tag: '+tagName : 'All News'));
        jQuery("#post-preview-header").append(category ? resultData[0]['c_name'] : (keyword ? 'Search Results: '+keyword : (tag ? 'Tag: '+tagName : 'All News')));
        jQuery("#post-preview-header").append(region ? " Region: "+region : '');
    }
    page++;

    // Populate the star table
    // Find the empty table body by id "star_table_body"
    let postPreviewElement = jQuery("#posts");

    // Iterate through resultData, no more than 10 entries
    for (let i = 0; i < resultData.length; i++) {
        // Concatenate the html tags with resultData jsonObject
        let rowHTML = '<div class="media">';
        rowHTML += '<img class="align-self-start mr-3" src="' + resultData[i]['thumb_url'] + '" style="width: 30%" alt="Generic placeholder image">';
        rowHTML += '<div class="media-body">';
        rowHTML += '<h3 class="mt-0"><a href="post.html?id=' + resultData[i]['id'] + '">' + resultData[i]['title'] + '</a></h3>';
        rowHTML += '<p>' + resultData[i]['content'].substring(0, Math.min(resultData[i]['content'].length, 500)) + '...</p>';
        rowHTML += '<div style="display: inline-block;color: gray;float: right">';
        rowHTML += '<small><i class="far fa-star" style="margin-right: 5px;"></i><a href="post-preview.html?category=' + resultData[i]['c_id'] + '">' + resultData[i]['c_name'] + '</a></small>';
        rowHTML += '<small><i class="far fa-user" style="margin-right: 5px; margin-left: 10px"></i><a href="post-preview.html?author=' + resultData[i]['author'] + '">' + resultData[i]['author'] + '</a></small>';
        rowHTML += '<small><i class="far fa-clock" style="margin-right: 5px;margin-left: 10px"></i><a href="post-preview.html?time=' + resultData[i]['update_time'].substring(0,10) + '">' + resultData[i]['update_time'].substring(0,10) + '</a></small>';
        rowHTML += '</div></div></div><hr>';

        postPreviewElement.append(rowHTML);
    }
}

function handleTopPostResult(resultData) {
    console.log("handleTopPostResult: ");
    console.log(resultData);

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
        rowHTML += '<small><i class="far fa-clock" style="margin-right: 5px;margin-left: 10px"></i><a href="post-preview.html?time=' + resultData[i]['update_time'].substring(0,10) + '">' + resultData[i]['update_time'].substring(0,10) + '</a></small>';
        rowHTML += '</div></div></div><hr>';

        handleTopPostResult.append(rowHTML);
    }
}


/**
 * Once this .js is loaded, following scripts will be executed by the browser
 */

let limit = getParameterByName('limit');
limit = limit ? limit : 12;
let page = getParameterByName('page');
page = page ? page : 0;

let category = getParameterByName('category');
let region = getParameterByName('region');
let author = getParameterByName('author');
let time = getParameterByName('time');
let keyword = getParameterByName('keyword');
let tag = getParameterByName('tag');
let tagName = getParameterByName('tagName');

let request_url = "http://167.99.238.182:8080/Blockzone/api/post-preview?limit=" + limit;
request_url += category ? "&category="+category : '';
request_url += region ? "&region="+region : '';
request_url += author ? "&author="+author : '';
request_url += time ? "&time="+time : '';
request_url += keyword ? "&keyword="+keyword : '';
request_url += tag ? "&tag="+tag : '';

// Makes the HTTP GET request and registers on success callback function handleStarResult
function getPostPreviews() {
    jQuery.ajax({
        dataType: "json", // Setting return data type
        method: "GET", // Setting request method
        url: request_url + '&page=' + page, // Setting request url, which is mapped by StarsServlet in Stars.java
        success: (resultData) => handlePostPreviewResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
    });
}
// initial run
getPostPreviews();

jQuery.ajax({
    dataType: "json", // Setting return data type
    method: "GET", // Setting request method
    url: "http://167.99.238.182:8080/Blockzone/api/topnews?limit=" + '10', // Setting request url, which is mapped by StarsServlet in Stars.java
    success: (resultData) => handleTopPostResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
});

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
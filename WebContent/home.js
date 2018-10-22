/**
 * Handles the data returned by the API, read the jsonObject and populate data into html elements
 * @param resultData jsonObject
 */
function handlePostPreviewResult(resultData) {
    console.log("handlePostPreviewResult:");
    console.log(resultData)

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

    let carouselPostElement = jQuery("#carousel-posts");
    let carouselIndicator = jQuery('#indicator');
    let carouselLimit = 4;
    var active = 'active';

    for(let i = 0; i < carouselLimit; i++) {
        let indicatorHtml = '';
        indicatorHtml += '<li data-target="#carousel" data-slide-to="' + i + '" class="' + active + '"></li>'
        carouselIndicator.append(indicatorHtml);

        let rowHTML = '<div class="carousel-item ' + active+ '">';
        active = '';
        rowHTML += '<a href="post.html?id=' + resultData[i]['id'] + '">' 
        rowHTML += '<div style="height:550px;">'
        rowHTML += '<div style="position: absolute; padding:100px 0px 0px 200px">'
        rowHTML += '<div class="text-white" style="background-color: rgba(73, 82, 181, 0.55); width: 900px">'
        rowHTML += '<div style="padding: 10px"><h5>' + resultData[i]['c_name'] + '</h5><br>'
        rowHTML += '<h1>' + resultData[i]['title'] + '</h1><br>'
        rowHTML += '</div></div></div>'
        rowHTML += '<img class="d-block w-100" style="width: 100%" src="' + resultData[i]['photo_url'] + '" alt="#' + i + ' slide"></a><div>';
        rowHTML += '</div></div>';

        carouselPostElement.append(rowHTML);
    }
}


/**
 * Once this .js is loaded, following scripts will be executed by the browser
 */

let limit = 12;

// Makes the HTTP GET request and registers on success callback function handleStarResult
jQuery.ajax({
    dataType: "json", // Setting return data type
    method: "GET", // Setting request method
    url: "api/post-preview?limit=" + limit + '&page=' + 0, // Setting request url, which is mapped by StarsServlet in Stars.java
    success: (resultData) => handlePostPreviewResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
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
        url: "api/subscribe?email=" + email,
        success: function(resultData) {
            console.log(resultData);
            if(resultData['status'] == true) {
                alert("You've successfully subscribed!");
            } else {
                alert("Fail to subsribe.");
            }
        }
    })
}
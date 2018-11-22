
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

function handleTopPostResult(resultData) {
    console.log("handleTopPostResult: ");
    console.log(resultData);

    // Populate the star table
    // Find the empty table body by id "star_table_body"
    let handleTopPostResult = jQuery("#topnews");

    // Iterate through resultData, no more than 10 entries
    for (let i = 0; i < resultData.length; i++) {
        // Concatenate the html tags with resultData jsonObject
        let rawHTML = '<div class="media">';
        rawHTML += '<img class="align-self-start mr-3" src="' + resultData[i]['thumb_url'] + '" style="width: 30%" alt="Generic placeholder image">';
        rawHTML += '<div class="media-body">';
        rawHTML += '<p class="mt-0" style="font-size: medium;"><a href="post.html?id=' + resultData[i]['id'] + '">' + resultData[i]['title'] + '</a></hp>';
        // rawHTML += '<div style="display: inline-block;color: gray;float: right">';
        // rawHTML += '<small><i class="far fa-clock" style="margin-right: 5px;margin-left: 10px"></i><a href="post-preview.html?time=' + resultData[i]['update_time'].substring(0,10) + '">' + resultData[i]['update_time'].substring(0,10) + '</a></small>';
        rawHTML += '</div></div><hr>';

        handleTopPostResult.append(rawHTML);
    }
}

//get top posts
jQuery.ajax({
    dataType: "json", 
    method: "GET",
    url: "http://167.99.238.182:8080/Blockzone/api/topnews?limit=" + '10', 
    success: (resultData) => handleTopPostResult(resultData) 
});


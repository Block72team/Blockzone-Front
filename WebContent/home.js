
function handleContent(content) {
    let string = content.replace(/<(?:.|\n)*?>/gm, '');
    let strings = string.split('.', 5);
    let result = "";
    for(let i = 0; i < strings.length; ++i) {
        if(result.length + strings[i].length < 400)
            result += strings[i] + '. ';
    }
    return result;
}

function handleTitle(title) {
    console.log(title)
    return title.length < 50 ? title : title.substring(0, 47)+'...';
}

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
        let rawHTML =   '<div class="media">' +
                            '<div class="preview-img mr-3">'+
                                '<img class="align-self-start img-fluid" src="' + resultData[i]['thumb_url'] + '" alt="Generic placeholder image">' +
                            '</div>' +
                            '<div class="media-body">' + 
                                '<h3 class="mt-0">' + 
                                    '<a href="post.html?id=' + resultData[i]['id'] + '">' + resultData[i]['title'] + '</a>' + 
                                '</h3>' +
                                '<p class="brief-content d-none d-lg-block">' + handleContent(resultData[i]['content']) + '</p>' +
                                '<div style="display: inline-block;color: gray;float: right">' +
                                    '<small><i class="far fa-star" style="margin-right: 5px;"></i><a href="post-preview.html?category=' + resultData[i]['c_id'] + '">' + resultData[i]['c_name'] + '</a></small>' +
                                    '<small><i class="far fa-user" style="margin-right: 5px; margin-left: 10px"></i><a href="post-preview.html?author=' + resultData[i]['author'] + '">' + resultData[i]['author'] + '</a></small>' +
                                    '<small><i class="far fa-clock" style="margin-right: 5px;margin-left: 10px"></i><a href="post-preview.html?time=' + resultData[i]['update_time'].substring(0,10) + '">' + resultData[i]['update_time'].substring(0,10) + '</a></small>' +
                                '</div>' + 
                            '</div>' +
                        '</div><hr>';

        postPreviewElement.append(rawHTML);
    }
}

function handleFeaturedPostResult(resultData) {
    console.log("handleFeaturedPostResult: ");
    console.log(resultData);

    let featuredPostElement = jQuery("#featured-posts");
    var active = 'active';

    for(let i = 0; i < featuredLimit; i++) {
        let rawHTML =   '<div class="carousel-item ' + active + ' ">' +
                            '<div class="card text-white">' +
                                '<div class="featured">' +
                                    '<img class="card-img img-fluid" src="' + resultData[i]['photo_url'] + '" alt="">' +
                                '</div>' +
                                '<div class="card-img-overlay d-flex linkfeat">' +
                                    '<a href="post.html?id=' + resultData[i]['id'] + '" class="align-self-end">' + 
                                        '<span class="badge">' + resultData[i]['c_name'] + '</span>' +
                                        '<h4 class="card-title">' + resultData[i]['title'] + '</h4>' +
                                        '<p class="textfeat" style="display: none">' + handleContent(resultData[i]['content']) + '</p>' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
        active = '';
        featuredPostElement.append(rawHTML);
    }

    $(".linkfeat").hover(
        function () {
            $(".textfeat").show(500);
        },
        function () {
            $(".textfeat").hide(500);
        }
    );

}

function handleCategoryFeatured(resultData, category_tag) {
    console.log("handling category featured for " + category_tag);
    console.log(resultData);

    let categoryFeatured = jQuery("#" + category_tag);

    for(let i = 0; i < resultData.length; i++) {
        let rawHTML =   '<div class="card text-white">' + 
                            '<div class="category-top">' +
                                '<img class="card-img img-fluid" src="' + resultData[i]['thumb_url'] + '" alt="">' +
                            '</div>' +
                            '<div class="card-img-overlay d-flex linkfeat-sub">' +
                                '<a href="post.html?id=' + resultData[i]['id'] + '" class="align-self-end">' + 
                                    '<span class="badge">' + resultData[i]['c_name'] + '</span>' +
                                    '<h6 class="card-title">' + handleTitle(resultData[i]['title']) + '</h6>' +
                                '</a>' +
                            '</div>' +
                        '</div>';
                        
        categoryFeatured.append(rawHTML);
    }
}

function getCategoryFeatured() {
    category = ['news-top', 'insight-top', 'company-top', 'event-top'];
    for(let i = 1; i <= category.length; i++) {
        jQuery.ajax({
            dataType: "json", // Setting return data type
            method: "GET", // Setting request method
            url: "http://167.99.238.182:8080/Blockzone/api/post-preview?limit=1&page=0&category=" + i + '&tag=837&tagName=top',
            success: (resultData) => handleCategoryFeatured(resultData, category[i-1]) // Setting callback function to handle data returned successfully
        });
    }
}

function getPostPreviews() {
    jQuery.ajax({
        dataType: "json", // Setting return data type
        method: "GET", // Setting request method
        url: "http://167.99.238.182:8080/Blockzone/api/post-preview?limit=" + limit + '&page=' + page, 
        success: (resultData) => handlePostPreviewResult(resultData) // Setting callback function to handle data returned successfully
    });
    page++;
}

function search() {
    var keyword = jQuery("#search-input").val();
    if(keyword.length == 0) {
        return;
    }
    window.location.href = "post-preview.html?keyword="+keyword;
}


/**
 * Once this .js is loaded, following scripts will be executed by the browser
 */

let limit = 12;
let page = 0;

// featured content
let featuredLimit = 4;
jQuery.ajax({
    dataType: "json", 
    method: "GET",
    url: "http://167.99.238.182:8080/Blockzone/api/post-preview?limit=" + featuredLimit + '&page=' + page + '&tag=591&tagName=Featured',
    success: (resultData) => handleFeaturedPostResult(resultData) 
});



getPostPreviews(); //initial
getCategoryFeatured();

// Initialize the plugin
if(localStorage.firstTime == undefined) {
    console.log('Here')
    $('#subscribe-popup').popup({
        transition: 'all 0.3s',
        scrolllock: true,
        autoopen: true,
        detach: true,
        focuselement: '#subscribe-field-blog_subscription-3'
    });
} else {
    $('#subscribe-popup').popup();
}
localStorage.firstTime = true;




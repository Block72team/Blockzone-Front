function subscribe() {
    var email = jQuery("#subscribe-field-blog_subscription-3").val();
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "http://localhost:8080/Blockzone/api/subscribe?email=" + email,
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

let email = getParameterByName('email');
let hashkey = getParameterByName('key');

if(email && hashkey) {
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "http://localhost:8080/Blockzone/api/subscribe?email=" + email + '&key=' + hashkey,
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
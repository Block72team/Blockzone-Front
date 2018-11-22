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

if(email || hashkey) {
    $("#loading-popup").popup('show');
    jQuery.ajax({
        dataType: "json",
        method: "GET",
        url: "http://167.99.238.182:8080/Blockzone/api/subscribe?email=" + email + (hashkey? '&key=' + hashkey : ""),
        success: function(resultData) {
            $("#loading-popup").popup('hide');
            if(resultData['status'] == true) {
                if(hashkey) {
                    $("#success-popup").popup('show');
                } else {
                    $("#confirm-popup").popup('show');
                }
            } else {
                $("#fail-popup").popup('show');
            }
        }
    })
}
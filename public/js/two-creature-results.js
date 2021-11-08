/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

$(document).ready(function(){
    let params = new URLSearchParams(document.location.search.substring(1));
    let creature_1 = params.get("first"); 
    let creature_2 = params.get("second");
    console.log("creature 1: " + creature_1);
    console.log("creature 2: " + creature_2);

    let api_url = "https://en.wikipedia.org/w/api.php?origin=*"; 
    let page_url = "https://en.wikipedia.org/wiki/";

    var url_params = {
        action: "query",
        list: "search",
        srsearch: creature_1,
        format: "json"
    };
    getPageTitle(api_url, url_params);
    
    url_params.srsearch = creature_2;
    getPageTitle(api_url, url_params);
    
    // update header with user-entered values
    //$('h1').text("Classification of " + creature_1 + " and " + creature_2);
     
    // click handler for return to previous page button
    $("#prev-page-btn").click(function () {
        window.history.back();
    });
    
});


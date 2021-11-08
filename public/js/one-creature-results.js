/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

$(document).ready(function(){
    let params = new URLSearchParams(document.location.search.substring(1));
    let creature = params.get("first"); 
    let feature = params.get("second");
    console.log("creature: " + creature);
    console.log("feature: " + feature);
    
    let api_url = "https://en.wikipedia.org/w/api.php?origin=*"; 
    let page_url = "https://en.wikipedia.org/wiki/";

    let url_params = {
        action: "query",
        list: "search",
        srsearch: creature,
        format: "json"
    };
    
    var page_title = {};
    
    getPageTitle(api_url, url_params);


        //console.log(title);

    // setTimeout(function timeout() {
    // console.log(page_title.title);
    // }, 1000);
    //page_url = page_url + title;
    //console.log(page_url);
    
    // update header with user-entered values
    //$('h1').text("Info about " + creature + " and " + feature);

    // request html parser
    // request image parser

    // click handler for return to previous page button
    $("#prev-page-btn").click(function () {
        window.history.back();
    });
    
});


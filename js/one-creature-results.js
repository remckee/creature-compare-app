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
    
    // update header with user-entered values
    //$('h1').text("Info about " + creature + " and " + feature);

    // request html parser
    // request image parser

    // click handler for return to previous page button
    $("#prev-page-btn").click(function () {
        window.history.back();
    });
    
});


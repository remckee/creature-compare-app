/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

$(document).ready(function(){
    let params = new URLSearchParams(document.location.search.substring(1));
    let first = params.get("first"); 
    let second = params.get("second");
    console.log(first);
    console.log(second);
    
    $('h1').text("Info about " + first + " and " + second);

    // request html parser
    // request image parser

    // click handler for return to previous page button
    $("#prev-page-btn").click(function () {
        window.history.back();
    });
    
});


/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

$(document).ready(function(){
    // create modal object
    var infoModal = new bootstrap.Modal(document.getElementById('info-modal'), {
        backdrop: false,
        keyboard: true
    });  

    // click handler for info button to show info modal
    $("#info-btn").click(function () {
        infoModal.show();
    });
});


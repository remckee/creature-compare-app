/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

// check mode and update the text of the input labels accordingly
function changeInputLabels() {
    console.log("changed");
    var modeSelect = document.getElementById('mode-selection');
    if (modeSelect.value == "2-creature") {
        document.getElementById('searchbox-1-label').textContent = "creature 1:";
        document.getElementById('searchbox-2-label').textContent = "creature 2:";
    } else {
        document.getElementById('searchbox-1-label').textContent = "creature:";
        document.getElementById('searchbox-2-label').textContent = "feature:";
    }
}

$(document).ready(function(){
    changeInputLabels();

    // create modal object
    var infoModal = new bootstrap.Modal(document.getElementById('info-modal'), {
        backdrop: false,
        keyboard: true
    });  

    // click handler for info button to show info modal
    $("#info-btn").click(function () {
        infoModal.show();
    });
    
    // update input labels when mode changes
    $("#mode-selection").change(function(){
        changeInputLabels();

    });

});


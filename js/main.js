/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

// check mode and update the text of the input labels accordingly
function changeInputLabels() {
    if ($('#mode-selection').val() == "2-creature") {
        $('#searchbox-1-label').text("creature 1:");
        $('#searchbox-2-label').text("creature 2:");
    } else {
        $('#searchbox-1-label').text("creature:");
        $('#searchbox-2-label').text("feature:");
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

    $("#user-input-form").submit(function(event){
        event.preventDefault();
                
        // get form values
        var search_box_1 = $('#searchbox-1').val();
        var search_box_2 = $('#searchbox-2').val();
        console.log(search_box_1);
        console.log(search_box_2);
                
        //getPageTitle();
        // go to different page and use services differently depending on current mode setting
        if ($('#mode-selection').val() == "2-creature") {
            // validate, sanitize
            // search Wikipedia
 
            // navigate to results page
            location = "./two-creature-results.html?first=" + search_box_1 + "&second=" + search_box_2;
        } else {
            // validate, sanitize
            // search Wikipedia
            
            // navigate to results page
            location = "./one-creature-results.html?first=" + search_box_1 + "&second=" + search_box_2;
        }
    });

});


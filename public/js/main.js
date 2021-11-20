/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

// check mode and update the text of the input labels accordingly
function updateInputLabels() {
    if ($('#mode_selection').val() == "2-creature") {
        $('#searchbox_1_label').text("creature 1:");
        $('#searchbox_2_label').text("creature 2:");
    } else {
        $('#searchbox_1_label').text("creature:");
        $('#searchbox_2_label').text("feature:");
    }
}


// Store a title cased version of the user input 
/// in the hidden form field with the given id
async function storeTitleCase(id, title) {
    var page_title = title.toLowerCase();
    var first_let = page_title.charAt(0).toUpperCase();
    page_title = page_title.replace(page_title.charAt(0), first_let);
    var selector = "#" + id;
    $(`#${id}`).val(page_title); 
};

function processForm(event) {
    var search_box_1 = $('#searchbox_1').val();
    var search_box_2 = $('#searchbox_2').val();
    storeTitleCase("searchbox_1_title", search_box_1);
    storeTitleCase("searchbox_2_title", search_box_2);
}



$(document).ready(function(){
    updateInputLabels();

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
    $("#mode_selection").change(function(){
        updateInputLabels();

    });

    $("#user-input-form").submit(processForm);
});


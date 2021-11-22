/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

// Store a title cased version of the user input 
/// in the hidden form field with the given id
function storeTitleCase(id, title) {
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


function setDatalists() {
    var search_box_1 = $('#searchbox_1');
    var search_box_2 = $('#searchbox_2');
    
    search_box_1.val(search_box_1.val().trim());
    search_box_2.val(search_box_2.val().trim());
    
    var val_1 = search_box_1.val().toLowerCase();
    var val_2 = search_box_2.val().toLowerCase();
    
    var org_list = ["Wombat", "Rabbit", "Hawaiian honeycreeper", "Raccoon"];
    var org_list_len = org_list.length;
    var datalist = $('#suggestions');
    datalist.empty();
    
    for (var i = 0; i < org_list_len; i+=1) {
        var item_lowercase = org_list[i].toLowerCase();
        if (val_1!==item_lowercase && val_2!==item_lowercase) {
            var option = document.createElement("option");
            option.textContent = org_list[i];
            datalist.append(option);
        }
    }
}


// create modal object and set up click handler for info modal button
function setupInfoModal() {
    var infoModal = new bootstrap.Modal(document.getElementById('info-modal'), {
        backdrop: false,
        keyboard: true
    });  

    $("#info-btn").click(function () {
        infoModal.show();
    });
}


$(document).ready(function(){
    $(".searchbox").change(setDatalists);
    $("#user-input-form").submit(processForm);
    setupInfoModal();
    setDatalists();
});


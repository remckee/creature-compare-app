/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

// Store a title cased version of the user input 
/// in the hidden form field with the given id
function store_title_case(id, title) {
    var page_title = title.toLowerCase();
    var first_let = page_title.charAt(0).toUpperCase();
    page_title = page_title.replace(page_title.charAt(0), first_let);
    var selector = "#" + id;
    $(`#${id}`).val(page_title); 
};

function process_form(event) {
    var search_box_1 = $('#searchbox_1').val();
    var search_box_2 = $('#searchbox_2').val();
    store_title_case("searchbox_1_title", search_box_1);
    store_title_case("searchbox_2_title", search_box_2);
}


function set_datalists() {
    var search_box_1 = $('#searchbox_1');
    var search_box_2 = $('#searchbox_2');
    
    search_box_1.val(search_box_1.val().trim());
    search_box_2.val(search_box_2.val().trim());
    
    var val_1 = search_box_1.val().toLowerCase();
    var val_2 = search_box_2.val().toLowerCase();
    
    var org_list = [
                    "Wombat", "Rabbit", "Hawaiian honeycreeper", 
                    "Raccoon", "Quaking aspen", "Lungwort lichen", 
                    "Cyanobacteria", "E coli", "Vine maple", "Capybara"];
    org_list.sort();
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
function setup_info_modal() {
    var info_modal = new bootstrap.Modal(document.getElementById('info-modal'), {
        backdrop: false,
        keyboard: true
    });  

    $("#info-btn").click(function () {
        info_modal.show();
    });
}


$(document).ready(function(){
    $(".searchbox").change(set_datalists);
    $("#user-input-form").submit(process_form);
    setup_info_modal();
    set_datalists();
});


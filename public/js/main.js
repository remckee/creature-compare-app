/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";


function updateTheme() {
    var switcher = document.getElementById("theme_switch");
    storeState(switcher);

    var theme_classes = {
        'body':                 "text-white bg-dark",
        '.modal-content':       "text-white bg-gray-dark border-dark",
        'input[type="search"]': "text-white bg-gray-darkest border-dark",
        '.switch':              "border-light bg-dark btn-outline-info",
        '.btn-bg-theme':        "btn-dark",
        '.btn-border-theme':    "border-light",
        'a':                    "link-info",
        '.card':                "text-white bg-gray-dark",
        'svg':                  "svg-dark",
        'code':                 "text-warning",
        '.img-card-body':       "bg-gray-darker"
    };

    if (switcher.checked) {
        $('#theme_switch_label').text("Dark theme");
        for (const selector in theme_classes) {
            $(selector).addClass(theme_classes[selector]);
        }
    } else {
        $('#theme_switch_label').text("Light theme");
        for (const selector in theme_classes) {
            $(selector).removeClass(theme_classes[selector]);
        }
    }
}


$("#theme_switch").change(updateTheme);


// store current checked state (true/false) of theme slider in local storage
function storeState(switcher) {
    var state = switcher.checked;
    var value = (state === true) ? 1 : 0;
    localStorage.setItem('checked', value);
}


// retrieve current checked state (true/false) of theme slider from local storage
function getState() {
    var value = localStorage.getItem('checked');
    var val_parsed = parseInt(value);
    value = (Number.isInteger(val_parsed)) ? val_parsed : value;
    return value;
}


$(document).ready(function(){
    $('.btn-close').addClass("btn-bg-theme btn-border-theme");
    
    // set the state of the switch based on value in local storage, then update the theme
    var state = getState();
    if (state !== null) {
        document.getElementById("theme_switch").checked = state;
    }
    updateTheme();
});


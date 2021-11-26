/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";


function updateTheme() {
    var switcher = document.getElementById("theme_switch");
    storeState(switcher);

    if (switcher.checked) {
        $('body').addClass("text-white bg-dark");
        $('.modal-content').addClass("text-white bg-gray-dark border-dark");
        $('input[type="search"]').addClass("text-white bg-gray-darkest border-dark");
        $('.switch').addClass("border-light bg-dark");
        $('.btn-bg-theme').addClass("btn-dark");
        $('.btn-border-theme').addClass("border-light");
        $('a').addClass("link-light");
        $('.card').addClass("text-white bg-gray-dark");
        $('svg').addClass("svg-dark");
        $('code').addClass("text-warning");
        $('#theme_switch_label').text("Dark theme");
        $('.img-card-body').addClass("bg-gray-darker");
    } else {
        $('body').removeClass("text-white bg-dark");
        $('.modal-content').removeClass("text-white bg-gray-dark border-dark");
        $('input[type="search"]').removeClass("text-white bg-gray-darkest border-dark");
        $('.switch').removeClass("border-light bg-dark");
        $('.btn-bg-theme').removeClass("btn-dark");
        $('.btn-border-theme').removeClass("border-light");
        $('a').removeClass("link-light");
        $('.card').removeClass("text-white bg-gray-dark");
        $('svg').removeClass("svg-dark");
        $('code').removeClass("text-warning");
        $('#theme_switch_label').text("Light theme");
        $('.img-card-body').removeClass("bg-gray-darker");
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


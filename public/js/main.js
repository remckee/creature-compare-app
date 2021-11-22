/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

function updateTheme() {
    $('body').toggleClass("text-white bg-dark");
    $('.modal-content').toggleClass("text-white bg-gray-dark border-dark");
    $('input[type="search"]').toggleClass("text-white bg-gray-darkest border-dark");
    $('input[type="submit"]').toggleClass("btn-dark border-light");
    $('.switch').toggleClass("bg-dark border-light");
    $('.back-button').toggleClass("btn-dark border-light");
    $('.modal-btn').toggleClass("btn-dark border-light");
    $('.btn-close').toggleClass("btn-dark border-light");
    $('a').toggleClass("link-light");
    $('.external-link').toggleClass("link-light");
    $('.card').toggleClass("text-white bg-gray-dark");
    $('svg').toggleClass("svg-dark");
    $('#info-btn').toggleClass("btn-dark");
    $('code').toggleClass("text-warning");
    

    var classes = $('body').attr("class");
    if (classes.includes('bg-dark')) {
        $('#theme_switch_label').text("Dark theme");
        $('.img-card-body').addClass("bg-gray-darker");
        $('.img-card-body').removeClass("bg-light");
    } else {
        $('#theme_switch_label').text("Light theme");
        $('.img-card-body').addClass("bg-light");
        $('.img-card-body').removeClass("bg-gray-darker");
    }
}

$("#theme_switch").change(function(){
    updateTheme();
});


$(document).ready(function(){
    //updateTheme();
    //$('.switch:checked').addClass("bg-secondary");
    console.log($("#theme_switch").checked);
});


/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";

// check mode and update the text of the input labels accordingly
function changeInputLabels() {
    if ($('#mode_selection').val() == "2-creature") {
        $('#searchbox_1_label').text("creature 1:");
        $('#searchbox_2_label').text("creature 2:");
    } else {
        $('#searchbox_1_label').text("creature:");
        $('#searchbox_2_label').text("feature:");
    }
}


// uses Wikipedia API to find the title of the Wikipedia page 
// that the value in param.srsearch redirects to
async function getPageTitle(base_url, params, id, title) {
    let url = base_url;
    var page_title = title;
    var first_let = page_title.charAt(0).toUpperCase();
    page_title = page_title.replace(page_title.charAt(0), first_let);
    console.log("cap: ", page_title);
    //initRequest(encodeURI(`http://localhost:8080/results/${page_title}`));
    // Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

    // var response = await fetch(url)
    //     .then((response) => {return response.json()})
    //     .then((response) => {
    //         if (response.query.search[0].title){
    //             page_title = response.query.search[0].title;
    //             console.log("title: "+page_title);
                  var selector = "#" + id;
                  $(`#${id}`).val(page_title);
               //initRequest(encodeURI(`http://localhost:8080/results/${page_title}`));
        //     }
        // })
        // .catch((error) => console.log(error));    
};


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
    $("#mode_selection").change(function(){
        changeInputLabels();

    });

    $("#user-input-form").submit(function(event){
        //event.preventDefault();
                
        // get form values
        var search_box_1 = $('#searchbox_1').val();
        var search_box_2 = $('#searchbox_2').val();
        console.log(search_box_1);
        console.log(search_box_2);

        let api_url = "https://en.wikipedia.org/w/api.php?origin=*"; 
        let page_url = "https://en.wikipedia.org/wiki/";

        var url_params = {
            action: "query",
            list: "search",
            srsearch: search_box_1,
            format: "json"
        };

        getPageTitle(api_url, url_params, "searchbox_1_title", search_box_1);
        
        url_params.srsearch = search_box_2;
        getPageTitle(api_url, url_params, "searchbox_2_title", search_box_2);

    });

});


/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

"use strict";
//var cur_path = 

// Request a url that will be handled by the server side code, 
// where the parameter in the url will be used in a request 
// that will be sent to a service.
const initRequest = (url) => {
    let req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            let data = JSON.parse(req.response);
            console.log(data);
        };
    });
    req.send(null);
};


// uses Wikipedia API to find the title of the Wikipedia page 
// that the value in param.srsearch redirects to
async function getPageTitle(base_url, params) {
    let url = base_url;
    var page_title = "";
    
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

    var response = await fetch(url)
        .then((response) => {return response.json()})
        .then((response) => {
            if (response.query.search[0].title){
                page_title = response.query.search[0].title;
                console.log(page_title);
                initRequest(encodeURI(`http://localhost:3000/${page_title}`));
            }
        })
        .catch((error) => console.log(error));    
};


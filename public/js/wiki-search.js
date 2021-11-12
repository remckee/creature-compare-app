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
    // let payload = {
    //     "mode":         $('#mode_selection').val().trim(),
    //     "searchbox_1":  $('#searchbox_1').val().trim(),
    //     "searchbox_2":  $('#searchbox_2').val().trim()
    // };
    
    // console.log("payload: "+payload.mode);
    // let json = JSON.stringify(payload);
    req.open('GET', url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("Access-Control-Allow-Origin", "*");
    req.setRequestHeader("Access-Control-Allow-Methods", 
      "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    req.setRequestHeader("Access-Control-Allow-Headers",
      "Origin, Content-Type, X-Auth-Token");
    req.addEventListener('load', () => {
        if(req.status>=200 && req.status<400){
            let data = JSON.parse(req.response);
        };
    });
    req.send(null);
    
    
    // req.open("POST", url, true);
    // req.setRequestHeader("Content-Type", "application/json");
    // req.addEventListener("load", () => {
    //     if (req.status >= 200 && req.status < 400) {
    //         let data = JSON.parse(req.response);
    //         console.log(data);
    //     }
    // });
    //req.send(json);
};





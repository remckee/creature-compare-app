/***********************************************************
 * Name: Rebecca Mckeever
 * CS 361
***********************************************************/

/*
    https://www.mediawiki.org/wiki/API:Search#JavaScript
    search.js

    MediaWiki API Demos
    Demo of `Search` module: Search for a text or title

    MIT License
*/

"use strict";


//base_url, params


// function getPageTitle(res, base_url, params) {
//     let url = base_url + "?origin=*";
//     Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
//     let req = new XMLHttpRequest();
//     req.open('GET', url, true);
//     req.addEventListener('load', () => {
//         if(req.status>=200 && req.status<400){
//             let data = JSON.parse(req.response);
//             if (data.query.search[0].title){
//                 res.title = data.query.search[0].title;
//             }
//         };
//     });
//     req.send(null);
// };
async function getPageTitle(base_url, params) {

    // let url = 'https://api.wikimedia.org/core/v1/wikipedia/en/search/page?origin=*&q=earth&limit=10';
    // let response = await fetch( url,
    //     {
    //         headers: {
                //'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    //             'Api-User-Agent': 'Creature Compare (mckeever@oregonstate.edu)'
    //         }
    //     }
    // );
    // response.json()
    //     .then(console.log).catch(console.error);

    let url = base_url;// + "?origin=*";
    var page_title = "";
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

    var response = await fetch(url) //const page_title =  
        .then((response) => {return response.json()})//
        .then((response) => {
            if (response.query.search[0].title){
                page_title = response.query.search[0].title;
                console.log(page_title);
                return page_title;
            }
        })
        .catch((error) => console.log(error));


    console.log(page_title);
        // ({(response) => {
        //     if (response.query.search[0].title){
        //         page_title = response.query.search[0].title;
        //         console.log(page_title);
                
        //     }
        // })
        // .catch((error) => console.log(error));
        

    // response.then((response) => {
    //     if (response.query.search[0].title){
    //         page_title = response.query.search[0].title;
    //         console.log(page_title);
            
    //     }
    // })
    // let req = new XMLHttpRequest();
    // req.open('GET', url, true);
    // req.addEventListener('load', () => {
    //     if (req.status >= 200 && req.status < 400) {
    //         let data = JSON.parse(req.response);
    //         console.log("data: "+data.query.search[0].title);
    //     } else {
    //         console.log("error");
    //     };
    // });
    // req.send(null);

  
    return page_title;
    
}




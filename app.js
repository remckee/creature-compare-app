"use strict";

var WebSocketClient = require('websocket').client;
const port = 3800;
const host = "localhost";   // change to "flip1.engr.oregonstate.edu" 
                            // to run on flip servers

const https = require('https');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

exphbs.create({partialsDir: 'views/partials/'})
app.engine('.hbs', exphbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set("views", "./views");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')));


// check if none of the taxon attributes are equal to value
function check_results(results, value) {
    return (results.creatures[0].taxon !== value && results.creatures[1].taxon !== value
                      && results.creatures[0].img !== value && results.creatures[1].img !== value );
}

function results_ready(results) {
    return check_results(results, null);
}

function results_valid(results) {
    return check_results(results, false);
}


function render_results(res, results) {
    if (results.mode_selection=="2-creature") {
        res.render('two-creature-results', {
            title: "- Results",
            script: "results.js",
            creature_1: results.creatures[0].name,
            creature_2: results.creatures[1].name,
            creature_2_lower: results.creatures[1].name.toLowerCase(),
            category: results.common_category.category,
            category_lower: results.common_category.category.toLowerCase(),
            taxon_name: results.common_category.taxon_name,
            creature_1_img: results.creatures[0].img,
            creature_2_img: results.creatures[1].img
        });
    } else if (results.mode_selection=="1-creature") {
        res.render('one-creature-results', {
            title: "- Results",
            script: "results.js",
        });
    }

}


function render_error(res, results) {
    var values = {
        title: "- Error",
        script: "results.js",
        searchbox_1: results.creatures[0].name,
        searchbox_2: results.creatures[1].name,
        mode_selection: results.mode_selection
    };
    
    var invalid_box = false;
    
    if ( results.creatures[0].taxon === false ) {
          invalid_box = results.creatures[0].name;
    } else if ( results.creatures[1].taxon === false ) {
          invalid_box = results.creatures[1].name;
    } else {
        values.details = `An unknown error occurred.`;
    }
    
    if (invalid_box) {
        values.details = `Either there is no Wikipedia page for ${invalid_box}, or it does not name a valid biological organism.`;
    }
    
    res.render('error', values);
}


function call_Img_scraper(results, res, ind, server_port) {
    if (results_valid(results)) {
        var client = new WebSocketClient();

        // if connection fails, log an error
        client.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
        });

        client.on('connect', function(connection) {
            // can remove below line, I just thought it was helpful to know it was working
            console.log('WebSocket Client Connected');
            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });

            // when a message from the server is recieved
            connection.on('message', function message(data) {
                console.log('Received reply: \n%s', data);

                // Split url list on ', //' 
                // The first string will be '{"URL":['
                var img_urls = data.utf8Data.split(/,? *\/\//);

                // Select the appropriate url, and 
                var prefix = 'https:';
                var out_url = "";
                var i = 1;
                while (   !img_urls[i].toLowerCase().includes("commons") 
                        || img_urls[i].toLowerCase().includes("icon")
                        || img_urls[i].toLowerCase().includes("logo")
                        && i < img_urls.length ) {
                    i += 1;
                }

                // Not finding a valid image is not interpreted as an error.
                // If no valid image is found, set the url to an empty string,
                // but the result is still valid if the taxon data is valid.
                var out_url = (i < img_urls.length) ? img_urls[i] : "";

                if (out_url !== "") {
                    // make sure url begins with 'https://'.
                    if (out_url.slice(0, prefix.length) != prefix) {
                        out_url = `${prefix}//${out_url}`;
                    }
                }

                results.creatures[ind].img = out_url;

                if (results_valid(results) && results_ready(results)) {
                    //res.send(results);
                    render_results(res, results);
                }
                // If results are not valid, no need to render because the render_error function
                // will run inside the call that caused the error

                connection.close();
            });
            
            // function to send data to server
            function sendUrl(req) {
                if (connection.connected) {
                    console.log(req);
                    connection.sendUTF(JSON.stringify(req));
                }
            }
            var req = {"URL" : results.creatures[ind].url};
            sendUrl(req);
        });

        client.connect(`ws://localhost:${server_port}`);
    }
}


function call_HTML_scraper(results, res, ind, server_port) {
    if (results_valid(results)) {
        var client = new WebSocketClient();

        // if connection fails, log an error
        client.on('connectFailed', function(error) {
            console.log('Connect Error: ' + error.toString());
        });

        client.on('connect', function(connection) {
            // can remove below line, I just thought it was helpful to know it was working
            console.log('WebSocket Client Connected');
            connection.on('error', function(error) {
                console.log("Connection Error: " + error.toString());
            });

            // when a message from the server is recieved
            connection.on('message', function message(data) {
                if (data.type === 'utf8') {
                    console.log('Received reply: \n%s\n', data);
                    
                    var taxon = JSON.parse(data.utf8Data).response;
                    
                    if (Array.isArray(taxon) && taxon[0] === 'Scientific classification') {
                        results.creatures[ind].taxon = taxon;
                        
                        if (results.creatures[0].taxon != null && results.creatures[1].taxon != null) {
                            var category = [];
                            var arr0 = results.creatures[0].taxon;
                            var arr1 = results.creatures[1].taxon;
                            var min_len = (arr0.length < arr1.length) ? arr0.length : arr1.length;
                            
                            for (var i = 0; i < min_len; i+=1) {
                                var parts = [];
                                parts[0] = arr0[i].split(/:\t|\n/, 2);
                                parts[1] = arr1[i].split(/:\t|\n/, 2);
                                
                                if (parts[0][0] == parts[1][0] 
                                  && parts[0][1] == parts[1][1]) {
                                    category = parts[0];
                                }
                            }
                            results.common_category.category = category[0];
                            results.common_category.taxon_name = category[1];
                        }
                        
                        console.log("results valid: " + results_valid(results));
                        console.log("results ready: " + results_ready(results));

                        if (results_valid(results) && results_ready(results)) {
                            //res.send(results);
                            render_results(res, results);
                        }
                        // If results are not valid, no need to render because the render_error function
                        // will run inside the call that caused the error
                        
                    } else {
                        results.creatures[ind].taxon = false;
                        results.common_category.category = false;
                        results.common_category.taxon_name = false;
                        render_error(res, results);
                    }

                    connection.close();
                }
            });
            
            // function to send data to server
            function sendUrl(req) {
                if (connection.connected) {
                    console.log(req);
                    connection.sendUTF(JSON.stringify(req));
                }
            }
            var req = {"url" : results.creatures[ind].url};
            sendUrl(req);
        });

        client.connect(`ws://localhost:${server_port}`, 'echo-protocol');
    }
}


// render home page
app.get('/', (req, res, next) => {
    res.render('index', {
        title: "",
        script: "main.js"
    });
});


app.post('/results', (req, res) => {
    let data = req.body;
    
    var results = {
        "creatures": 
        [{
            name: data.searchbox_1_title,
            url: encodeURI(`https://en.wikipedia.org/wiki/${data.searchbox_1_title}`),
            taxon: null,
            img: null
        },
        {
            name: data.searchbox_2_title,
            url: encodeURI(`https://en.wikipedia.org/wiki/${data.searchbox_2_title}`),
            taxon: null,
            img: null
        }],
        "common_category": 
        {
            category: null,
            taxon_name: null
        },
        "mode_selection": data.mode_selection
    };
    
    
    for (var i = 0; i < 2 && results_valid(results); i+=1) {
        // call HTML scraper
        if (results_valid(results)) {
            call_HTML_scraper(results, res, i, 8080);
        }

        // call Image scraper
        if (results_valid(results)) {
            call_Img_scraper(results, res, i, 5051);
        }
    }

});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});


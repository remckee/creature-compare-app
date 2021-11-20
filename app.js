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


const domains = new Map();
domains.set('Animalia', 'Eukaryota');
domains.set('Plantae', 'Eukaryota');
domains.set('Fungi', 'Eukaryota');
domains.set('Bacteria', 'Bacteria');
domains.set('Archaea', 'Archaea');
domains.set('Protista', 'Eukaryota');


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


function get_img_data(creature) {
    var img_data = [];
    if (creature.img !== "") {
        img_data = [{
            img: creature.img,
            alt: creature.name
        }];
    }
    return img_data;
}


function results_params() {
    return {
        title: "- Results",
        script: "results.js"
    };
}


function two_creature_results_params(results) {
    var obj = {
        creature_1       : results.creatures[0].name,
        creature_2       : results.creatures[1].name,
        creature_2_lower : results.creatures[1].name.toLowerCase(),
        category         : results.common_category.category,
        category_lower   : results.common_category.category.toLowerCase(),
        taxon_name       : results.common_category.taxon_name,
        creature_1_img   : get_img_data(results.creatures[0]),
        creature_2_img   : get_img_data(results.creatures[1])
    };
    return Object.assign(obj, results_params());
}


function render_results(res, results) {
    if (results.mode_selection=="2-creature") {
        res.render('two-creature-results', two_creature_results_params(results));
    } else if (results.mode_selection=="1-creature") {
        res.render('one-creature-results', results_params());
    }
}


function get_invalid_input(creatures) {
    var invalid_box = false;
    if ( creatures[0].taxon === false ) {
          invalid_box = creatures[0].name;
    } else if ( creatures[1].taxon === false ) {
          invalid_box = creatures[1].name;
    }
    return invalid_box;
}


function get_error_msg(invalid_box) {
    var msg = `An unknown error occurred.`;

    if (invalid_box) {
        msg = `Either there is no Wikipedia page for ${invalid_box}, or its page is not formatted as expected or does not name a valid biological organism.`;
    }
    return msg;
}


function render_error(res, results) {
    var values = {
        title: "- Error",
        script: "results.js",
        searchbox_1: results.creatures[0].name,
        searchbox_2: results.creatures[1].name,
        mode_selection: results.mode_selection,
        details: get_error_msg(get_invalid_input(results.creatures))
    };
    res.render('error', values);
}


function is_invalid_img_url(url) {
    return (!url.includes("commons") || url.includes("icon") || url.includes("logo"));
}


function select_img_url(data) {
    var img_urls = data.utf8Data.split(/,|,? *\/\//);
    var i = 1;
    while ( i < img_urls.length && is_invalid_img_url(img_urls[i].toLowerCase()) ) {
        i += 1;
    }

    // Not finding a valid image is not interpreted as an error.
    return (i < img_urls.length) ? img_urls[i] : "";
}


function add_url_prefix(url) {
    if (url !== "") {
        var prefix = 'https:';
        if (url.slice(0, prefix.length) != prefix) {
            url = `${prefix}//${url}`;
        }
    }
    return url;
}


var process_img = function process_img_result(results, res, ind, data, compare=false) {
    var out_url = select_img_url(data);

    results.creatures[ind].img = add_url_prefix(out_url);
    if (results_valid(results) && results_ready(results)) {
        render_results(res, results);
    }
}


var process_HTML = function process_HTML_result(results, res, ind, data) {
    var taxon = JSON.parse(data.utf8Data).response;
    
    if (results.creatures[ind].name == 'Mouse') {
        var taxon = [
                  "Scientific classification",
                  "Domain:\tEukaryota",
                  "Kingdom:\tAnimalia",
                  "Phylum:\tChordata",
                  "Class:\tMammalia",
                  "Order:\tRodentia"
        ];
    }

    if (results_valid(results) && Array.isArray(taxon) && taxon[0] === 'Scientific classification') {
        for (var i = 0; i < taxon.length; i+=1) {
            taxon[i] = taxon[i].split(/:?\t/, 2);
        }
    
        results.creatures[ind].taxon = taxon;
        var arrs = [results.creatures[0].taxon, results.creatures[1].taxon];
        console.log(arrs);
        if (arrs[0] !== null && arrs[1] !== null ) {
            var category = [];
            var found_one = false;        // whether at least one match found
            var keep_going = true;
            var arr_lens = [arrs[0].length, arrs[1].length];
            var parts = [[], []];

            for (var i = 1; i < arr_lens[0] && keep_going; i+=1) {
                var found = false;          // whether a match for arrs[0][i] was found
                for (var j = 1; j < arr_lens[1] && keep_going && !found; j+=1) {
                    parts[0][i] = arrs[0][i].split(/:?\t/, 2);
                    
                    if (!parts[1][j]) {
                        parts[1][j] = arrs[1][j].split(/:\t/, 2);
                    }
                    
                    if (parts[0][i].length > 1 
                      && parts[1][j].length > 1 
                      && parts[0][i][0] == parts[1][j][0]) {
                        if (parts[0][i][1] == parts[1][j][1]) {
                            category = parts[0][i];
                            found = true;
                            found_one = true;
                            
                        // Terminate for loops using a boolean if kingdoms are not the same
                        } else if (parts[0][i][0].toLowerCase() == 'kingdom') {
                            console.log("diff kingdoms");
                            keep_going = false;
                        }
                    }
                }
            }
            
            // If they are not in the same kingdom, check domain
            if (found_one === false) {
                var highest = [results.creatures[0].taxon[1].split(/:\t/, 2),
                              results.creatures[1].taxon[1].split(/:\t/, 2)];
            
                var domain = domains.get(results.creatures[0].taxon[1].split(/:\t/, 2)[1]);
                console.log("domain: "+domain);
                if (domain === domains.get(results.creatures[1].taxon[1].split(/:\t/, 2)[1])) {
                    category[0] = 'Domain';
                    category[1] = domain;
                } else {
                    category[0] = 'root';
                    category[1] = 'Life';
                }
            }
            results.common_category.category = category[0];
            results.common_category.taxon_name = category[1];
        }

        if (results_valid(results) && results_ready(results)) {
            render_results(res, results);
        }
        
    } else {
        results.creatures[ind].taxon = false;
        results.common_category.category = false;
        results.common_category.taxon_name = false;
        render_error(res, results);
    }
}


function call_service(results, res, req, ind, server_port, funct, protocol) {
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
                funct(results, res, ind, data);
                connection.close();
            });
            
            // function to send data to server
            function sendUrl(req) {
                if (connection.connected) {
                    console.log(req);
                    connection.sendUTF(JSON.stringify(req));
                }
            }
            sendUrl(req);
        });

        if (protocol=="") {
            client.connect(`ws://localhost:${server_port}`);
        } else {
            client.connect(`ws://localhost:${server_port}`, protocol);
        }
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
    console.log(data.theme_switch);
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
            var req = {"url" : results.creatures[i].url};
            call_service(results, res, req, i, 8080, process_HTML, 'echo-protocol');
        }

        // call Image scraper
        if (results_valid(results)) {
            var req = {"URL" : results.creatures[i].url};
            call_service(results, res, req, i, 5051, process_img, '');
        }
    }

});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});


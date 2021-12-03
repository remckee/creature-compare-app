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
const fs = require('fs');
const moment = require('moment');
const { body } = require('express-validator');

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
    return check_results(results, false) && (results.HTML.available !== false);
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


function results_params(results) {
    var obj = {
        title            : "- Results",
        creature_1       : results.creatures[0].name,
        creature_2       : results.creatures[1].name,
        creature_2_lower : results.creatures[1].name.toLowerCase(),
        category         : results.common_category.category,
        category_lower   : results.common_category.category.toLowerCase(),
        taxon_name       : results.common_category.taxon_name,
        creature_1_img   : get_img_data(results.creatures[0]),
        creature_2_img   : get_img_data(results.creatures[1]),
        script           : [{script_file: "main.js"}, {script_file: "results.js"}],
        taxon_link       : {
                              href: `https://en.wikipedia.org/wiki/${results.common_category.taxon_name}`,
                              text: results.common_category.taxon_name,
                              post_text: ""
                           },
        creature_1_link  : {
                              href: `https://en.wikipedia.org/wiki/${results.creatures[0].name}`,
                              text: `https://en.wikipedia.org/wiki/${results.creatures[0].name}`,
                              post_text: ""
                           },
        creature_2_link  : {
                              href: `https://en.wikipedia.org/wiki/${results.creatures[1].name}`,
                              text: `https://en.wikipedia.org/wiki/${results.creatures[1].name}`,
                              post_text: ""
                           },
        commons_link     : {
                              href: 'https://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License',
                              text: 'Creative Commons Attribution-ShareAlike License',
                              post_text: ""
                           },
        wikimedia_link   : {
                              href: 'https://www.wikimediafoundation.org',
                              text: 'Wikimedia Foundation, Inc.',
                              post_text: ""
                           },
    };
    return obj;
}


function render_results(res, results) {
    if (!results.results_rendered) {
        results.results_rendered = true;
        res.render('two-creature-results', results_params(results));
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


function render_error(res, results, error_ps, error_msg) {
    log_err_msg(error_msg);
    if (!results.results_rendered) {
        results.results_rendered = true;
        var values = {
            title: "- Error",
            error_p: error_ps,
            script: [{script_file: "main.js"},
                      {script_file: "results.js"}]
        };

        res.render('error', values);
    }
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


const process_img = (results, res, ind, data) => {
    var out_url = select_img_url(data);

    results.creatures[ind].img = add_url_prefix(out_url);
    if (results_valid(results) && results_ready(results)) {
        render_results(res, results);
    }
}


const categories_match = (len_1, len_2, category_1, category_2) => {
    return len_1 > 1 && len_2 > 1 && (category_1 === category_2);
}


const lowercase_compare = (value, compare) => {
    return value.toLowerCase() === compare;
}


// assumes that both taxonomies either start with a kingdom
// or with a domain with the same name as the kingdom it contains (i.e., Bacteria, Archaea)
const get_upper_category = (category_1, category_2) => {
    var domain = domains.get(category_1[1]);
    
    var category = [];
    if (domain === domains.get(category_2[1])) {
        category = ['Domain', domain];
    } else {
        category = ['root', 'Life'];
    }
    return category;
}


const get_taxon = (data, name) => {
    var taxon = JSON.parse(data.utf8Data).response;
    if (name == 'Mouse') {
        var taxon = [
                  "Scientific classification",
                  "Domain:\tEukaryota",
                  "Kingdom:\tAnimalia",
                  "Phylum:\tChordata",
                  "Class:\tMammalia",
                  "Order:\tRodentia"
        ];
    }
    return taxon;
}


const split_arr_els = (arr, regex) => {
    for (var i = 0; i < arr.length; i+=1) {
        arr[i] = arr[i].split(regex, 2);
    }
} 


const get_category = (arrs, results) => {
    var category = [];
    var found_one = false;        // whether at least one match found
    var keep_going = true;
    var arr_lens = [arrs[0].length, arrs[1].length];
    
    for (var i = 1; i < arr_lens[0] && keep_going; i+=1) {
        var found = false;          // whether a match for arrs[0][i] was found
        for (var j = 1; j < arr_lens[1] && keep_going && !found; j+=1) {
            if (categories_match(arrs[0][i].length, arrs[1][j].length, 
                  arrs[0][i][0], arrs[1][j][0])) {
                if (arrs[0][i][1] === arrs[1][j][1]) {
                    category = arrs[0][i];
                    found = true;
                    found_one = true;
                    
                // Terminate for loops using a boolean if kingdoms are not the same
                } else if (lowercase_compare(arrs[0][i][0], 'kingdom')) {
                    keep_going = false;
                }
            }
        }
    }
    
    // If there was no match, check domain
    if (found_one === false) {
        category = get_upper_category(results.creatures[0].taxon[1], 
                                      results.creatures[1].taxon[1]);
    }
    
    return {category: category[0], taxon_name: category[1]};
}


const process_HTML = (results, res, ind, data) => {
    if (results.HTML.available === false) {
        render_error(res, results, [{details: 'Unable to connect to HTML scraper service.'}], "Connect Error");
    } else {
        var taxon = get_taxon(data, results.creatures[ind].name);

        if (results_valid(results) && Array.isArray(taxon) && taxon[0] === 'Scientific classification') {
            split_arr_els(taxon, /:?\t/);

            results.creatures[ind].taxon = taxon;
            var arrs = [results.creatures[0].taxon, results.creatures[1].taxon];
            if (arrs[0] !== null && arrs[1] !== null ) {
                results.common_category = get_category(arrs, results);
            }

            if (results_valid(results) && results_ready(results)) {
                render_results(res, results);
            }
            
        } else {
            results.creatures[ind].taxon = false;
            results.common_category = {category: false, taxon_name: false};
            render_error(res, results, 
                [
                    {details: `Sorry, your query for "${results.creatures[0].name}" and "${results.creatures[1].name}" returned 0 results.`},
                    {details: "Please check whether you entered everything correctly."},
                    {details: get_error_msg(get_invalid_input(results.creatures))}
                ],
                `${results.creatures[0].name}, ${results.creatures[1].name}`);
        }
    }
}


function log_err_msg(msg) {
    var error_log_text = `${moment()}: ${msg}\n`;
    fs.appendFile('errors.log', error_log_text, (err) => {
        if (err) throw err;
            console.log('The message was appended to error log file!');
        });
}


function process_connect_error(results, funct, res, ind, error_msg, service) {
    error_msg = 'Connect Error: ' + error_msg;
    console.log(error_msg);
    results[`${service}`].available = false;
    
    if (service=='Img') {
        results.creatures[ind].img = "";
    } else {
        funct(results, res, ind, {});
    }
}


function call_service(results, res, req, ind, server_port, funct, service, protocol) {
    if ((results[`${service}`].available !== false)) {
        var client = new WebSocketClient();

        // if connection fails, log an error
        client.on('connectFailed', function(error) {
            process_connect_error(results, funct, res, ind, error.toString(), service);
            return;
        });

        client.on('connect', function(connection) {
            // can remove below line, I just thought it was helpful to know it was working
            console.log('WebSocket Client Connected');
            connection.on('error', function(error) {
                process_connect_error(results, funct, res, ind, error.toString(), service);
                return;
            });

            // when a message from the server is recieved
            connection.on('message', function (data) {
                console.log('Received reply: \n%s', data);
                funct(results, res, ind, data);
                connection.close();
                return data;
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


function modal_link(url_base, value, post_text) {
    return {href: `${url_base}${value}`, text: value, post_text: post_text};
}


// render home page
app.get('/', (req, res, next) => {
    var values = {
        title: "",
        script: [{script_file: "main.js"},
                  {script_file: "home.js"}],
    };

    var links = [];
    var mapiter = domains.keys();
    var post = [", ", ", ", ", ", ", ", ", or ", "."];
    var i = 0;
    for (const val of mapiter) {
        links.push(modal_link("https://species.wikimedia.org/wiki/", val, post[i]));
        i+=1;
    }
    
    values.link = links;
    res.render('index', values);
});


app.post(
    '/results',
    body('searchbox_1_title').not().isEmpty().trim().escape(),
    body('searchbox_2_title').not().isEmpty().trim().escape(),
    (req, res) => {
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
        "HTML": 
        {
            available: null
        },
        "Img": 
        {
            available: null
        },
        "results_rendered": false
    };
    
    for (var i = 0; i < 2 && results_valid(results); i+=1) {
        // call HTML scraper
        if (results_valid(results)) {
            var req = {"url" : results.creatures[i].url};
            call_service(results, res, req, i, 8080, process_HTML, "HTML", 'echo-protocol');
        }

        // call Image scraper
        if (results_valid(results)) {
            var req = {"URL" : results.creatures[i].url};
            call_service(results, res, req, i, 5051, process_img, "Img", '');
        }
    }

});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});


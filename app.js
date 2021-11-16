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

//const hbs = create();

//hbs.partialsDir = 'views/partials/';
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

const nonempty = (el) => el != "";


function render_results(res, results) {
    if (results.mode_selection=="2-creature") {
        res.render('two-creature-results', {
            title: "- Results",
            script: "results.js",
            creature_1: results.creatures[0].name,
            creature_2: results.creatures[1].name,
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


function call_Img_scraper(results, res, ind, server_port) {
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

            // Split url list on ', //' and only store the first three resulting strings,
            // The first string will be '{"URL":[', so stores first 2 urls
            var img_urls = data.utf8Data.split(/,? *\/\//, 3);


            // Select the appropriate url, and make sure it begins with 'https://'.
            var prefix = 'https:';
            //var out_url = (img_urls[1].toLowerCase().includes('semi-protection-shackle')) ? img_urls[2] : img_urls[1];
            var out_url = img_urls[2];
            if (out_url.slice(0, prefix.length) != prefix) {
                out_url = `${prefix}//${out_url}`;
            }

            results.creatures[ind].img = out_url;

            if (results.creatures[0].taxon != "" && results.creatures[1].taxon != ""
                  & results.creatures[0].img != "" && results.creatures[1].img != "") {
                //res.send(results);
                render_results(res, results);
            }

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


function call_HTML_scraper(results, res, ind, server_port) {
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
                results.creatures[ind].taxon = taxon;

                if (results.creatures[0].taxon != "" && results.creatures[1].taxon != "") {
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
                
                if (results.creatures[0].taxon != "" && results.creatures[1].taxon != ""
                      & results.creatures[0].img != "" && results.creatures[1].img != "") {
                    //res.send(results);
                    render_results(res, results);
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
            name: data.searchbox_1,
            url: encodeURI(`https://en.wikipedia.org/wiki/${data.searchbox_1_title}`),
            taxon: "",
            img: ""
        },
        {
            name: data.searchbox_2,
            url: encodeURI(`https://en.wikipedia.org/wiki/${data.searchbox_2_title}`),
            taxon: "",
            img: ""
        }],
        "common_category": 
        {
            category: "",
            taxon_name: ""
        },
        "mode_selection": data.mode_selection
    };
    
    // call HTML scraper
    for (var i = 0; i < 2; i+=1) {
        call_HTML_scraper(results, res, i, 8080);
    }

    // call Image scraper
    for (var i = 0; i < 2; i+=1) {
        call_Img_scraper(results, res, i, 5051);
    }

});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});


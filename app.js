var WebSocketClient = require('websocket').client;
const port = 3800;
const host = "localhost";   // change to "flip1.engr.oregonstate.edu" 
                            // to run on flip servers

const https = require('https');
const express = require('express');
const app = express();
//const port = 3000;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public')));



function call_Img_scraper(url, results, res, ind, sub_ind, server_port) {
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
            results[ind][sub_ind] = JSON.parse(data);

            if (results[0][0] != "" && results[1][0] != "" 
                && results[0][1] != "" && results[1][1] != "") {
                res.send(results);
            }

            connection.close();
        });
        
        // function to send data to server
        function sendUrl(req) {
            if (connection.connected) {
                console.log(req);
                //connection.sendUTF(JSON.stringify(req));
                // Encode the message and get its length
                var message = JSON.stringify(req);
                var msg_length =  message.length;
                var send_length = msg_length.toString();
                send_length.padEnd((64 - send_length.length));
                console.log('"'+send_length+'"');
                connection.sendUTF(send_length);
                connection.sendUTF(message);
            }
        }
        var req = {"URL" : url};
        sendUrl(req);
    });

    client.connect(`ws://localhost:${server_port}`);
}


function call_HTML_scraper(url, results, res, ind, sub_ind, server_port) {
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
                results[ind][sub_ind] = JSON.parse(data.utf8Data);

                if (results[0][0] != "" && results[1][0] != "" 
                    //&& results[0][1] != "" && results[1][1] != "" 
                    ) {
                    var category = "";
                    var arr0 = results[0][0].response;
                    var arr1 = results[1][0].response;
                    var min_len = (arr0.length < arr1.length) ? arr0.length : arr1.length;
                    
                    for (var i = 0; i < min_len; i+=1) {
                        if (arr0[i] == arr1[i]) {
                            category = arr0[i];
                        }
                    }
                    results[2] = {"common_category": category};
                    
                    // if (results[0][1] != "" && results[1][1] != "") {
                    //     res.send(results);
                    // }
                    
                }
                
                if (results[0][0] != "" && results[1][0] != "" 
                    && results[0][1] != "" && results[1][1] != "") {
                    res.send(results);
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
        var req = {"url" : url};
        sendUrl(req);
    });

    client.connect(`ws://localhost:${server_port}`, 'echo-protocol');
}


app.post('/results', (req, res) => {
    let data = req.body;
    //console.log(data);
    
    var urls = [encodeURI(`https://en.wikipedia.org/wiki/${data.searchbox_1_title}`),
                  encodeURI(`https://en.wikipedia.org/wiki/${data.searchbox_2_title}`)];
    
    console.log(urls);
    var results = [[""], [""], ""];
    
    // call HTML scraper
    for (var i = 0; i < 2; i+=1) {
        call_HTML_scraper(urls[i], results, res, i, 0, 8080);
    }

    // call Image scraper
    for (var i = 0; i < 2; i+=1) {
        call_Img_scraper(urls[i], results, res, i, 1, 5050);
    }

});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});


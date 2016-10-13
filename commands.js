//commands.js
const db = require('./db.js');

// Add your commands here. All commands recieve (request, response) as arguments.
// Core api methods are defined in api.js module.

var commands = {};

commands.echo = echo;

module.exports = commands;

/////////////////////////////

function echo(request, response){
	// request.postData property contains data sent to api.
	var message = request.postData.message

	var reply = message;

	//response.send(data) method sends data back as json; you can also use require('./utl.js').send(data, response) or full functionality of http.ServerResponse https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_class_http_serverresponse
	response.send(reply);
};

function newName(req, res) {
	
	var name = req.postData.itemName;

	if (name in db('names')) {
		res.sendCode(400, 'already exists');
		return
	};

	db('names', name, true);
	res.sendCode(200);
};

function transaction(req, res) {
	var temp = {};
	var tr = req.postData.transaction;

	if (!(tr.name in db('names'))) {
		res.sendCode(400, 'item unknown');
		return;
	};

	if (!(tr.place.name in db('names'))) {
		res.sendCode(400, 'place unknown');
		return
	};

	for (t in db('trans')) {
		if (t.name === tr.place.name){
			temp[t.id] = true;
		};
	};

	if (!(tr.place.id in temp)) {
		res.sendCode(400, 'no such place');
		return
	}

	if ((tr.amount + amount(tr.name, tr.id, tr.place)) < 0) {
		res.sendCode(400, 'invalid amount');
		return;
	};

};

function amount(name, id, place) {
	
	var result = 0;
	
	if (place) {
		for (t in db('trans')) {
			if (name === t.name && id === t.id && place.name === t.place.name && place.id === t.place.id) {
				result += t.amount;
			}
		}
	} else {
		for (t in db('trans')) {
			if (name === t.name && id === t.id) {
				result += t.amount;
			}
		}
	}	

	return result;
};
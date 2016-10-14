//commands.js
const db = require('./db.js');

// Add your commands here. All commands recieve (request, response) as arguments.
// Core api methods are defined in api.js module.

var commands = {};

commands.echo = echo;
commands.newName = newName;

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

	var tr = req.postData.transaction;

	if (!(tr.item.name in db('names'))) {
		res.sendCode(400, 'item unknown');
		return;
	};

	if (!(tr.place.name in db('names'))) {
		res.sendCode(400, 'place unknown');
		return;
	};

	var bad = true;

	for (t in db('trans')) {
		if (tr.place.id === t.item.id){
			bad = false;
			break;
		};
	};

	if (bad) {
		res.sendCode(400, 'no such place');
		return;
	};

	if ((tr.amount + amount(tr.item, tr.place)) < 0) {
		res.sendCode(400, 'invalid amount');
		return;
	};

};

function amount(item, place) {
	
	var result = 0;
	
	// if (place) {
	// 	for (t in db('trans')) {
	// 		if (name === t.name && id === t.id && place.name === t.place.name && place.id === t.place.id) {
	// 			result += t.amount;
	// 		}
	// 	}
	// } else {
	// 	for (t in db('trans')) {
	// 		if (name === t.name && id === t.id) {
	// 			result += t.amount;
	// 		}
	// 	}
	// }	

	var rule = generateRule(item, place);

	for (t in db('trans')) {
		if (rule(t)) {
			result += t.amount;
		}
	};

	function generateRule(item, place) {
		var checks = [];
		checks.push([item.name, 'item', 'name']);
		if (item.id) {checks.push([item.id, 'item', 'id'])};
		if (place) {
			checks.push([place.name, 'place', 'name']);
			checks.push([place.id, 'place', 'id']);
		};

		return function (t) {
			for (var i = checks.length - 1; i >= 0; i--) {
				if (checks[i][0] != t[checks[i][1]][checks[i][2]]){return false}
			}
			return true
		}
	};


	return result;
};


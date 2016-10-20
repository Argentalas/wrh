//commands.js
const db = require('./db.js');

// Add your commands here. All commands recieve (request, response) as arguments.
// Core api methods are defined in api.js module.

var commands = {};

commands.echo = echo;
commands.newname = newname;
commands.transaction = transaction;

module.exports = commands;

/////////////////////////////

function echo(request, response){
	// request.postData property contains data sent to api.
	var message = request.postData.message

	var reply = message;

	//response.send(data) method sends data back as json; you can also use require('./utl.js').send(data, response) or full functionality of http.ServerResponse https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_class_http_serverresponse
	response.send(reply);
};

function item(req, res) {
	var item = req.postData.item || {};
	item.name = item.name || "";
	item.id = item.id || "";

	if (!(item.name in db('names'))) {
		res.sendCode(400, 'item unknown');
		return;
	};

	res.send(locate(item));
};

function newname(req, res) {
	
	var name = req.postData.itemName;

	if (name && (name in db('names'))) {
		res.sendCode(400, 'already exists');
		return
	};

	db('names', name, true);
	res.sendCode(200);
};

function transaction(req, res) {

	var tr = req.postData.transaction;

	var names = db('names');

	if (!(tr.item.name in names)) {
		res.sendCode(400, 'item unknown');
		return;
	};

	if (!(tr.place.name in names)) {
		res.sendCode(400, 'place unknown');
		return;
	};

	var bad = true;
	var trans = db('trans');

	for (t in trans) {
		if (tr.place.id === trans[t].item.id){
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

	db('trans', Date.now(), tr);

	res.sendCode(200);
};

function locate(item) {

	var trans = db('trans');

	var rule = generateRule(item);

	var places = {};

	for (t in trans){
		if (rule(trans[t])) {
			places[trans[t].place.name + trans[t].place.id] = trans[t].place;
		};
	};

	var total = amount(item);

	for (p in places){
		let am = amount(item, places[p]);
		if (am > 0) {
			places[p].amount = am;
			places[p].total = total;
		} else {
			delete places[p];
		};
	};

	return places;

	///

	function generateRule(item) {
		var checks = [];
		checks.push([item.name, 'item', 'name']);
		if (item.id) {
			checks.push([item.id, 'item', 'id'])
		};

		return function (t) {
			for (var i = checks.length - 1; i >= 0; i--) {
				if(checks[i][0] != t[checks[i][1]][checks[i][2]]){return false}
			};
			return true;
		};
	};
};

function amount(item, place) {
	
	var result = 0;
	
	var trans = db('trans');
	
	var rule = generateRule(item, place);

	for (t in trans) {
		if (rule(trans[t])) {
			result += trans[t].amount;
		}
	};

	return result;

	///

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
			};
			return true;
		};
	};
};


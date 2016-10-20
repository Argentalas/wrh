//api.js
const fs = require('fs');

var bcrypt = require('bcrypt');

const utl = require('./utl.js');
const db = require('./db.js');
const cfg = require('./config.json');
const commands = require('./commands.js');

//overwritable by commands.js
api.register = register;
api.reload = reload;

for (c in commands) {
	api[c] = commands[c];
};

//not overwritable
api.switch = apiSwitch;

module.exports = api;

///////////////////////////

function reload(req, res) {
	cfg.timestamp = utl.formatDate(Date.now());
	fs.writeFileSync('config.json', JSON.stringify(cfg, null, '\t'));
	res.sendCode(200);
};

function register(req, res) {
	var username = req.postData.username;
	var pass = req.postData.pass;

	if (username in db.private('users')) {
		res.sendCode(400, 'username taken');
		return;
	};

	bcrypt.hash(pass, cfg.saltRounds, (err,hash)=>{
		if (err) {
			res.sendCode(500); 
			utl.log(`bcrypt error ${err}`);
			return;
		};
		db.private('users', username, {token:hash, permissions:{echo:true}});
		res.sendCode(200);
	});
};

function api(req, res) {

	var command = utl.parseurl(req.url)[1];
	var username = utl.parseurl(req.url)[2];

	if (!authorized(command, username)) {res.sendCode(403); return};

	req.postData=[];

	req.on('error', (err)=>{
		utl.log(err);
		res.sendCode(400);
	}).on('data', (d)=>{
		req.postData.push(d);
	}).on('end', ()=>{
		try {
			req.postData = JSON.parse(Buffer.concat(req.postData).toString());
		} catch(e) {
			res.sendCode(400, 'post data must be valid json');
			utl.log(e.message);
			return;
		};
		authenticate(req, res, ()=>{
			api[command](req, res);
		});
	});

};

function authenticate(req, res, cb) {
	
	var token = req.postData.token || '';
	var username = utl.parseurl(req.url)[2];

	bcrypt.compare(token, db.private('users', username).token, (err,result)=>{
		if (err) {
			res.sendCode(400);
			utl.log(`bcrypt error ${err.message}`);
		} else if (!result) {
			res.sendCode(403);
			utl.log(`failed authentification for user ${username} from ${req.connection.remoteAdress}`);
		} else {
			cb();
		}
	});
};

function authorized(command, username) {

	const users = db.private('users');
	var permissions = users[username].permissions;

	return (username in users && command in api && (command in permissions || 'any' in permissions));

};

function apiSwitch(req) {
	return (utl.parseurl(req.url)[0] === 'api' && req.method === 'POST');
};


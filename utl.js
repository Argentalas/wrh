//utl.js

const http = require('http');
const path = require('path');

const cfg = require('./config.json')
const db = require('./db.js');

module.exports = {
	parseurl: parseurl,
	log: log,
	formatDate: formatDate,
	mime: mime,
	rerequire: rerequire,
	sendCode: sendCode,
	send: send
};

//////////////////////////

function parseurl(url) {
	
	return url.split('/').slice(1);
};

function log() {
	var d = formatDate(Date.now());
	var args = Array.from(arguments);
	
	console.log.apply(this, ['['+d+']'].concat(args));
	db('log', d, args);
	
	// Returns first argument, so if there is only one argument you can log and evaluate argument in one line )
	return arguments[0];
};

function formatDate(timestamp){

	// Returns number. Sample output: 160905134321,
	// where 16 - year, 09 - month, 05 - date, 13 - hours, 43 - minutes, 21 - seconds.
	// Each part is always 2-digit, so total length is fixed.

	var d = new Date(timestamp);
	return parseInt(d.getUTCFullYear().toString().substr(-2) +
		('0'+(d.getUTCMonth()+1).toString()).substr(-2) +
		('0'+d.getUTCDate().toString()).substr(-2) +
		('0'+d.getUTCHours().toString()).substr(-2) +
		('0'+d.getUTCMinutes().toString()).substr(-2) +
		('0'+d.getUTCSeconds().toString()).substr(-2));
};

function mime(filePath) {
	//nb: mime-types, node-mime
	return cfg.typeDic[path.extname(filePath)] || '';
};

function rerequire(modname) {

	// require() caches and never invalidates, hence this function.
	// Using on native addons will result in an Error. https://nodejs.org/dist/latest-v4.x/docs/api/globals.html#globals_require_cache
	// It is absolutely fine to require smth for the first time with this function.
	// Keep in mind, there is a syncronous file system read under the hood.

	delete require.cache[require.resolve(modname)];
	return require(modname);
};

function sendCode(code, text, res) {
	if (text && text instanceof http.ServerResponse) {
		res = text;
		text = '';
	}
	res = res || this;

	res.writeHead(code, {'Content-Type':'text/plain'});
	res.end(text || '');
};

function send(data, res) {
	res = res || this;
	data = data || '';
	
	res.writeHead(200, {'Content-Type':'application/json'});
	res.end(JSON.stringify(data));
}
#!/usr/bin/env node

var cp = require('child_process');
var fs = require('fs');
var findParentDir = require('find-parent-dir');
var path = require('path');

var projDir = findParentDir.sync(process.cwd(), '.git') || process.cwd();
var rcPath = path.join(projDir, '.babelrc');

function npmInstall(packages, dev) {
	cp.spawnSync('npm', ['install', dev ? '-D' : '-S'].concat(packages), {
		stdio: 'inherit',
		cwd: projDir,
	});
}

function npmRemove(packages, dev) {
	cp.spawnSync('npm', ['remove', dev ? '-D' : '-S'].concat(packages), {
		stdio: 'inherit',
		cwd: projDir,
	});
}

function uniq(arr) {
	return Array.from(new Set(arr));
}

var rc = {};

if(fs.existsSync(rcPath)) {
	rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
}

var argv = require('minimist')(process.argv.slice(2), {boolean: ['r', 'remove']});

var plugins = [].concat(argv.plugin || []).concat(argv.p || []);
var presets = [].concat(argv.preset || []).concat(argv.s || []);
var remove = argv.r || argv.remove;

if(remove) {
	rc.plugins = rc.plugins.filter(plugin => plugins.indexOf(plugin) === -1);
	rc.presets = rc.presets.filter(preset => presets.indexOf(preset) === -1);
} else {
	rc.plugins = uniq([].concat(rc.plugins || []).concat(plugins));
	rc.presets = uniq([].concat(rc.presets || []).concat(presets));
}

var doTheThing = remove ? npmRemove : npmInstall;
var thingToDo = remove ? 'removing' : 'installing';

if(plugins.length) {
	console.log(thingToDo + ' plugins ' + plugins.join(', '));
	doTheThing(plugins.map(p => 'babel-plugin-'+p), true);
}

if(presets.length) {
	console.log(thingToDo + ' presets ' + presets.join(', '));
	doTheThing(presets.map(p => 'babel-preset-'+p), true);
}

if(plugins.indexOf('transform-runtime') >= 0) {
	console.log('transform-runtime requested, ' + thingToDo + ' runtime');
	doTheThing(['babel-runtime'], false);
}

console.log('writing babelrc');
fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2));

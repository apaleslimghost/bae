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

function uniq(arr) {
	return Array.from(new Set(arr));
}

var rc = {};

if(fs.existsSync(rcPath)) {
	rc = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
}

var argv = require('minimist')(process.argv.slice(2));

var plugins = [].concat(argv.plugin || []).concat(argv.p || []);
var presets = [].concat(argv.preset || []).concat(argv.s || []);

rc.plugins = uniq([].concat(rc.plugins || []).concat(plugins));
rc.presets = uniq([].concat(rc.presets || []).concat(presets));

if(plugins.length) {
	console.log('installing plugins ' + plugins.join(', '));
	npmInstall(plugins.map(p => 'babel-plugin-'+p), true);
}

if(presets.length) {
	console.log('installing presets ' + presets.join(', '));
	npmInstall(presets.map(p => 'babel-preset-'+p), true);
}

if(plugins.indexOf('transform-runtime') >= 0) {
	console.log('transform-runtime requested, installing runtime');
	npmInstall(['babel-runtime'], false);
}

console.log('writing babelrc');
fs.writeFileSync(rcPath, JSON.stringify(rc, null, 2));

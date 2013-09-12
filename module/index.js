'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var ModuleGenerator = module.exports = function ModuleGenerator(args, options, config) {
	// By calling `NamedBase` here, we get the argument to the subgenerator call
	// as `this.name`.
	yeoman.generators.Base.apply(this, arguments);
	this.argument('name', { type: String, required: false });
};

util.inherits(ModuleGenerator, yeoman.generators.NamedBase);

// Merge configuration data
var cfg = require( path.join(process.cwd(), 'lib/configure.js') ).merge('_config/', [
		 'default'
		,'project'
		,'secret'
		,'local'
	]).get();


// welcome message
// http://patorjk.com/software/taag/#p=display&f=Pepper&t=xtc%20mod%20gen
var welcome =
	'\n' +
	chalk.yellow.bold("      _/__   _ _  _   _/  _  _  _ ") + '\n' +
	chalk.yellow.bold("    ></ /_  / / //_//_/  /_//_'/ /") + '\n' +
	chalk.yellow.bold("                         _/       ") + '\n\n' +
	chalk.blue.bold('    express-terrific module generator\n\n') +
	chalk.green('Please answer a few questions to create your new module.\n')
;
console.log(welcome);


ModuleGenerator.prototype.askFor = function askFor() {
	var cb = this.async();

	// module name
	var prompts = [
		{
			name: 'name'
			,message: 'What\'s the name of the new module?\n' +
			          '(all lowercase, hyphen separated, without any prefix)'
			,default: this.name
		}
	];

	this.prompt(prompts, function(props) {
		this.name = props.name;
		cb();
	}.bind(this));
};


ModuleGenerator.prototype.customize = function customize() {
	var cb = this.async();

	nl();

	// need customization?
	var prompts = [
		{
			type: 'confirm'
			,name: 'customize'
			,message: 'By default this module will have one template, a style sheet, a JS module (with tests) and a README.\n' +
			          'Do you want to change that?'
			,default: false
		}
	];

	this.prompt(prompts, function (props) {
		this.customize = props.customize;

		cb();
	}.bind(this));
};


ModuleGenerator.prototype.doCustomize = function doCustomize() {
	var cb = this.async();

	if (!this.customize) {
		cb();
		return;
	}

	nl();

	var prompts = [
		{
			type: 'list'
			,name: 'customizeSelection'
			,message: 'Please choose'
			,choices: [
				{
					 name: 'JS only'
					,value: ['needJs']
				}
				,{
					 name: 'HTML only'
					,value: ['needHtml']
				}
				,{
					 name: 'HTML + CSS'
					,value: ['needHtml', 'needCss']
				}
				,{
					 name: 'HTML + JS'
					,value: ['needHtml', 'needJs']
				}
				,{
					 name: 'JS + CSS'
					,value: ['needJs', 'needCss']
				}
			]
		}
	];

	this.prompt(prompts, function (answer) {

		answer.customizeSelection.forEach(function(value, index, array) {
			this[value] = true;
		}, this)

		cb();
	}.bind(this));
};


ModuleGenerator.prototype.configure = function configure() {
	this.nameCSS = 'mod-' + this.name;
	this.nameFolder = cfg.moduleDirName.replace('{{name}}', this.name);
	this.nameJS = toCamel(this.nameCSS).replace('mod', '');
	this.nameTest = this.name + '.test.js';
	this.modulesDir = path.join(cfg.paths.modulesBaseDir, this.nameFolder);
	this.user = process.env.USER;
};


ModuleGenerator.prototype.files = function files() {
	nl();
	this.mkdir(this.modulesDir);
	(!this.customize || this.needHtml) && this.template('_name.hbs', path.join(this.modulesDir, this.name +'.hbs'));
	(!this.customize || this.needCss) && this.template('_name.less', path.join(this.modulesDir, this.name +'.less'));

	if (!this.customize || this.needJs) {
		this.template('_name.js', path.join(this.modulesDir, this.name +'.js'));
		this.mkdir(path.join(this.modulesDir, 'test'));
		this.template('test/_name.test.js', path.join(this.modulesDir, 'test', this.nameTest));
	}
	this.template('_README.md', path.join(this.modulesDir, 'README.md'));
};


/**
* Camelizes the given string.
*
* @method toCamel
* @param {String} str
* The original string
* @return {String}
* The camelized string
*/
var toCamel = function(str){
	return str.replace(/(\-[A-Za-z])/g, function($1){return $1.toUpperCase().replace('-','');});
}

function nl(count) {
	count = count || 1;

	while (count > 0) {
		console.log('');
		count--;
	}
}

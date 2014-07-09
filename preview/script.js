$(function(){
var INT_PATH = 'http://localhost:9999/2014/07/murakami/preview/';
require.config({
	paths: {
		IntSound: INT_PATH+'lib/intSound/intSound',
		SoundJS:INT_PATH+'lib/soundjs/soundjs-0.5.2.min',
		SJS_FlashPlugin:INT_PATH+'lib/soundjs/FlashPlugin',
		SJS_SwfObject:INT_PATH+'lib/soundjs/swfobject'
	}
});

function Interactive(container_id){
  this.container = $('#'+container_id);
  this
  	.printTopBar()
  	.printMusicBtn()
  	.printFingers();
}
Interactive.prototype = {
	printTopBar:function(){
		var wrapper = $('<div>')
			.addClass('top_bar')
			.html('Please turn your sound up');
		this.right_wrapper = $('<div>')
			.addClass('right_wrapper')
			.html('mute sound')
			.appendTo(wrapper);
		this.top_bar_wrapper = wrapper.appendTo(this.container);
		return this;
	},
	printMusicBtn:function(){
		var self = this;
		$('<div>')
			.addClass('btn_music')
			.appendTo(this.right_wrapper)
			.click(function(){
				if($(this).hasClass('active')){
					$(this).removeClass('active');
					self.hidePiano();
					self.hideBot();
				}
				else{
					$(this).addClass('active');
					self.showPiano();
				}
			});
		return this;
	},
	printFingers:function(){
		var self = this;
		var types = ['red','blue','white','black','map'];
		this.fingers_wrapper = $('<div>')
			.addClass('fingers_wrapper')
			.appendTo(this.container);
		this.fingers = {};
		types.forEach(function(type,index){
			setTimeout(function(){
				var new_finger = $('<div>')
					.addClass('finger')
					.addClass('finger_'+type)
					.appendTo(self.fingers_wrapper)
					.fadeIn()
					.click(function(){
						self.fingerClicked(type);
					});
				self.fingers[type] = new_finger;
			},index*200);
		});
		return this;
	},
	fingerClicked:function(type){
		if(!this.piano_view){
			this.openPopup(type);
		}
		else{
			this.playSound(type);
		}
	},
	showPiano:function(){
		var self = this;
		this.piano_view = true;
		if(!this.piano){
			this.piano = $('<div>')
				.addClass('piano')
				.appendTo(this.container)
				.show();
		}
		this.piano
			.css('opacity',0)
			.animate({
				'opacity':1,
				'bottom':0
			},1000,function(){
				self.showBot();
			});
	},
	hidePiano:function(){
		var self = this;
		this.piano_view = false;
		this.piano
			.animate({
				'opacity':0,
				'bottom':-250
			},1000,function(){

			});
	},
	showBot:function(){
		var self = this;
		var print_notes = false;
		if(!this.bot){
			this.bot = $('<div>')
				.addClass('bot')
				.appendTo(this.container);
			print_notes = true;
		}
		this.bot
			.show()
			.animate({
				'opacity':1,
				'bottom':0
			},1000,function(){
				if(print_notes){
					self.printNotes();
				}
			});
	},
	hideBot:function(){
		this.bot.fadeOut();
	},
	printNotes:function(){
		var self = this;
		for(var i=0;i<7;i++){
			setTimeout(addNote,100*i);
		}
		function addNote(){
			console.log('adding');
			$('<div>')
				.addClass('note')
				.appendTo(self.bot)
				.animate({
					opacity:1
				},500);
		}
	},
	openPopup:function(type){
		console.log('open popup: '+type);
	},
	playSound:function(type){
		console.log('play sound: '+type);
	}
};
var my_interactive = new Interactive('int');
	
}); //end jQuery



if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, thisArg) {
		var T, k;
		if (this === null) {
			throw new TypeError(" this is null or not defined");
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (typeof callback !== "function") {
			throw new TypeError(callback + " is not a function");
		}
		if (thisArg) {
			T = thisArg;
		}
		k = 0;
		while (k < len) {
			var kValue;
			if (k in O) {
				kValue = O[k];
				callback.call(T, kValue, k, O);
			}
			k++;
		}
	};
}


$(function(){
var INT_PATH = 'http://localhost:9999/2014/06/murakami/preview/';
require.config({
	paths: {
		IntSound: INT_PATH+'lib/intSound/intSound',
		SoundJS:INT_PATH+'lib/soundjs/soundjs.min',
		SJS_FlashPlugin:INT_PATH+'lib/soundjs/FlashPlugin',
		SJS_SwfObject:INT_PATH+'lib/soundjs/swfobject',
		imagesLoaded: INT_PATH+'lib/imagesLoaded.min',
	}
});
var FINGER_TYPES = ['red','blue','white','black','map'];
var NOTE_MAP = {
	red:'note_e',
	blue:'note_g',
	white:'note_a',
	black:'note_a_sharp',
	map:'note_b'
};
var NOTE_SEQUENCE = ["e","g","a","b","a_sharp","b","g","e"];

function Interactive(container_id){
	var self = this;
  this.container = $('#'+container_id);
  this
  	.printTopBar()
  	.printFingers(function(){
			self.printMusicBtn();
  	});
  this.popup = new Popup(this);
  //this.showSolution();
}
Interactive.prototype = {
	printTopBar:function(){
		var self = this;
		var wrapper = $('<div>')
			.addClass('top_bar')
			.html('Please turn your sound up');
		this.right_wrapper = $('<div>')
			.addClass('right_wrapper')
			.html('mute sound')
			.appendTo(wrapper)
			.click(function(){
				self.muteSound();
			});
		this.top_bar_wrapper = wrapper.appendTo(this.container);
		return this;
	},
	muteSound:function(){
		this.sound_muted = true;
	},
	printMusicBtn:function(){
		var self = this;
		this.btn_music = $('<div>')
			.hide()
			.addClass('btn_music')
			.appendTo(this.right_wrapper)
			.fadeIn()
			.click(function(){
				if($(this).hasClass('active')){
					self.deactivatePianoView();
				}
				else{
					self.activatePianoView();
				}
			});
		return this;
	},
	printFingers:function(callback){
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
					.data('type',type)
					.addClass('finger_'+type)
					.appendTo(self.fingers_wrapper)
					.fadeIn()
					.click(function(){
						self.fingerClicked(type);
					});
				self.fingers[type] = new_finger;
			},index*200);
		});
		setTimeout(callback||null,200*5);
		return this;
	},
	fingerClicked:function(type){
		if(!this.piano_view){
			this.popup.trigger(type);
		}
	},
	addSoundListeners:function(){
		var self = this;
		require(['IntSound'],function(IntSound){
			IntSound.initialize(INT_PATH+'lib/soundjs',go);
		});
		function go(IntSound){
			for(var type in self.fingers){
				if(!self.puzzle_complete){
					IntSound.tieToButton(self.fingers[type],'sound/',NOTE_MAP[type],{behavior:'key'});
				}
			}
		}
		if(!self.puzzle_complete){
			for(var i in self.fingers){
				if(self.fingers.hasOwnProperty(i)){
					self.fingers[i]
						.unbind('click.piano')
						.on('click.piano',fingerPlayed);
				}
			}
		}
		function fingerPlayed(){
			var type = $(this).data('type');
			self.fingerPlayed(type);
		}
	},
	removeSoundListeners:function(){
		var fingers = $('.finger')
			.unbind('click.piano');
		require(['IntSound'],function(IntSound){
			IntSound.untieButton(fingers);
		});
	},
	fingerPlayed:function(type){
		var self = this;
		if(!this.played_notes){
			this.played_notes = [];
		}
		var note_played = NOTE_MAP[type].replace('note_','');
		if(NOTE_SEQUENCE[this.played_notes.length]===note_played){
			this.notes[this.played_notes.length]
				.html('&#9834;')
				.addClass('correct');
			this.played_notes.push(note_played);
			if(this.played_notes.length===NOTE_SEQUENCE.length){
				this.win();
			}
		}
		else{
			this.played_notes = [];
			this.bot
				.find('.correct')
					.removeClass('correct');
		}
		this.highlightNote(type);
	},
	highlightNote:function(type){
		var overlay = this.piano_overlays[type];
		overlay.fadeIn(100,function(){
			overlay.fadeOut();
		});
	},
	win:function(){
		var self = this;
		this.puzzle_complete = true;
		$('.finger').unbind('click.piano');
		require(['IntSound'],function(IntSound){
			IntSound
				.untieButton($('.finger'));
		});
		setTimeout(function(){
			require(['IntSound'],function(IntSound){
				IntSound.playSound('sound/','note_b_1');
			});
			self.highlightNote('final');
		},1000);
		setTimeout(function(){
			self.showSolution();
		},1500);
	},
	printNotes:function(callback){
		var self = this;
		this.notes = [];
		var l = NOTE_SEQUENCE.length;
		for(var i=0;i<l;i++){
			setTimeout(addNote,100*i);
		}
		setTimeout(function(){
			if(callback){
				callback();
			}
		},100*7);
		function addNote(){
			var note = $('<div>')
				.html('&#9834;')
				.addClass('note')
				.appendTo(self.bot)
				.animate({
					opacity:1
				},300);
			self.notes.push(note);
		}
	},
	lowerFingers:function(callback){
		this.fingers_wrapper
			.animate({
				'margin-top':300
			},500,function(){
				if(callback){
					callback();
				}
			});
	},
	raiseFingers:function(callback){
		this.fingers_wrapper
			.animate({
				'margin-top':240
			},500,function(){
				if(callback){
					callback();
				}
			});
	},
	activatePianoView:function(){
		var self = this;
		this.addSoundListeners();
		this.piano_view = true;
		this.popup
			.hide()
			.disable();
		this.btn_music.addClass('active');
		this.showPiano();
		this.showBot();
	},
	deactivatePianoView:function(){
		this.removeSoundListeners();
		this.btn_music.removeClass('active');
		this.hidePiano();
		this.hideBot();
		this.popup.enable();
	},
	showPiano:function(){
		var self = this;
		this.fingers_wrapper
			.animate({
				'margin-top':210
			},500);
		if(!this.piano){
			(function printPiano(){
				self.piano = $('<div>')
					.addClass('piano')
					.appendTo(self.container)
					.show();
			}());
			(function printOverlays(){
				self.piano_overlays = {};
				if(!self.overlay_wrapper){
					self.overlay_wrapper = $('<div>')
						.addClass('overlay_wrapper')
						.appendTo(self.fingers_wrapper);
				}
				var types = FINGER_TYPES.slice(0,FINGER_TYPES.length);
				types.push('final');
				types.forEach(function(finger_type){
					self.piano_overlays[finger_type] = $('<img>')
						.attr('src',INT_PATH+'graphics/pianokey_'+finger_type+'.png')
						.addClass('piano_overlay')
						.addClass(finger_type)
						.appendTo(self.overlay_wrapper);
				});
			}());
		}
		this.piano
			.css('opacity',0)
			.animate({
				'opacity':1,
				'top':self.top_bar_wrapper.outerHeight()
			},500);
		return this;
	},
	hidePiano:function(){
		var self = this;
		this.piano_view = false;
		this.piano
			.animate({
				'opacity':0,
				'bottom':-250
			},500,function(){
				self.hideBot();
			});
		this.fingers_wrapper.animate({
			'margin-top':140
		},500);
		return this;
	},
	showBot:function(callback){
		var self = this;
		var print_notes = false;
		if(!this.bot){
			this.bot = $('<div>')
				.addClass('bot')
				.appendTo(this.container);
			print_notes = true;
		}
		this.bot
			.fadeIn()
			.animate({
				'opacity':1,
				'bottom':0
			},300,function(){
				if(print_notes){
					self.printNotes(callback);
				}
				else{
					if(callback){
						callback();
					}
				}
			});
	},
	hideBot:function(){
		this.bot.fadeOut();
	},
	getSolution:function(callback){
		var self = this;
		if(!this.solution){
			$.getJSON('solution.json',function(data){
				self.solution = data.solution;
				callback(data.solution);
			});
		}
		else{
			callback(this.solution);
		}
	},
	showSolution:function(){
		console.log('showing solution');
		var self = this;
		this.getSolution(function(content){
			var solution_wrapper = $('<div>')
				.addClass('solution_wrapper')
				.html(content)
				.appendTo(self.container);
			var solution_title = $('<p>')
				.addClass('solution_title')
				.html('Unlocked Content')
				.prependTo(solution_wrapper);
			var btn_ex = $('<div>')
				.addClass('btn_ex')
				.appendTo(solution_wrapper)
				.html('X')
				.click(function(){
					self.hideSolution();
					self.resetPuzzle();
				});
			self.solution_wrapper  = solution_wrapper.fadeIn();
		});
	},
	hideSolution:function(){
		var self = this;
		if(this.solution_wrapper){
			this.solution_wrapper.fadeOut(function(){
				self.solution_wrapper.remove();
			});
		}
	},
	resetPuzzle:function(){
		this.container.find('.note.correct')
			.removeClass('correct');
		this.played_notes = [];
		this.puzzle_complete = false;
		this.addSoundListeners();

	}
	// scrollListen:function(){
	// 	var container_scroll_top = this.container.scrollTop();
	// 	$(window).scroll(function(){
	// 		var window_scroll_top = $(window).scrollTop();
	// 		if(window_scroll_top >= container_scroll_top &&
	// 			window_scroll_top <= container_scroll_top + 
	// 		if(scroll_top>=self.container.scrollTop() || 
	// 	});
	// }
};
function Popup(parent){
	var self = this;
	this.par = parent;
	this.container = $('<div>')
		.addClass('int_popup')
		.appendTo(this.par.container);
	this.btn_ex = $('<div>')
		.addClass('btn_ex')
		.html('x')
		.appendTo(this.container)
		.click(function(){
			self.hide(true);
		});
}
Popup.prototype = {
	trigger:function(type){
		var self = this;
		this.container
			.hide();
		this.loadData(function(){
			self.selectContent(type,function(content){
				var wrapper = self.getHTML(content,type);
				self.par.lowerFingers(function(){
					self.show(content,type,wrapper);
				});
			});
		});
	},
	show:function(content,type,wrapper){
		var self = this;
		self.container
			.removeClass('red blue white black map img text text_img')
			.addClass(type);
		console.log(content);
		if(content.img){
			self.container.addClass('img');
		}
		if(content.text){
			self.container.addClass('text');
		}
		if(content.text_img){
			self.container.addClass('text_img');
		}
		self.container
			.find('.slide_wrapper')
				.remove()
				.end()
			.append(wrapper);
		require(['imagesLoaded'],function(imagesLoaded){
			if(self.disabled){
				return;
			}
			self.container.imagesLoaded(function(){
				self.container.fadeIn();
				self.orient(type);
			});
		});
	},
	orient:function(type){
		var self = this;
		var finger = self.par.container.find('.finger_'+type);
		var fingers_wrapper = self.par.fingers_wrapper;
		(function orientLeft(){
			var finger_left = finger.position().left;
			var fingers_wrapper_left = fingers_wrapper.position().left;
			var total_left = finger_left + fingers_wrapper_left;
			var left = total_left - (self.container.width()/2);
			if(type==='map'){
				left = Math.max(total_left, left);
			}
			self.container.css('left',left);
		}());
		(function orientTop(){
			var finger_top = finger.position().top + fingers_wrapper.position().top;
			var fingers_wrapper_top = fingers_wrapper.position().top;
			var top = finger_top + fingers_wrapper_top;
			self.container
				.css('top',top);
		}());
	},
	selectContent:function(type,callback){
		var self = this;
		var data = this.data[type];
		if(!data.slides){
			this.data[type] = {slides:data,index:0};
			data = this.data[type];
		}
		else{
			if(data.index === (data.slides.length-1)){
				data.index = 0;
			}
			else{
				data.index++;
			}
		}
		var selected_item = data.slides[data.index];
		if(callback){
			callback(selected_item);
		}
	},
	loadData:function(callback){
		var self = this;
		if(this.data){
			callback();
		}
		else{
			$.getJSON(INT_PATH+'fingers.json',function(data){
				self.data =  data;
				callback();
			});
		}
	},
	getHTML:function(content,type){
		var wrapper = $('<div>')
			.addClass('slide_wrapper');
		var table = $('<table>')
			.appendTo(wrapper);
		var row = $('<tr>')
			.appendTo(table);
		var cell = $('<td>')
			.appendTo(row);
		if(content.img || content.text_img){
			$('<img>')
				.addClass('slide_img')
				.attr('src','graphics/'+type+'/'+(content.img||content.text_img))
				.appendTo(cell)
				.fadeIn();
		}
		if(content.text){
			$('<div>')
				.addClass('slide_text')
				.html(content.text)
				.appendTo(cell)
				.fadeIn();
		}
		return wrapper;
	},
	hide:function(raiseFingers){
		this.container.fadeOut();
		if(raiseFingers){
			this.par.raiseFingers();
		}
		return this;
	},
	disable:function(){
		this.disabled = true;
		return this;
	},
	enable:function(){
		this.disabled = false;
		return this;
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

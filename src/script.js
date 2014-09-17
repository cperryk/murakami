$(function(){
var INT_PATH = 'http://localhost:9999/2014/06/murakami/preview/';
require.config({
	paths: {
		IntSound: INT_PATH+'lib/intSound/intSound',
		SoundJS:INT_PATH+'lib/soundjs/soundjs.min',
		SJS_FlashPlugin:INT_PATH+'lib/soundjs/FlashPlugin',
		SJS_SwfObject:INT_PATH+'lib/soundjs/swfobject',
		imagesLoaded: INT_PATH+'lib/imagesLoaded.min',
		IntSharing: INT_PATH+'lib/intSharing/intSharing',
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
var PRELOAD_IMAGES = [
	'black/KURO_pottery.gif',
	'map/TSUKURU_insidetrain.gif',
	'map/TSUKURU_Overboard.gif',
	'map/TSUKURU_recordplayer.gif',
	'map/TSUKURU_train.gif'
];

function Interactive(container_id){
	var self = this;
  this.container = $('<div>')
  	.addClass('int_inner')
  	.appendTo('#'+container_id);
  this
  	.preloadImages()
  	.printTopBar()
  	.printFingers(function(){
			self.printMusicBtn();
  	})
  	.printBuyButton()
  	.printExcerptTeaser();
  this.popup = new Popup(this);
}
Interactive.prototype = {
	preloadImages:function(){
		var self = this;
		this.preloaded = [];
		preload(PRELOAD_IMAGES);
		function preload(arrayOfImages) {
		    $(arrayOfImages).each(function(){
		    	var path = 'graphics/'+this;
		    	var img = $('<img/>').attr('src',INT_PATH+path);
	        self.preloaded[path] = img;
		    });
		}
		return this;
	},
	printTopBar:function(){
		var self = this;
		var wrapper = $('<div>')
			.addClass('top_bar')
			.html('Please turn your sound up');
		this.right_wrapper = $('<div>')
			.addClass('right_wrapper')
			.appendTo(wrapper)
			.click(function(){
				self.muteSound();
			});
		// $('<span>')
		// 	.addClass('btn_mute')
		// 	.html('mute sound')
		// 	.appendTo(this.right_wrapper);
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
					.fadeIn();
				self.fingers[type] = new_finger;
			},index*200);
		});
		setTimeout(callback||null,200*5);
		this.addFingerClickListener();
		return this;
	},
	addFingerClickListener:function(){
		var self = this;
		this.container.on('click.finger','.finger',function(){
			var type = $(this).data('type');
			self.fingerClicked(type);
		});
	},
	removeFingerClickListener:function(){
		this.container.unbind('click.finger');
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
					IntSound.tieToButton(self.fingers[type],INT_PATH+'sound/',NOTE_MAP[type],{behavior:'key'});
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
				IntSound.playSound(INT_PATH+'sound/','note_b_1');
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
		if(this.puzzle_complete){
			this.showSolution();
		}
	},
	deactivatePianoView:function(){
		this.removeSoundListeners();
		this.btn_music.removeClass('active');
		this.hidePiano();
		this.hideBot();
		if(this.puzzle_complete){
			this.hideSolution();
		}
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
						.appendTo(self.piano);
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
				'top':-250
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
			$.getJSON(INT_PATH+'solution.json',function(data){
				self.solution = data.solution;
				callback(data.solution);
			});
		}
		else{
			callback(this.solution);
		}
	},
	showSolution:function(){
		var self = this;
		this.getSolution(function(content){
			var solution_wrapper = $('<div>')
				.addClass('solution_wrapper')
				.appendTo(self.container);
			var solution_title = $('<p>')
				.addClass('solution_title')
				.html('You solved Tsukuru Tazaki\'s puzzle!')
				.appendTo(solution_wrapper);
			var share_wrapper = $('<div>')
				.addClass('share_wrapper')
				.appendTo(solution_wrapper);
			require(['IntSharing'],function(IntSharing){
				var share_btns = IntSharing.appendShareBtns(share_wrapper,{
					fb:{
						head:"I solved Tsukuru Tazaki's puzzle!",
						desc:"Solve this puzzle and unlock an exclusive excerpt from Haruki Murakami's new novel.",
						img:"http://www.slate.com/content/dam/slate/articles/arts/books/2014/07/murakami/140728_FRESCA_mura-interactive-promo.jpg"
					},
					tw:{
						share_text:"I solved Tsukuru Tazaki's puzzle! Solve this puzzle and unlock an exclusive excerpt from Haruki Murakami's new novel."
					},
					email:{
						subject:"I solved Tsukuru Tazaki's puzzle!",
						body:"Solve this puzzle and unlock an exclusive excerpt from Haruki Murakami's new novel."
					}
				});
			});
			var book_wrapper  = $('<div>')
				.addClass('book_wrapper')
				.html(content)
				.appendTo(solution_wrapper);
			var btn_ex = $('<div>')
				.addClass('btn_ex')
				.appendTo(solution_wrapper)
				.html('X')
				.click(function(){
					self.deactivatePianoView();
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
	printBuyButton:function(){
		var wrapper =$('<div>')
			.addClass('buy_wrapper')
			.addClass('int_teaser');
		var link = $('<a>')
			.attr('href','http://www.amazon.com/dp/B00IHMEAYK/?tag=slatmaga-20')
			.attr('target','_blank')
			.appendTo(wrapper);
		$('<img>')
			.addClass('cover_art')
			.attr('src',INT_PATH+'graphics/coverart.jpg')
			.appendTo(link);
		$('<p>')
			.html('Order the Novel')
			.addClass('teaser_label')
			.appendTo(link);
		routeAmazonLinks();
		if($(window).width()>580){
			wrapper.appendTo(this.container);
		}
		else{
			wrapper.insertAfter(this.container);
		}
		return this;
	},
	printExcerptTeaser:function(){
		var wrapper = $('<div>')
			.addClass('excerpt_teaser')
			.addClass('int_teaser');
		var link = $('<a>')
			.attr('href','http://www.slate.com/articles/arts/books/2014/07/haruki_murakami_excerpt_from_colorless_tsukuru_tazaki_and_his_years_of_pilgrimage.html')
			.appendTo(wrapper);
		var img = $('<img>')
		.addClass('cover_art')
			.attr('src',INT_PATH+'graphics/excerpt3.png')
			.appendTo(link);
		var excerpt_label = $('<p>')
			.addClass('teaser_label')
			.html('Haida\'s Story')
			.appendTo(link);
		if($(window).width()>580){
			wrapper.appendTo(this.container);
		}
		else{
			wrapper.insertAfter(this.container);
		}
		return this;
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
	var wrapper = $('<div>')
		.addClass('int_popup_wrapper')
		.appendTo(this.par.container);
	this.container = $('<div>')
		.addClass('int_popup')
		.appendTo(wrapper);
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
		if(content.img){
			self.container.addClass('img');
		}
		if(content.text){
			self.container.addClass('text');
		}
		if(content.video){
			self.container.addClass('video');
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
			self.par.removeFingerClickListener();
			self.container.imagesLoaded(function(){
				self.container.fadeIn(function(){
					self.par.addFingerClickListener();
				});
				self.orient(type);
			});
		});
		this.addClickListener();
	},
	orient:function(type){
		var self = this;
		var finger = self.par.container.find('.finger_'+type);
		var fingers_wrapper = self.par.fingers_wrapper;
		(function orientLeft(){
			var finger_left = finger.position().left;
			var fingers_wrapper_left = fingers_wrapper.position().left;
			var total_left = finger_left + fingers_wrapper_left;
			var left = Math.max(0,total_left - (self.container.width()/2));
			if(type==='map'){
				left = Math.min(700,Math.max(total_left, left));
			}
			else if(type==='red'){
				left = (fingers_wrapper_left - self.container.width())/2;
			}
			self.container.css('left',left);
		}());
		(function orientTop(){
			// var finger_top = finger.position().top + fingers_wrapper.position().top;
			// var fingers_wrapper_top = fingers_wrapper.position().top;
			// var top = finger_top + fingers_wrapper_top;
			var finger_bottom = self.par.container.height() - (finger.position().top + 300) - 20;
			self.container
				.css({
					'top':'auto',
					'bottom':finger_bottom
				});
			if(self.container.position().top < 0){
				self.container
					.css({
						'bottom':'auto',
						'top':0
					});
			}
		}());
	},
	selectContent:function(type,callback){
		var self = this;
		var data = this.data[type];
		if(!data.slides){
			shuffle(data);
			this.data[type] = {slides:data,index:0};
			data = this.data[type];
		}
		else{
			if(data.index === (data.slides.length-1)){
				data.index = 0;
				shuffle(data.slides);
			}
			else{
				data.index++;
			}
		}
		var selected_item = data.slides[data.index];
		this.last_selected_item = selected_item;
		function shuffle(array){
			scrambleArray(array);
			if(array[0] === self.last_selected_item){
				array.splice(0,1);
				array.push(self.last_selected_item);
			}
		}
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
		// var table = $('<table>')
		// 	.appendTo(wrapper);
		// var row = $('<tr>')
		// 	.appendTo(table);
		// var cell = $('<td>')
		// 	.appendTo(row);
		if(content.img || content.text_img){
			var path = 'graphics/'+type+'/'+(content.img||content.text_img);
			var img;
			if(this.par.preloaded[path]){
				img = this.par.preloaded[path];
			}
			else{
				img = $('<img>')
					.attr('src',INT_PATH+path);
			}
			img
				.addClass('slide_img')
				.appendTo(wrapper)
				.fadeIn();
		}
		if(content.text){
			$('<div>')
				.addClass('book_wrapper')
				.html(content.text)
				.appendTo(wrapper)
				.fadeIn();
		}
		if(content.video){
			var video_wrapper = $('<video>')
				//.attr('autoplay',true)
				.attr('loop',true)
				.html('Your browser does not support the video tag.');
			$('<source>')
				.attr('src',INT_PATH+'video/'+content.video+'.mp4')
				.attr('type','video/mp4')
				.appendTo(video_wrapper);
			$('<source>')
				.attr('src',INT_PATH+'video/'+content.video+'.ogv')
				.attr('type','video/ogg')
				.appendTo(video_wrapper);
			video_wrapper.appendTo(wrapper);
			video_wrapper.get(0).play();
			setTimeout(function(){
				//because Firefox for some reason stops the movie.
				video_wrapper.get(0).play();
			},1000);
		}
		return wrapper;
	},
	hide:function(raiseFingers){
		var self = this;
		this.container.fadeOut(function(){
			self.container.find('.slide_wrapper').empty();
		});
		this.removeClickListener();
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
	},
	addClickListener:function(){
		var self = this;
		this.par.container.on('click.popup',function(e){
			var target = e.target;
			if($(e.target).hasClass('finger')){
				return;
			}
			if($(e.target).parents('.int_popup').length===0){
				self.hide(true);
			}
		});
	},
	removeClickListener:function(){
		this.par.container.unbind('click.popup');
	}
};

function routeAmazonLinks(){
	$.ajax({
			url:'http://my.slate.com/store/segments/',
			dataType:'jsonp',
			success:function(data){
				var country = data.visitor.country.toLowerCase();
				$('a')
					.each(function(){
						if($(this).attr('href')==='http://www.amazon.com/dp/B00IHMEAYK/?tag=slatmaga-20'){
							if(country === 'canada'){
								$(this).attr('href','http://www.amazon.ca/Colorless-Tsukuru-Tazaki-Years-Pilgrimage/dp/0385681836/ref=sr_1_1?tag=slatmaga-20');
							}
							if(country === 'united kingdom' || country === 'britain' || country === 'great britain' || country === 'england'){
								$(this).attr('href','http://www.amazon.co.uk/Colorless-Tsukuru-Tazaki-Years-Pilgrimage/dp/1846558336/ref=sr_1_1?tag=slatmaga-20');
							}
						}
					});
			}
		});
}

function scrambleArray(myArray) {
	var i = myArray.length,
		j, tempi, tempj;
	if (i===0) return false;
	while (--i) {
		j = Math.floor(Math.random() * (i + 1));
		tempi = myArray[i];
		tempj = myArray[j];
		myArray[i] = tempj;
		myArray[j] = tempi;
	}
}

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

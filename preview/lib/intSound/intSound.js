/* 

Abstraction layer over SoundJS: Download SoundJS: http://www.createjs.com/#!/SoundJS

By Chris Kirk. www.cperryk.com

*/
define(function(){
  var module = {
    loaded_sounds:{},
    initialize:function(directory){
      if(!module.initialized){
        createjs.FlashPlugin.swfPath = directory+'/';
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
        createjs.Sound.alternateExtensions = ["ogg"];
        module.initialized = true;
      }
    },
    tieToButton:function(btn,sound_directory,sound_id,opts){
      btn.on('click.intSound',function(){
        if(!btn.hasClass('playing_sound') || (opts && opts.behavior === 'key')) {
          if(module.loaded_sounds[sound_id]===undefined){
            loadSound();
          }
          else{
            playit();
          }
        }
        else{
          if(opts && opts.behavior !== 'key'){
            stopSound();
          }
        }
        function loadSound(){
          var sound_path = sound_directory+sound_id+'.mp3';
          btn.addClass('loading');
          createjs.Sound.addEventListener("fileload",soundLoaded);
          createjs.Sound.registerSound(sound_path,sound_id,10);
        }
        function soundLoaded(){
          module.loaded_sounds[sound_id] = true;
          playit();
          createjs.Sound.removeEventListener("fileload",soundLoaded);
        }
        function playit(){
          btn.removeClass('loading');
          btn.addClass('playing_sound');
          var instance = createjs.Sound.play(sound_id);
          instance.addEventListener("complete",endSound);
        }
        function stopSound(){
          $('.playing_sound').removeClass('playing_sound');
          createjs.Sound.stop();
          endSound();
        }
        function endSound(){
          btn.removeClass('playing_sound');
        }
      });
    },
    stopAll:function(){
      createjs.Sound.stop();
      $('.playing_sound').removeClass('playing_sound');
    },
    untieButton:function(btn){
      btn.unbind('click.intSound');
    }
  };
  return module;
});

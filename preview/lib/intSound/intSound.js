/* 

Abstraction layer over SoundJS: Download SoundJS: http://www.createjs.com/#!/SoundJS

By Chris Kirk. www.cperryk.com

*/
define(['SoundJS'],function(){
  var module = {
    loaded_sounds:{},
    initialize:function(directory,callback){
      if(module.initialized){
        if(callback){
          callback(module);
        }
        return;
      }
      if(getIEversion()===8){
        require(['SJS_FlashPlugin','SJS_SwfObject'],intitializeForIE);
      }
      else{
        module.initialized = true;
        if(callback){
          callback(module);
        }
        return;
      }
      function getIEversion(){
        var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');
        while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i>< ![endif]-->',
            all[0]
        );
        return v > 4 ? v : undef;
      }
      function intitializeForIE(FlashPlugin,SwfObject){
        createjs.FlashPlugin.swfPath = directory+'/';
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
        createjs.Sound.alternateExtensions = ["ogg"];
        module.initialized = true;
        if(callback){
          callback(module);
        }
      }
    },
    tieToButton:function(btn,sound_directory,sound_id,opts){
      btn.on('click.intSound',function(){
        if(!btn.hasClass('playing_sound') || (opts && opts.behavior === 'key')) {
          if(module.loaded_sounds[sound_id]===undefined){
            btn.addClass('loading');
            module.loadSound(sound_directory,sound_id,function(){
              btn
                .removeClass('loading')
                .addClass('playing_sound');
              module.playSound(sound_directory,sound_id, endSound);
            });
          }
          else{
            module.playSound(sound_directory,sound_id);
          }
        }
        else{
          if(opts && opts.behavior !== 'key'){
            stopSound();
          }
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
      return module;
    },
    playSound:function(sound_directory, sound_id, callback){
      if(module.loaded_sounds[sound_id]===undefined){
        module.loadSound(sound_directory, sound_id, function(){
          module.playSound(sound_directory,sound_id,callback);
        });
      }
      else{
        var instance = createjs.Sound.play(sound_id);
        instance.addEventListener("complete",function(){
          if(callback){
            callback();
          }
        });
      }
    },
    loadSound:function(sound_directory, sound_id, callback){
      var sound_path = sound_directory+sound_id+'.mp3';
      createjs.Sound.addEventListener("fileload",soundLoaded);
      createjs.Sound.registerSound(sound_path,sound_id,10);
      function soundLoaded(){
        module.loaded_sounds[sound_id] = true;
        createjs.Sound.removeEventListener("fileload",soundLoaded);
        if(callback){
          callback();
        }
      }
      return module;
    },
    stopAll:function(){
      createjs.Sound.stop();
      $('.playing_sound').removeClass('playing_sound');
      return module;
    },
    untieButton:function(btn){
      btn.unbind('click.intSound');
      return module;
    }
  };
  return module;
});

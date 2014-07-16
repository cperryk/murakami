<h1>IntSound</h1>
IntSound is an abstraction layer on soundjs. It's used to more rapidly perform common tasks, particularly attaching sound to buttons.

<h2>stopAll</h2>
Stops all sounds from playing, and removes the class "playing_sound" from all elements.

<h2>tieToButton</h2>
Attach a click listener to *btn*. When *btn* is clicked, a specified sound will load and play. During loading, *btn* will gain the class "loading." When playing a sound, *btn* will gain the class "playing_sound."
* *btn*: A jQuery object.
* *sound_directory*: The directory in which the sound file is stored, e.g. "sound/"
* *sound_id*: The name of the sound file without the extension.
* *opts*: A dictionary of configuration options.
* *behavior*: If set to "key," the button will behave like a piano key, i.e. it will not stop any other sounds that are currently playing. The default behavior is for the button to stop all other sounds.

<h2>untieButton</h2>
Removes a listener added by tieToButton() from the specified button.
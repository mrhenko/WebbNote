/*!
 * WebbNote
 * 
 * @version 0.1.5.2
 * @repository https://github.com/mrhenko/WebbNote
 */

( function( $, $document, undefined ) {
	$document.ready( function() {
		$( 'html' ).addClass( 'js' );
		
		var $quicknav = $( '#quicknav' ),
			$keynote = $( '#keynote' ),
			$player = $( '#player' ),
			$playpause = $( '#playpause' ),
			$audio = $( '#presentation' ),
			audio = $audio.get( 0 );
		
		// Make a list of the various slides/pages (.page)
		// and add them to the quick navigation menu
		$keynote.find( '.page' ).each( function() {
			var $this = $( this ),
				data_visible = $this.attr( 'data-visible' ),
				li_name = $this.find( 'h2' ).html();
				
			if ( li_name == null ) {
				li_name = $this.find( 'h1' ).html();
			}
			
			var new_li = '<li class="page_quicknav"><a href="#" data-time="' + data_visible + '">' + li_name + '</a></li>';
			$quicknav.append( new_li );
		} );
		
		// Make the progressbar as "long" as the presentation
		// (Disabled since there is no working progress bar.)
		// var progressbar = $('#progressbar');
		// var duration = Math.round(audio.duration);
		//
		// $(progressbar).attr('max', duration);
		
		// Transport controls for the media player
		$playpause.click(function() {
			if ( audio.paused ) {
				audio.play();
			} else {
				audio.pause();
			} 
		} );

		// The stop button
		$player.find( '.stop' ).click( function() {
			audio.pause();
			audio.currentTime = 0;
		} );
		
		$player.find( '.repeat' ).click(function() {
			var newtime = audio.currentTime;
			newtime = newtime - 10;
			
			if ( newtime < 0 ) {
				newtime = 0;
			}
			
			audio.currentTime = newtime;
		} );
		
		$audio.bind( 'play', function() {
			$playpause.addClass( 'pause' );
			$playpause.removeClass( 'play' );
		} );
		
		$audio.bind( 'pause', function() {
			$playpause.addClass( 'play' );
			$playpause.removeClass( 'pause' );
		} );
		
		// An event handeler for when the audio is playing
		$audio.bind( 'timeupdate', function() {
			var position = audio.currentTime;
			
			// Move the progress bar indicator
			// (Disabled since there is no working progress bar.)
			// $(progressbar).attr('value', position);
			
			// Check all elements that has a 'data-hide' attribute.
			$( '[data-hide]' ).each( function() {
				var $this = $( this ),
					hidetime = $this.attr( 'data-hide' ) / 1000;
					
				if ( position >= hidetime ) {
					$this.removeClass( 'show' );
				}
			});
			
			// Check all elements that has a 'data-visible' attribute
			$( '[data-visible]' ).each( function() {
				var $this = $( this );
				
				// The class .timed tells the framework that the element
				// should have a timed apperance.
				$this.addClass( 'timed' );
				
				// Convert the time to seconds
				var starttime = $this.attr( 'data-visible' ) / 1000;
				var hidetime = $this.attr( 'data-hide' ) / 1000;

				if ( hidetime ) {
					if ( ( position >= starttime ) && ( position < hidetime ) ) {
						$this.addClass( 'show' );
					} else {
						$this.removeClass( 'show' );
					}
				} else {
					if ( position >= starttime ) {
						$this.addClass( 'show' );
					} else {
						$this.removeClass( 'show' );
					}
				}
			} );
		} );
		
		// If the user clicks an option in the quick nav menu
		// change the audio position to this "chapter".
		$quicknav.find( 'a' ).bind( 'click', function() {
			var new_position = $( this ).attr( 'data-time' ) / 1000;
			audio.currentTime = new_position;
		} );
	} );
})( jQuery, jQuery( document ) );

function init_webbnote( files ) {
	if ( !!document.createElement( 'audio' ).canPlayType ) {
		var player = '<aside class="sidebar"><ul id="quicknav" class="quicknav"><li><h2>Snabbvalsmeny</h2></li></ul><div id="player"><audio id="presentation">';
		
		$( files ).each( function () {
			player = player + '<source src="' + this + '" />';
		} );
		
		player = player + '</audio><a href="#" id="playpause" class="play"></a><a href="#" class="stop"></a><a href="#" class="repeat"></a></div></aside>';
		
		$( player ).appendTo( 'body' );
		
		// Check alla data-visible and data-hide attribute to see if
		// any of them uses the hh:mm:ss format and convert those to
		// milliseconds.
		$( '[data-visible]' ).each(function() {
			var $this = $( this ),
				visitime = $this.attr( 'data-visible' ),
				hidetime = $this.attr( 'data-hide' );
				
			if ( visitime.search( ':' ) != -1 ) {
				// Split the time into an array
				var time_array = visitime.split( ':' );
				new_time = hms_to_ms( time_array );	
				$this.attr( 'data-visible', new_time );
			}
			
			if ( hidetime ) {			
				if ( hidetime.search( ':' ) != -1 ) {
					time_array = hidetime.split( ':' );
					new_time = hms_to_ms( time_array );
					$this.attr( 'data-hide', new_time );
				}
			}
			
		} );
		
		// Make sure all elements with a starttime of 0 i showned from
		// the start. (Without this, there is a potential problem with
		// Firefox.)
		$( '[data-visible="0"]' ).addClass( 'show' );
	} else {
		// Error handling for browsers that don't support <audio>
		var warning = '<div class="page warning"><h1>Ett fel uppstod</h1><p>Din webbläsare har inte stöd för <audio>-elementet i HTML5.</p><p>Detta är en förutsättning för att WebbNote ska fungera. Uppdatera till en modernare webbläsare eller nyare version av din nuvarande webbläsare.</p><p>WebbNote är testat och fungerar med <ul><li><a href="http://www.apple.com/se/safari/" style="color: #000">Apple Safari 5</a>, (i Windows måste du även ha Quicktime installerat)</li><li><a href="http://www.google.com/chrome" style="color: #000">Google Chrome 10</a></li><li><a href="http://mozilla.com" style="color: #000">Mozilla Firefox 4</a></li><li><a href="http://opera.com/browser" style="color: #000">Opera Web Browser 11</a></li><li><a href="http://windows.microsoft.com/sv-SE/internet-explorer/downloads/ie" style="color: #000">Microsoft Internet Explorer 9</a></li></ul></p></div>';
		$( warning ).prependTo( 'body' );
	}
}

/** 
* Hours:Minutes:Seconds to milliseconds.
*
* Converts time that has been written like HH:MM:SS
* to milliseconds. Used on initilazation of WebbNote.
* 
* @param time_array Time, spliced to an array.
*
* @return An integer with the time in milliseconds.
*/
function hms_to_ms( time_array ) {
	time_array = time_array.reverse();
				
	var new_time = 0,
		i = 1;
	new_time += time_array[ 0 ] * 1000;
				
	while( i < time_array.length ) {
		var times = Math.pow( 60, i );
		new_time = parseInt( new_time ) + time_array[ i ] * times * 1000;
		i++;
	}
	
	return new_time;
}
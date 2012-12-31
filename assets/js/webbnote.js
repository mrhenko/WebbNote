/*!
 * WebbNote
 * 
 * @version 0.1.6-wip
 * @repository https://github.com/mrhenko/WebbNote
 */

( function( $, $document, undefined ) {
	// Add js class to html element
	$( 'html' ).addClass( 'js' );
		
	// Check if all prerequisites are fulfilled and bail if not.
	if ( webbnote_check() !== true ) {
		return;
	}
	
	
	
	
	
	/*--- VARIABLES ---*/
	var $keynote = $( '#keynote' ),
		$header = $( '<header id="header" class="header"></header>' ),
		$footer = $( '<footer id="footer" class="footer"></footer>' ),
		$quicknav = $( '<ol id="quicknav" class="quicknav"></ol>' ),
		$player = $( '<div id="player" class="player"></div>' ),
		$audio = $( '<audio id="presentation"></audio>' ),
		audio = $audio.get( 0 );
	
	
	
	
	
	/*--- EVENT DELEGATION ---*/
	$document
		.delegate( '.menu-open', 'click', function( e ) {
			e.preventDefault();
			$( '#header' ).toggleClass( 'header--open' );
		} );
		
	$header
		.delegate( '.quicknav a', 'click', function( e ) {
			e.preventDefault();
			
			var new_position = $( this ).attr( 'data-time' ) / 1000;
			audio.currentTime = new_position;
		} );
	
	$player
		.delegate( '.play', 'click', function( e ) {
			e.preventDefault();
			
			if ( audio.paused ) {
				audio.play();
			} else {
				audio.pause();
			} 
		} )
		.delegate( '.stop', 'click', function( e ) {
			e.preventDefault();
			
			audio.pause();
			audio.currentTime = 0;
		} )
		.delegate( '.repeat', 'click', function( e ) {
			e.preventDefault();
			
			var newtime = audio.currentTime;
			newtime = newtime - 10;
			
			if ( newtime < 0 ) {
				newtime = 0;
			}
			
			audio.currentTime = newtime;
		} )
		.delegate( '#progress', 'click', function( e ) {
			e.preventDefault();
			
			var $this = $( this ),
				position = ( e.pageX - $this.offset().left ) / $this.width(),
				newTime = audio.duration * position;
			
			audio.currentTime = newTime;
			
			// Manually trigger timeupdate event if audio is paused to update view.
			if ( audio.paused ) {
				$audio.trigger( 'timeupdate' );
			}
		} );
	
	$audio.bind( 'play', function() {
		$( '#play' ).addClass( 'pause' );
	} );
	
	$audio.bind( 'pause', function() {
		$( '#play' ).removeClass( 'pause' );
	} );
	
	// An event handler for when the audio is playing
	$audio.bind( 'timeupdate', function() {
		var position = audio.currentTime;
		
		// Update progressbar
		$( '#progress' ).find( '.progress-percentage' ).css( 'width', ( ( audio.currentTime / audio.duration ) * 100 ) + '%' );
		
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
	
	
	
	
	
	/*--- DOM READY ---*/
	$document.ready( function() {
		// Add header and footers to page.
		$header
			.append( '<h2>Kapitel</h2>' )
			.append( $quicknav )
			.append( '<a class="menu-open" href="#">&#9776;</a>' );
		
		$player
			.append( '<a href="#" class="play">&nbsp;</a><a href="#" class="stop">&nbsp;</a><a href="#" class="repeat">&nbsp;</a>' )
			.append( '<div id="progress" class="progress"><div class="progress-percentage"></div>' )
			.append( $audio );
		
		$footer
			.append( $player );
		
		$( 'body' )
			.prepend( $header )
			.append( $footer );
		
		// Make a list of the various slides/pages (.page)
		// and add them to the quick navigation menu
		$keynote.find( '.page' ).each( function() {
			var $this = $( this ),
				data_visible = $this.attr( 'data-visible' ),
				li_name = $this.find( 'h2' ).html();
				
			if ( li_name === null ) {
				li_name = $this.find( 'h1' ).html();
			}
			
			var new_li = '<li class="page_quicknav"><a href="#" data-time="' + data_visible + '">' + li_name + '</a></li>';
			$quicknav.append( new_li );
		} );
		
		for( var i = 0, length = files.length; i < length; i++ ) {
			$audio.append( '<source src="' + files[ i ] + '" />' );
		}
		
		// Check all data-visible and data-hide attribute to see if
		// any of them uses the hh:mm:ss format and convert those to
		// milliseconds.
		$( '[data-visible]' ).each( function() {
			var $this = $( this ),
				visitime = $this.attr( 'data-visible' ),
				hidetime = $this.attr( 'data-hide' ),
				time_array;
				
			if ( visitime.search( ':' ) != -1 ) {
				// Split the time into an array
				time_array = visitime.split( ':' );
				$this.attr( 'data-visible', hms_to_ms( time_array ) );
			}
			
			if ( hidetime ) {			
				if ( hidetime.search( ':' ) != -1 ) {
					time_array = hidetime.split( ':' );
					$this.attr( 'data-hide', hms_to_ms( time_array ) );
				}
			}
			
			// Make sure all elements with a starttime of 0 is shown from
			// the start. (Without this, there is a potential problem with
			// Firefox.)
			if ( hms_to_ms( visitime.split( ':' ) ) === 0 ) {
				$this.addClass( 'show' );
			}
		} );
	} );
} )( jQuery, jQuery( document ) );


function webbnote_check() {
	var warning = false;
	
	// Check if files variable have been set and contains files.
	if ( typeof( files ) != undefined && files !== null && Object.prototype.toString.apply( files ) !== '[object Array]' && files.length === 0 ) {
		warning = '<div><p>Inga ljudfiler har angetts.</p><p>Kontrollera att du använder den <a href="https://github.com/mrhenko/WebbNote/wiki/Syntax">senaste mallen</a> för WebbNote samt att du lagt till ljudfilerna i dokumentets sidfot.</p></div>';
	}
	
	// Check if browser supports audio element.
	if ( !document.createElement( 'audio' ).canPlayType ) {
		warning = '<div><p>Din webbläsare har inte stöd för <audio>-elementet i HTML5.</p><p>Detta är en förutsättning för att WebbNote ska fungera. Uppdatera till en modernare webbläsare eller nyare version av din nuvarande webbläsare.</p><p>WebbNote är testat och fungerar med <ul><li><a href="http://www.apple.com/se/safari/" style="color: #000">Apple Safari 5</a>, (i Windows måste du även ha Quicktime installerat)</li><li><a href="http://www.google.com/chrome" style="color: #000">Google Chrome 10</a></li><li><a href="http://mozilla.com" style="color: #000">Mozilla Firefox 4</a></li><li><a href="http://opera.com/browser" style="color: #000">Opera Web Browser 11</a></li><li><a href="http://windows.microsoft.com/sv-SE/internet-explorer/downloads/ie" style="color: #000">Microsoft Internet Explorer 9</a></li></ul></p></div>';
	}
	
	// Print any warnings.
	webbnote_error( warning );
	
	return ( warning === false ? true : false );
}

function webbnote_error( warning ) {
	if ( warning === false ) return;
	
	$( 'body' ).prepend( '<div class="page warning"><h1>Ett fel uppstod</h1>' + warning + '</div>' );
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
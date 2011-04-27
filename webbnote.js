(function($) {
	$(document).ready(function() { 
		// Skapa en lista över de olika sidorna (.page)
		// och lägg dem i en snabbnavigeringsmeny
		var quicknav = $('ul#quicknav');
		$('#keynote .page').each(function () {
			var data_visible = $(this).attr('data-visible');
			var li_name = $(this).find('.headline h2').html();
			if (li_name == null) {
				li_name = $(this).find('h1').html();
			}
			var new_li = '<li class="page_quicknav"><a href="#" data-time="' + data_visible + '">' + li_name + '</a></li>';
			$(quicknav).append(new_li);
		});
	
		// Skapa variabler för keynoten och ljudet för att
		// snabba upp det hela.
		
		var keynote = $('#keynote');
		var audio = $('#presentation').get(0);
		
		// Gör progressbaren lika "lång" som låten
		var progressbar = $('#player #progressbar');
		var duration = Math.round(audio.duration);
		
		$(progressbar).attr('max', duration);
		
		// Mediaspelarkontroller
		$('#player #playpause').click(function() {
			if (audio.paused) {
				audio.play();
			} else {
				audio.pause();
			} 
		});
		
		// Stoppknappen
		$('#player .stop').click(function() {
			audio.pause();
			audio.currentTime = 0;
		});
		
		$('#player .repeat').click(function() {
			var newtime = audio.currentTime;
			newtime = newtime - 10;
			console.log(newtime);
			if (newtime < 0) {
				newtime = 0;
			}
		});
		
		$(audio).bind('play', function() {
			$('#player #playpause').addClass('pause');
			$('#player #playpause').removeClass('play');
		});
		$(audio).bind('pause', function() {
			$('#player #playpause').addClass('play');
			$('#player #playpause').removeClass('pause');
		});
		
		// En event-hanterare för när ljudet spelas
		$(audio).bind('timeupdate', function() {
			var position = audio.currentTime;
			
			// Flytta progressbar-indikatorn
			$(progressbar).attr('value', position);
			
			// Kolla igenom alla element som har en "data-hide"
			// som alltså talar om när den ska vara osynlig.
			$('[data-hide]').each(function() {
				var hidetime = $(this).attr('data-hide') / 1000;
				if (position >= hidetime) {
					$(this).removeClass('show');
				}
			});
			
			// Kolla igenom alla element som har en 'data-visible'
			// som alltså talar om när den ska vara synlig.
			$('[data-visible]').each(function() {
				// Tala om att de ska vara tidsinställda
				$(this).addClass('timed');
				
				// När ska elementet visas, i sekunder
				var starttime = $(this).attr('data-visible') / 1000;
				var hidetime = $(this).attr('data-hide') / 1000;
				// Kontrollera att elementet verkligen har en "hidetime"
				if (hidetime) {
					if ((position >= starttime) && (position < hidetime)) {
						$(this).addClass('show');
					} else {
						$(this).removeClass('show');
					}
				} else {
					if (position >= starttime) {
						$(this).addClass('show');
					} else {
						$(this).removeClass('show');
					}
				}
			});
		});
		
		// Klick i snabbvalsmenyn resulterar i att
		// ljudfilens uppspelningsposition flyttas.
		$('#quicknav a').bind('click', function() {
			var new_position = $(this).attr('data-time') / 1000;
			audio.currentTime = new_position;
		});
	});
})(jQuery);

function init_webbnote(files) {
	if(!!document.createElement('audio').canPlayType) {
		var player = '<aside class="sidebar"><ul id="quicknav"><li><h2>Snabbvalsmeny</h2></li></ul><div id="player"><audio id="presentation">';
		
		$(files).each(function () {
			player = player + '<source src="' + this + '" />';
		});
		
		player = player + '</audio><a href="#" id="playpause" class="play"></a><a href="#" class="stop"></a><a href="#" class="repeat"></a></div></aside>';
		
		$(player).appendTo('body');
		
		/*
			Kontrollera om några data-visible eller data-hide-attribut
			har skrivits som hh:mm:ss-format och konvertera dem i så fall
			till ms.
		*/
		$('[data-visible]').each(function() {
			var visitime = $(this).attr('data-visible');
			if (visitime.search(':') != -1) {
				// Det här är en data-variabel som formaterats enligt hh:mm:ss
				// Konvertera den.
				var time_array = visitime.split(':');
				new_time = hms_to_ms(time_array);	
				$(this).attr('data-visible', new_time);
			}
			
			var hidetime = $(this).attr('data-hide');
			if (hidetime) {			
				if (hidetime.search(':') != -1) {
					time_array = hidetime.split(':');
					new_time = hms_to_ms(time_array);
					$(this).attr('data-hide', new_time);
				}
			}
			
		});
		
		log_user();
		
		// Se till att de element som har starttid 0 visas redan från
		// början, även i Firefox (som krånglar annars).
		$('[data-visible="0"]').each(function() {
			$(this).addClass('show');
		});
	
	} else {
		// Hantera webbläsare som inte har stöd för <audio>
		var warning = '<div class="warning"><h1>Ett fel uppstod</h1><p>Din webbläsare har inte stöd för &lt;audio&gt;-elementet i HTML5.</p><p>Detta är en förutsättning för att WebbNote ska fungera. Uppdatera till en modernare webbläsare eller nyare version av din nuvarande webbläsare.</p><p>WebbNote är testat och fungerar med <ul><li><a href="http://www.apple.com/se/safari/" style="color: #000">Apple Safari 5</a>, (i Windows måste du även ha Quicktime installerat)</li><li><a href="http://www.google.com/chrome" style="color: #000">Google Chrome 10</a></li><li><a href="http://mozilla.com" style="color: #000">Mozilla Firefox 4</a></li><li><a href="http://opera.com/browser" style="color: #000">Opera Web Browser 11</a></li><li><a href="http://windows.microsoft.com/sv-SE/internet-explorer/downloads/ie" style="color: #000">Microsoft Internet Explorer 9</a></li></ul></p></div>';
		$(warning).appendTo('body');
	}
}

/** 
* Hours:Minutes:Seconds to milliseconds.
*
* Konverterar tid som skrivits enligt HH:MM:SS
* till millisekunder. Används vid initialisering
* av WebbNote
* 
* @param time_array Tidsinmatningen uppslipptat i en array
*
* @retern Returnerar new_time, en integer med tiden i millisekunder
*/
function hms_to_ms(time_array) {
	time_array = time_array.reverse();
				
	var new_time = 0;
	var i = 1;
	new_time = new_time + time_array[0] * 1000;
				
	while(i < time_array.length) {
		var times = Math.pow(60, i);
		new_time = parseInt(new_time) + time_array[i] * times * 1000;
		i++;
	}
	return new_time;
}

/**
* Log user info
*
* Skickar information om besökarens webbläsare och
* operativsystem till min server så att jag kan se
* vilka konfigurationer som fungerar med WebbNote.
* IP-nummer eller liknande skickas INTE
*
*/
function log_user() {
	if('localStorage' in window && window['localStorage'] !== null){
		if ((localStorage.getItem('wn_sent') == undefined) || (localStorage.getItem('wn_sent') != 'sent')) {
			var wn_browser = {}
			wn_browser.ua = escape(navigator.userAgent);
			wn_browser.os = escape(navigator.platform);		
			wn_browser.pf = 'tj1saXXN2mSzVPTrQAsz';
			wn_browser.tl = document.title;
			
			$.ajax({
				type: 'POST',
				url: 'http://henrikcarlsson.se/wnlog/log.php',
				data: wn_browser
			});
		}
	}
}
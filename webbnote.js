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
		
		player = player + '</audio><a href="#" id="playpause" class="play"></a><a href="#" class="stop"></a></div></aside>';
		
		$(player).appendTo('body');
		
		// Se till att de element som har starttid 0 visas redan från
		// början, även i Firefox (som krånglar annars).
		$('[data-visible="0"]').each(function() {
			$(this).addClass('show');
		});
	
	} else {
		// Hantera webbläsare som inte har stöd för <audio>
		var warning = '<div class="warning">Din webbläsare har inte stöd för &lt;audio&gt;-elementet i HTML5.</div>';
		$(warning).appendTo('body');
	}
}
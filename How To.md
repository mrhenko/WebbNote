WebbNote – Kort tutorial
==========

En WebbNote-presentation består av ett HTML5-dokument och en ljudfil. Ett JavaScript används sedan för att få det att fungera som en rullande presentation.

Grundstruktur på HTML-sidan
--------
Använd alltid följande kod som grundplåt för HTML-filen:

	<!DOCTYPE html>
	<html class="dev">
	<head>
		<meta charset="UTF-8" />
		<title>WebbNote: Proof of Concept</title>
		<link rel="stylesheet" href="webbnote/core.css" media=”screen” />
		<link rel=”stylesheet” href=”webbnote/default_theme.css” media=”screen” />
		<link rel=”stylesheet” href=”webbnote/print.css” />
	</head>
	<body>
	
	</body>
	</html>

Texten till din presentation läggs sedan in i `<body>`-elementet (alltså mellan `<body>` och `</body>`). Så länge `<html>` har klassen dev så kommer alla sidor i din presentation att visas samtidigt i webbläsaren, stackade på varandra med den första längst upp. När det är dags att testa presentationen med ljud och sedan lämna ut den till studenterna så är det bara att ta bort dev-klassen. (`<html class="dev">` byts alltså ut mot bara `<html>`.)

Presentationen
--------
Hela din presentation måste placeras i valfritt blocklevel-HTML-element med ID keynote. Jag rekommenderar att elementet `<article>` används då detta känns mest semantiskt korrekt.

Därefter ska innehållet delas in i sidor. Även för sidorna är det valfritt vilket HTML-element du vill använda, men jag rekommenderar `<section>`. Det viktigaste är att elementet som du väljer ges klassen page. (Observera att sidorna definieras av sin klass medan presentationen som helhet definieras av sitt ID.) Du skapar så många sidor som du vill.

Slutligen ska de olika textpunkterna in på respektive sida. Jag rekommenderar att detta görs genom att skapa en osorterad lista (alltså en `<ul>`) på varje sida och göra punkterna som listpunkter `<li>`. Listpunkter ska ges klassen bullet.

### Exempel
	<!DOCTYPE html>
	<html class="dev">
	<head>
		<meta charset="UTF-8" />
		<title>WebbNote: Proof of Concept</title>
		<link rel="stylesheet" href="webbnote/core.css" media=”screen” />
		<link rel=”stylesheet” href=”webbnote/default_theme.css” media=”screen” />
		<link rel=”stylesheet” href=”webbnote/print.css” />
	</head>
	<body>
		<article id="keynote">
			<section class="page">
				<ul>
					<li>Det här är första punkten på första sidan</li>
					<li>Det här är andra punkten</li>
				</ul>
			</section>
			<section class="page">
				<ul>
					<li>Det här är första punkten på sida två.</li>
				</ul>
			</section>
		</article>
	</body>
	</html>

Tidsangivelser
---------
Synligheten hos samtliga element i WebbNote kan styras av tidskoden i din ljudfil. Detta borde vara intressant för i första hand sidor och i andra hand listpunkter.
Ett element ges tidskodsinställningar genom attributet data-visible som ges ett tidsvärde. Om elementet senare ska döljas (varje sida bör döljas när den inte längre är aktuell) så används attributet data-hide. (Listpunkterna behöver inte döljas manuellt. Detta sköts automatiskt då den aktuella sidan döljs.)
Tidsangivelserna kan anges antingen i millisekunder eller formaterade som hh:mm:ss (alltså timmar:minuter:sekunder). Sekunderna kan även ges decimaler.
En sida som ska visas efter 2 minuter och döljas efter 2 och en halv ska alltså märkas upp antingen så här (millisekunder):

	<section class=”page” data-visible=”120000” data-hide=”150000”>
		Sidans innehåll
	</section>

eller så här (minuter och sekunder):

	<section class=”page” data-visible=”2:00” data-hide=”2:30”>
		Sidans innehåll
	</section>

Kom ihåg att samtliga tider är absoluta utifrån 0:00:00 i ljudfilen. Det innebär alltså att exempelsidan som visas efter 2 minuter och döljs efter 2,5 är öppen i totalt 30 sekunder.

Startsida
----------
För att skapa en tydlig startsida till din keynote kan du använda dig av klassen startup på den ”page” du vill ha som startsida. Använd sedan en rubrik av första graden (`<h1>`) för titeln.

Alltså:

	<section class="page startup">
		Sidans innehåll
	</section>

Sidrubriker
---------------
Sidrubriker placeras med fördel i samma lista som listpunkterna, men utan klassen bullet. Använd istället headline. Dessutom bör du använda andra gradens rubrik (`<h2>`).

JavaScript – aktivera presentationen
----------------------------------------------
Den timingbaserade visningen av element och uppspelningen av ljud förlitar sig på javascript för att fungera. Följande kod ska läggas in längst ner i bodyn, alldeles innan sluttaggen `</body>`.

	<script src="webbnote/jquery-1.4.4.min.js"></script>
	<script src="webbnote/webbnote.js"></script>

Detta laddar in biblioteken ”jQuery” och ”WebbNote”. Slutligen måste du aktivera din webbnote. Detta görs med funktionen init_webbnote(). Den kräver en eller flera ljudfiler för att fungera. Du anger vilka med hjälp av en så kallad array.

	<script>
		var files = new Array(ljudfil.mp3', 'ljudfil.ogg');
		init_webbnote(files);
	</script>

Observera att de olika ljudfilerna inte är olika filer som spelas upp vid olika tidpunkter utan samma ljud, fast olika filformat. Anledningen till att flera filformat bör användas är att olika webbläsare stöder olika ljudformat.

För maximalt stöd så bör din berättarröst finnas i både .mp3 och .ogg-format.

Webbläsarstöd
-------------------
WebbNote är testat (2011-04-04) och fullt fungerande i följande webbläsare:

### I Mac OS X
* Apple Safari 5.0.4
* Mozilla Firefox 4.0
* Google Chrome 10
* Opera 11.01

### I Windows
* Microsoft Internet Explorer 9
* Mozilla Firefox 4.0
* Opera 11.01
* Google Chrome 10
* Apple Safari 5.0.4 (kräver att Quicktime är installerat)

### Mobila enheter
* iPhone (iOS 4.0.2)
* iPad (iOS 4.2)

### Linux
Ordentliga tester har inte kunnat genomföras, men det mesta tyder på att WebbNote-presentationer fungerar utmärkt i moderna versioner av Chrome/Chromium.
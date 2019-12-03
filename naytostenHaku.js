//näytösten haku funktio katsoo mikä teatteri on valittuna ja hakee sitten sen teatterin näytösten tiedot
function naytostenHaku(){

	//tyhjennetään aluksi taulun tiedot, oon 99% varma että tätä ei ikinä tarvi, mutta se on siinä varmuuden vuoksi jos tapahtuu jotain outoa
	//(esim. ettei tule 2 eri teatterin näytökset samaan aikaan)
	document.getElementById("naytostenTiedot").innerHTML = "";
	
	//teatterinValinta on se selecti jolla valitaan teatteri
	var teatterinValinta = document.getElementById("teatterinValinta");
	//otetaan valitun teatterin id, käytän noita Finnkinon omia id numeroita tässä niin voin laittaa sen id suoraan tohon urlin perään
	var valitunTeatterinId = teatterinValinta.options[teatterinValinta.selectedIndex].value;
	//tämä on se urli mistä haetaan näytösten tiedot
	var haettavaUrli = "https://www.finnkino.fi/xml/Schedule/?area=" + valitunTeatterinId;
	
	//luodaan XMLHttpRequest objekti
	var xhttp = new XMLHttpRequest();
	//tarkastellaan XMLHttpRequestin tilaa, kun readyState on 4 se tarkoittaa että XMLHttpRequest on valmis ja vastaus eli xml:n sisältö on valmis
	//status 200 tarkoittaa OK
	  xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		//eli kun yllämainitut readyState ja status on valmiit ja ok, tarkoittaa se että xml pyyntö on käsitelty ja xml sisältö on valmiina
		//tarkasteltavaksi, käytän siihen seuraavaa funktiota eli "naytaTulokset" funktiota johon lähetän xml:n sisällön 
		  naytaTulokset(this);
		  }};
	  xhttp.open("GET", haettavaUrli, true);
	  xhttp.send();
	
}
//tulosten näyttämis funktio saa xml sisällön näytösten haku funktiolta ja asettaa sen html sivulla olevaan "naytostenTiedot" tableen
function naytaTulokset(xml){
	//teatterinValinta on se selecti jolla valitaan teatteri
	var teatterinValinta = document.getElementById("teatterinValinta");
	//otetaan selectistä teatterin nimi talteen että voidaan näyttää selectin ja tablen välissä "naytoksetTanaanTeksti" jossa lukee esim.
	//"Näytökset tänään teatterissa Vantaa Flaming" jne, niin että käyttäjän valitseman teatterin nimi näkyy siinä aina ja muuttuu aina
	var teatterinNimi = teatterinValinta.options[teatterinValinta.selectedIndex].text;
	//<span></span> tagit vielä koristelun takia elokuvan nimen ympärillä että se näkyy eri värillä
	document.getElementById("naytoksetTanaanTeksti").innerHTML = "Näytökset tänään teatterissa <span> "+ teatterinNimi+"</span>";
	
	//var table on periaatteessa kokonainen html table stringinä, mulla on tuolla index.html pelkkä tyhjä table, niin tässä
	//luodaan koko sen tablen sisältö mukaan lukien kaikki table headerit ja row:t yms ja laitetaan se kokonaan kerralla siihen tilalle
	//joka kerta kun tämä funktio kutsutaan, jos tekisin sen niinpäin että mulla olis tuolla html:ssä tablessa kaikki valmiina paitsi
	//solujen sisällöt niin se menisi mun mielestä vaikeemmaks koska rivien määrä aina vaihtelee (1 rivi tablessa = 1 näytös)
	//Aluksi luodaan table headerit, jotka on aina noi samat
	var table="<tr><th></th><th>Elokuva</th><th>Genre</th><th>Ikäraja</th><th>Kesto</th><th>Näytösaika</th></tr>";
	//eli show on yhden näytöksen kaikki tiedot, sitä tarvitaan kokoajan kun otetaan sen tietoja tossa alhaalla niin teen siitä variablen
	var show = xml.responseXML.getElementsByTagName("Show");
	//for loop joka tekee jokaista show:ta kohden yhden uuden rivin tableen, ja siihen riviin tulee aina sen elokuvan tiedot, jotka laitetaan
	//for loopissa yksi kerrallaan siihen
	for (var i = 0; i <show.length; i++) { 
		//tableen lisätään ensiksi kuvat, toi tooltip on sitä varten että taulussa näkyy normaalisti toi pieni kuva, mutta jos hoveraa
		//sitä hiirellä niin tulee tooltippinä medium kokoinen kuva
		table += "<tr><td><div class='tooltip'>" +
		//tein muutaKuvanOsoiteTauluunSopivaksi funktion erikseen tuonne alas kun en keksinyt tapaa saada sitä tässä suoraan muutettua muotoon
		//<img src=" yms..>
		muutaKuvanOsoiteTauluunSopivaksi(show[i].getElementsByTagName("EventSmallImagePortrait")[0].childNodes[0].nodeValue) +
		//tässä otetaan medium kuva tooltippiä varten erikseen
		"<span class='tooltiptekstiTaiKuva'>" + muutaKuvanOsoiteTauluunSopivaksi(show[i].getElementsByTagName("EventMediumImagePortrait")[0].childNodes[0].nodeValue) + "</span></div></td><td><b>" +
		//elokuvan nimi talteen, se käy eka läpi tarkistuksen alla olevassa tarkistaElokuvanNimi funktiossa
		//elokuvan nimi laitetaan myös tässä kohtaa boldilla että näyttää hienommalta taulukossa
		tarkistaElokuvanNimi(show[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue) +
		"</b></td><td>" +
		//genret talteen tableen
		show[i].getElementsByTagName("Genres")[0].childNodes[0].nodeValue +
		"</td><td><div class='tooltip'>" +
		//ikärajat näytän taulukossa kuvana ja lisänä vielä tooltip tekstinä, eli jos vie hiiren ikäraja kuvan päälle niin se näkyy tekstinä
		//lähinnä noitten anniskeluikärajojen takia että se näkyy kivasti erikseen selitettynä siinä tooltippissä
		//Nää ikäraja kuvat käyttää myös tota samaa funktiota kuin itse elokuvien kuvat, 2 kärpästä yhdellä iskulla
		muutaKuvanOsoiteTauluunSopivaksi(show[i].getElementsByTagName("RatingImageUrl")[0].childNodes[0].nodeValue) +
		"<span class='tooltiptekstiTaiKuva'>" + show[i].getElementsByTagName("Rating")[0].childNodes[0].nodeValue + "</span></div></td><td>" +
		//tuolla xml:ssä elokuvien kesto näkyy vaan minuutteina niin muutan sen itse helpompi lukuisempaan tunnit + minuutit muotoon alla olevalla funktiolla
		muutaMinuutitTunneiksiJaMinuuteiksi(show[i].getElementsByTagName("LengthInMinutes")[0].childNodes[0].nodeValue) +
		"</td><td>" +
		//tässä pilkon elokuvien alkamisajasta päivämäärän pois ja erotten tunnit ja minuutit vielä erikseen
		//tää ylempi on tunnit
		show[i].getElementsByTagName("dttmShowStart")[0].childNodes[0].nodeValue.split("T")[1].split(":")[0] +
		" : " +
		//ja alempi minuutit. ja väliin tulee vielä " : " että näyttää hienolta tablessa
		show[i].getElementsByTagName("dttmShowStart")[0].childNodes[0].nodeValue.split("T")[1].split(":")[1]
		"</td></tr>";
	  }
	  //ja tässä lopulta laitetaan koko for loopissa luotu table tuonne html:ään
	  document.getElementById("naytostenTiedot").innerHTML = table;

}
//funktio joka muuttaa xml:stä saadun elokuvan keston minuuteista minuuteiksi ja tunneiksi
//esim 130min -> 2h 10min
//tämän funktion olisi varmasti voinut tehdä paljon lyhyempänäkin, mutta en ole hyvä matematiikassa,,
function muutaMinuutitTunneiksiJaMinuuteiksi(elokuvanKestoMinuutteina){
	//ensiksi tarkistetaan kestääkö elokuva alle tunnin, jos kestää alle tunnin niin alla olevia laskelmia ei tarvita vaan sen voi suoraan näyttää sellaisenaan
	if(elokuvanKestoMinuutteina < 60){
		return elokuvanKestoMinuutteina + " min";
	}
	//eli tässä katsotaan ensiksi montako kokonaista tuntia elokuva kestää, ilman minuutteja
	var tunnit = Math.floor(elokuvanKestoMinuutteina / 60);
	//sen jälkeen lasketaan vielä kuinka monta minuuttia
	var ylimaaraisetMinuutit = elokuvanKestoMinuutteina - (tunnit * 60);
	//palautetaan tableen ja 125min näkyy 2h 5min jne.
	return tunnit + "h " + ylimaaraisetMinuutit + " min";
}
//muutetaan kuvan urli muotoon <img ...> ja lähetetään tableen
function muutaKuvanOsoiteTauluunSopivaksi(kuvanOsoite){
	return "<img src='" + kuvanOsoite + "' alt='kuva'>";
}
//jos elokuvan nimi on Joker, näkyy se mun sivulla Juksuttajana
function tarkistaElokuvanNimi(elokuvanNimi){
	if(elokuvanNimi==="Joker")
		return "Juksuttaja";
	else 
		return elokuvanNimi;
}
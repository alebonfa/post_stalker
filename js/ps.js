$(document).ready(function(){

	navigator.geolocation.getAccurateCurrentPosition = function (geolocationSuccess, geolocationError, geoprogress, options) {
	    var lastCheckedPosition,
	        locationEventCount = 0,
	        watchID,
	        timerID;

	    options = options || {};

	    var checkLocation = function (position) {
	        lastCheckedPosition = position;
	        locationEventCount = locationEventCount + 1;
	        // We ignore the first event unless it's the only one received because some devices seem to send a cached
	        // location even when maxaimumAge is set to zero
	        if ((position.coords.accuracy <= options.desiredAccuracy) && (locationEventCount > 1)) {
	            clearTimeout(timerID);
	            navigator.geolocation.clearWatch(watchID);
	            foundPosition(position);
	        } else {
	            geoprogress(position);
	        }
	    };

	    var stopTrying = function () {
	        navigator.geolocation.clearWatch(watchID);
	        foundPosition(lastCheckedPosition);
	    };

	    var onError = function (error) {
	        clearTimeout(timerID);
	        navigator.geolocation.clearWatch(watchID);
	        geolocationError(error);
	    };

	    var foundPosition = function (position) {
	        geolocationSuccess(position);
	    };

	    if (!options.maxWait)            options.maxWait = 10000; // Default 10 seconds
	    if (!options.desiredAccuracy)    options.desiredAccuracy = 20; // Default 20 meters
	    if (!options.timeout)            options.timeout = options.maxWait; // Default to maxWait

	    options.maximumAge = 0; // Force current locations only
	    options.enableHighAccuracy = true; // Force high accuracy (otherwise, why are you using this function?)

	    watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
	    timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
	};


	if(navigator.userAgent.match(/Android/i)) {
	    window.scrollTo(0,1);
	}

	function initLoading() {
		$contentDiv = $(".contentArea");

		$(".overlay").css({
			top: $contentDiv.offset().top,
			width: $contentDiv.outerWidth(),
			height: $contentDiv.outerHeight()
		});

		$(".loading").css({
			// top: ($contentDiv.height() / 2),
			top: 100,
			left: ($contentDiv.width() / 2)
		});

		// hideLoading();
	}

	function showLoading() {
		$(".overlay").fadeIn();
	}

	function hideLoading() {
		$(".overlay").fadeOut();
	}

	var playerName, playerID;

	if(mbPage=="login") {
		if(Modernizr.localstorage) {
			mbDeviceID = localStorage.getItem('magicBanditID');
			if(mbDeviceID === undefined || mbDeviceID == null || mbDeviceID == "") {
				var myGuid = guid();
				localStorage.setItem('magicBanditID', myGuid);
				mbDeviceID = myGuid; 
			} else {
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "php/seekDevice.php",
					data: {myGuid: mbDeviceID},
					cache: false,
			        success: function(msg){
			            if (msg['status'] == "success") {
			                loginSignupSuccess(msg['playerName'], msg['playerID']);
			            }
			        }
				})
			}
		}

		$(document).on('click','#btnLogin', function(){

		    if($("#frmLogin")[0].checkValidity()) {
			    $.ajax({
			        type: "POST",
			        url: "php/authentication.php",
			        data: $("#frmLogin").serialize()+"&mbDeviceID="+mbDeviceID,
			        dataType: 'json',
			        success: function(msg){
			            if (msg['status'] == "success") {
			                loginSignupSuccess(msg['playerName'], msg['playerID']);
			            } else {
			                loginSignupError(msg['message']);
			            }
			        }
			    });
			} else {
			    $("#sbmLogin").trigger("click");
			}
		});

	}

    function loginSignupError(msg) {
        alert(msg);
    }

    function loginSignupSuccess(pName, pID) {
        if(Modernizr.sessionstorage) {
			sessionStorage.setItem('mbPlayerName', pName);
			sessionStorage.setItem('mbPlayerID', pID);
			playerName = pName;
			playerID = pID;

			$("#btnColect").trigger("click");
	        // window.location.href="closeAcorns.php";
		} else {
			alert('Seu Dispositivo não é compatível com este Jogo!');
	        window.location.href="index.php";
		}
    }

	if(mbPage !== "login") {
		headerData();
	}

	function headerData() {
		if(sessionStorage.getItem('mbPlayerID') == null) {
		    window.location.href="index.php";
		}

		$("#btnPlayerName").html('');
		lblPN  = '<span class="ui-btn-inner">';
		lblPN += '<span class="ui-btn-class">';
		lblPN += playerName;
		lblPN += '</span>';
		lblPN += '</span>';
		$("#btnPlayerName").html(lblPN);

		var $btnInner = $('<span/>', {class:"ui-btn-class"}),
			$btn      = $('<span/>', {class:"ui-btn-inner"});

			$btnInner.html(playerName).appendTo($btn);
			$(".btnPlayer").html($btn);
	}

	$(document).on('pagebeforeshow', '#pagRanking', function() {
		var fltDate  = 'semana';
		var fltLocal = 'geral';
		initLoading();

		getRanking(fltDate, fltLocal, playerID);

		$(document).on('click','#rnkDateWeek', function(){
			fltDate = 'semana';
			getRanking(fltDate, fltLocal);
		});
		$(document).on('click','#rnkDateAlways', function(){
			fltDate = 'sempre';
			getRanking(fltDate, fltLocal);
		});
		$(document).on('click','#rnkLocalAll', function(){
			fltLocal = 'geral';
			getRanking(fltDate, fltLocal);
		});
		$(document).on('click','#rnkLocalCity', function(){
			fltLocal = 'local';
			getRanking(fltDate, fltLocal);
		});
	})

	$(document).on('pageshow', '#pagRanking', function() {
		headerData();
	})

	function getRanking(fltDate, fltLocal, playerID) {
		playerID = sessionStorage.getItem('mbPlayerID');
		$("#btnPlayerName").append('ale');

		players = [];
		showLoading();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "php/makeRanking.php",
            data: {
            	fltDate: fltDate,
            	fltLocal: fltLocal,
            	playerID: playerID
            },
	        cache: false,
            success: function(data) {
            	$('#rankingList').empty();
                players = [];
                _.each( data, function(item, ix, list) {
                    players.push([item.id, 
                    	item.name,
                    	parseInt(item.points)]);
                });
                players.sort(function(a,b){
                	if(a[2]==b[2]) return 0;
                	return a[2] > b[2] ? -1 : 1;
                });
                if(players.length>0) {
	                for(var i=0; i<players.length; i++) {
	                	var playerClass = "ui-li ui-li-static ui-btn-up-c";
	                	if(players[i][0] == playerID) {
	                		playerClass += " myPoints ";
	                	}
	                	var newLine = '';
	                	newLine += '<li id="' + players[i][0] + '" class="' + playerClass + '">';
		                	newLine += '<div class="ui-grid-a">';
			                	newLine += '<div class="ui-block-a">' + (i+1) + '. ' + players[i][1] + '</div>';
			                	newLine += '<div class="ui-block-b">' + players[i][2] + '</div>';
				    		newLine += '</div>';
			    		newLine += '</li>';
	                    $('#rankingList').append(newLine);
	                }
	            	$('html, body').animate({
		    			scrollTop: $('#'+playerID).offset().top-300
					}, 100);
                }
            }
        });
		hideLoading();
	}

	// $("#admNewPlayers").on('click', function() {
	$(document).on('pagebeforeshow', '#pagAdmNewPlayers', function() {
		initLoading();
		getNewPlayers("dia");

		$(document).on('click','#adm01Day', function(){
			getNewPlayers('dia');
		});
		$(document).on('click','#adm01Week', function(){
			getNewPlayers('semana');
		});
		$(document).on('click','#adm01Always', function(){
			getNewPlayers('sempre');
		});
	})

	function getNewPlayers(model) {
		players = [];
		showLoading();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "php/makeNewPlayers.php",
			data: {model: model},
	        cache: false,
            success: function(data) {
                players = [];
                _.each( data, function(item, ix, list) {
                    players.push([item.city, 
                    	parseInt(item.qty_players)]);
                });
                players.sort(function(a,b){
                	if(a[1]==b[1]) return 0;
                	return a[1] > b[1] ? -1 : 1;
                });
      			$('.admList').empty();
                if(players.length>0) {
	                for(var i=0; i<players.length; i++) {
	                	var playerClass = "ui-li ui-li-static ui-btn-up-c";
	                	var newLine = '';
	                	newLine += '<li id="' + players[i][0] + '" class="' + playerClass + '">';
		                	newLine += '<div class="ui-grid-a">';
			                	newLine += '<div class="ui-block-a">' + (i+1) + '. ' + players[i][0] + '</div>';
			                	newLine += '<div class="ui-block-b">' + players[i][1] + '</div>';
				    		newLine += '</div>';
			    		newLine += '</li>';
	                    $('.admList').append(newLine);
	                }
                }
            }
        });
		hideLoading();
	}

	// if(mbPage=="adm02") {
	$(document).on('pagebeforeshow', '#pagAdmNewColects', function() {
		initLoading();
		getNewColects("dia");

		$(document).on('click','#adm02Day', function(){
			getNewColects('dia');
		});
		$(document).on('click','#adm02Week', function(){
			getNewColects('semana');
		});
		$(document).on('click','#adm02Always', function(){
			getNewColects('sempre');
		});
	})

	function getNewColects(model) {
		players = [];
		showLoading();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "php/makeNewColects.php",
			data: {model: model},
	        cache: false,
            success: function(data) {
                players = [];
                _.each( data, function(item, ix, list) {
                    players.push([item.city.toUpperCase(), 
                    	parseInt(item.qty_players)]);
                });
                players.sort(function(a,b){
                	if(a[1]==b[1]) return 0;
                	return a[1] > b[1] ? -1 : 1;
                });
      			$('.admList').empty();
                if(players.length>0) {
	                for(var i=0; i<players.length; i++) {
	                	var playerClass = "ui-li ui-li-static ui-btn-up-c";
	                	var newLine = '';
	                	newLine += '<li id="' + players[i][0] + '" class="' + playerClass + '">';
		                	newLine += '<div class="ui-grid-a">';
			                	newLine += '<div class="ui-block-a">' + (i+1) + '. ' + players[i][0] + '</div>';
			                	newLine += '<div class="ui-block-b">' + players[i][1] + '</div>';
				    		newLine += '</div>';
			    		newLine += '</li>';
	                    $('.admList').append(newLine);
	                }
                }
            }
        });
		hideLoading();
	}

	// if(mbPage=="adm03") {
	$(document).on('pagebeforeshow', '#pagAdmColPlaces', function() {
		initLoading();
		getColPlaces("dia");

		$(document).on('click','#adm03Day', function(){
			getColPlaces('dia');
		});
		$(document).on('click','#adm03Week', function(){
			getColPlaces('semana');
		});
		$(document).on('click','#adm03Always', function(){
			getColPlaces('sempre');
		});
	})

	function getColPlaces(model) {
		players = [];
		showLoading();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "php/makeColPlaces.php",
			data: {model: model},
	        cache: false,
            success: function(data) {
                players = [];
                _.each( data, function(item, ix, list) {
                    players.push([item.name.toUpperCase(), 
                    	parseInt(item.qty_players)]);
                });
                players.sort(function(a,b){
                	if(a[1]==b[1]) return 0;
                	return a[1] > b[1] ? -1 : 1;
                });
      			$('.admList').empty();
                if(players.length>0) {
	                for(var i=0; i<players.length; i++) {
	                	var playerClass = "ui-li ui-li-static ui-btn-up-c";
	                	var newLine = '';
	                	newLine += '<li id="' + players[i][0] + '" class="' + playerClass + '">';
		                	newLine += '<div class="ui-grid-a">';
			                	newLine += '<div class="ui-block-a">' + (i+1) + '. ' + players[i][0] + '</div>';
			                	newLine += '<div class="ui-block-b">' + players[i][1] + '</div>';
				    		newLine += '</div>';
			    		newLine += '</li>';
	                    $('.admList').append(newLine);
	                }
                }
            }
        });
		hideLoading();
	}

	// if(mbPage=="colect") {
	$(document).on('pagebeforeshow', '#pagColect', function() {
		var x = document.getElementById("placeList");
	    var places = new Array();
		var la, lo;
		getLocation();
	})

	$(document).on('pageshow', '#pagColect', function() {
		$('#btnRefresh').click(function(){
			getLocation(); return false;
		});
		headerData();
		initLoading();
	})

	function getLocation() {
		if (navigator.geolocation) {
			$("#spnShowAccuracy").html('High');
			navigator.geolocation.getAccurateCurrentPosition(
				showPosition,
				errorCallback_highAccuracy,
				progressAccuracy,
				{desiredAccuracy:100, maxWait:20000}
			);
			/*
			navigator.geolocation.getCurrentPosition(
				showPosition,
				errorCallback_highAccuracy,
				{maximumAge:0, timeout:5000, enableHighAccuracy: true}
			);
			*/
		} else {
			alert("Seu browser é muito Loser!!!");
		}
	}

	function errorCallback_highAccuracy(error) {
	    if (error.code == error.TIMEOUT)
	    {
			$("#spnShowAccuracy").empty();
			$("#spnShowAccuracy").html('Low');
	        navigator.geolocation.getCurrentPosition(
	               showPosition, 
	               errorCallback_lowAccuracy,
	               {maximumAge:0, timeout:20000, enableHighAccuracy: false});
	        return;
	    }
	}

	function progressAccuracy(position) {
		ac = Math.round(position.coords.accuracy);
		console.log(ac);
		$("#spnAccuracy").empty();
		$("#spnAccuracy").html(ac + '...');
	}

	function errorCallback_lowAccuracy(error) {
		$("#spnShowAccuracy").empty();
	    if (error.code == 1)
			$("#spnShowAccuracy").html('PERMISSION_DENIED');
	    else if (error.code == 2)
			$("#spnShowAccuracy").html('POSITION_UNAVAILABLE');
	    else if (error.code == 3)
			$("#spnShowAccuracy").html('TIMEOUT');
	}

	function loadRoute() {
		var medievalStyle = [
		  {
		    "elementType": "geometry.stroke",
		    "stylers": [
		      { "invert_lightness": true },
		      { "color": "#a78080" },
		      { "weight": 0.1 },
		      { "visibility": "on" }
		    ]
		  },{
		    "elementType": "geometry.fill",
		    "stylers": [
		      { "visibility": "off" }
		    ]
		  }
		];

		var styledMap = new google.maps.StyledMapType(medievalStyle, {
			name: "Styled Map"
		});

		var placeID = $(this).attr('id');
		var mapSpace = 'map' + placeID;
		if($('#'+mapSpace).attr('class') == 'mapsRoute') {
			$('#'+mapSpace).removeClass('mapsRoute');	
		} else {
			$('#'+mapSpace).addClass('mapsRoute');
			var laF = la;
			var loF = lo;
	        for(var i=0; i<places.length; i++) {
	        	if(places[i][0] === placeID) {
	        		laT = places[i][2];
	        		loT = places[i][3];
	        	}
	        }

	      	var map; 
	      	var sp2 = new google.maps.LatLng(laF, loF);
	      	var sp3 = new google.maps.LatLng(laT, loT);
	      	var directionDisplay;
	      	var directionsService = new google.maps.DirectionsService();

	    	directionsDisplay = new google.maps.DirectionsRenderer();
	    	var myOptions = { 
	      		zoom: 15, 
	      		center: sp2, 
	      		mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
	    	}; 

	    	map = new google.maps.Map(document.getElementById(mapSpace), myOptions); 
	    	map.mapTypes.set('map_style', styledMap);
	    	map.setMapTypeId('map_style');
	    	directionsDisplay.setMap(map);

	    	var request = {
	      		origin: sp2, 
	     		destination: sp3,
	      		travelMode: google.maps.DirectionsTravelMode.WALKING
	    	};

	    	directionsService.route(request, function(response, status) {
	      		if (status == google.maps.DirectionsStatus.OK) {
	        		directionsDisplay.setDirections(response);
	      		} else {
	        		alert(status);
	      		}
	    	});
	    	$('html, body').animate({
			    scrollTop: $('#'+placeID).offset().top-45
			}, 100);
		}

	}

	function showPrizes() {
		var placeID = $(this).attr('id');
		var mapSpace = 'map' + placeID;
		if($('#'+mapSpace).attr('class') == 'mapsRoute') {
			$('#'+mapSpace).removeClass('mapsRoute');	
			$('#'+mapSpace).empty();
			this.removeEventListener("click", showPrizes, false) ;
        	this.addEventListener("mouseup", msgBlockTime, false) ;
		} else {
			// $('#'+mapSpace).addClass('mapsRoute');
			showLoading();
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "php/getTreasures.php",
				data: {
					playerID: playerID, 
					placeID: placeID, 
					lat: la,
					lng: lo
				},
				cache: false,
				success: function(data) {
					var allTreaures = "";
					_.each( data, function(item, ix, list) {
						allTreasures = item.treasures;
					})

					var prizeList  = '<div>';
					prizeList += '<h2 class="prizeText">Coleta</h2>';
					prizeList += '<br>';
					prizeList += '<span class="prizeIcon"><img id="icnEndColect" src="images/mico.jpg" width="40" height="40"></span>';
					for (var i = 0; i < allTreasures.substr(0,1); i++) {
						prizeList += '<span class="prizeIcon"><img src="images/acorn01.png" width="40" height="40"></span>';
					}
					if(parseInt(allTreasures.substr(4,1))>0) {
						prizeList += '<span class="prizeIcon"><img src="images/acorn02.png" width="40" height="40"></span>';
					}
					if(parseInt(allTreasures.substr(9,1))>0) {
						prizeList += '<span class="prizeIcon"><img src="images/artefact01.png" width="40" height="40"></span>';
					}
					if(parseInt(allTreasures.substr(14,1))>0) {
						prizeList += '<span class="prizeIcon"><img src="images/artefact02.png" width="40" height="40"></span>';
					}
					if(parseInt(allTreasures.substr(19,1))>0) {
						prizeList += '<span class="prizeIcon"><img src="images/artefact03.png" width="40" height="40"></span>';
					}
					if(parseInt(allTreasures.substr(24,1))>0) {
						prizeList += '<span class="prizeIcon"><img src="images/artefact04.png" width="40" height="40"></span>';
					}
					prizeList += '</div>';

					$('#treasures').empty();
					$('#treasures').append(prizeList);
					var $dialog = $("#actColect");
					if (!$dialog.hasClass('ui-dialog')) {
						$dialog.page();
					}

					var sndActiveColect = document.getElementById("sndActiveColect");

					$(".prizeIcon").click(function() {
						$(this).animate({"opacity":0});
						sndActiveColect.play();
					});
					hideLoading();

					$dialog.fadeIn();

					$(document).on('click',"#icnEndColect", function() {
						$dialog.fadeOut();
					});

					// $('#'+mapSpace).append(prizeList);
					var nextColect = new Date();
					nextColect.setDate(nextColect.getDate()+1);
                	$('#count'+placeID).countdown({until: nextColect, compact:true, format: 'HMS'});
                	$('#'+placeID).addClass('blockTime');
					$('#'+placeID).removeClass('getPrizes');
					// $('#colectScreen').removeClass('getPrizes');

				}
			})
		}
    	// $(window).scrollTop($('#'+placeID).position().top);
    	/*
    	$('html, body').animate({
		    scrollTop: $('#'+placeID).offset().top-45
		}, 100);
		*/
	}

	function showPosition(position) {
		la = position.coords.latitude;
		lo = position.coords.longitude;
		ac = Math.round(position.coords.accuracy);
		$("#spnAccuracy").html(ac);

		places = [];

		showLoading();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "php/closePlaces.php",
            data: {playerID: playerID, la: la, lo: lo},
	        cache: false,
            success: function(data) {
                places = [];
                _.each( data, function(item, ix, list) {
                    places.push([item.id, 
                    	item.name, 
                    	item.lat, 
                    	item.lng, 
                    	Math.round(distanceTwoPoints(la, lo, item.lat, item.lng),2),
                    	item.treasures,
                    	item.lastColect]);
                });
                places.sort(function(a,b){
                	if(a[4]==b[4]) return 0;
                	return a[4] < b[4] ? -1 : 1;
                });
                if(places.length>0) {
                	$('#placeList').empty();
	                for(var i=0; i<places.length; i++) {
	                	var qtyTreasures = parseInt(places[i][5].substr(0,1));
	                	qtyTreasures += parseInt(places[i][5].substr(4,1));
	                	qtyTreasures += parseInt(places[i][5].substr(9,1));
	                	qtyTreasures += parseInt(places[i][5].substr(14,1));
	                	qtyTreasures += parseInt(places[i][5].substr(19,1));
	                	qtyTreasures += parseInt(places[i][5].substr(24,1));
	                	var placeClass = "ui-li ui-li-static ui-btn-up-c ui-li-has-thumb ui-first-child ui-last-child closePlaceList ";
	                	if(places[i][4]<=30) {
	                		placeClass += " getPrizes ";
	                	}
	                	var newLine = '';
	                	newLine += '<li id="' + places[i][0] + '" class="' + placeClass + '">';
			    		newLine += '<img src="images/bau'+ qtyTreasures +'.png"  class="ui-li-thumb">';
			    		newLine += '<h2 class="ui-li-heading">' + places[i][1] + '</h2>';
			    		newLine += '<em>' + places[i][4] + ' metros</em>';
	                	newLine += '<span id="count' + places[i][0] + '" class="unblockTime"></span>';
			    		newLine += '</li>';
			    		newLine += '<li><div id="map' + places[i][0] + '"></div></li>';
	                    $('#placeList').append(newLine);
	                    if(places[i][6] !== null) {
							var t = places[i][6].split(/[- :]/);
							var nextColect = new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
							nextColect.setDate(nextColect.getDate()+1);
	                    	hoje = new Date();
	                    	if(hoje < nextColect) {
		                    	$('#count'+places[i][0]).countdown({until: nextColect, compact:true, format: 'HMS'});
		                    	$('#'+places[i][0]).addClass('blockTime');
		                    	$('#'+places[i][0]).removeClass('getPrizes');
	                    	}
	                    }
	                    if(i>=25){break;}
	                }
	                var allPlaces = document.getElementsByClassName('closePlaceList');
	                for(var i=0; i<allPlaces.length;i++) {
	                	if($(allPlaces[i]).hasClass('getPrizes')) {
		                	allPlaces[i].addEventListener("click", showPrizes, false) ;
	                	} else {
	                		if($(allPlaces[i]).hasClass('blockTime')) {
		                		allPlaces[i].addEventListener("click", msgBlockTime, false) ;
		                	} else {
		                		allPlaces[i].addEventListener("click", loadRoute, false) ;
		                	}
	                	}
	                }
                }
                hideLoading();
            }
        })
	}

	function msgBlockTime() {
		alert('Fora do Prazo!');
	}

	function distanceTwoPoints(LaF, LoF, LaT, LoT) {
        var earthRadius = 6372.795477598;
        var latFrom = LaF * Math.PI / 180;
        var lonFrom = LoF * Math.PI / 180;
        var latTo = LaT * Math.PI / 180;
        var lonTo = LoT * Math.PI / 180;
  
        var lonDelta = lonTo - lonFrom;
        var a = Math.pow(Math.cos(latTo) * Math.sin(lonDelta), 2) + Math.pow(Math.cos(latFrom) * Math.sin(latTo) - Math.sin(latFrom) * Math.cos(latTo) * Math.cos(lonDelta), 2);
        var b = Math.sin(latFrom) * Math.sin(latTo) + Math.cos(latFrom) * Math.cos(latTo) * Math.cos(lonDelta);
        var angle = Math.atan2(Math.sqrt(a), b);

        return angle *  earthRadius * 1000;
	}


	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000)
	             .toString(16)
	             .substring(1);
	};

	function guid() {
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	         s4() + '-' + s4() + s4() + s4();
	}

})

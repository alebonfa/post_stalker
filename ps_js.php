<html>

  <head>
	<title>Teste de Likes</title>
	<link rel="stylesheet" type="text/css" href="css/ps.css?<?php echo filemtime('css/ps.css');?>">
	<script src="js/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="js/facebook.js"></script>
  </head>

  <body>

	<h1>Lista de Amigos</h1>
  	<div id="friendsList"></div>
	<div id="fb-root"></div>
	<script>
		/*
		 * Carregamento assíncrono do arquivo js com a api do FB
		 * (note o uso de 'pt_BR' na URL, para janelas de login/permissão localizadas).
		 */
		(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); 
			js.id = id;
			js.src = "//connect.facebook.net/pt_BR/all.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));

		/** Armazena o token de acesso */
		var gsAccessToken = "";

		/**
		 * Função de inicialização e login no Facebook.
		 * NOTA: Essa função é apenas necessária para acesso a recursos com privacidade controlada
		 * (que requer o uso do token de acesso).
		 * Para ESTE teste (com o post do Porta dos Fundos), essa função pode ser simplesmente
		 * comentada (ou removida) que a consulta funciona da mesma forma.
		 */
		window.fbAsyncInit = function() {

			// Inicio da biblioteca do FB (com definição do ID da página Web)
			FB.init({
				appId      : '390907424378928', // ID da página Web criada no App Center
				status     : true,
				xfbml      : true
			});

			// Requisição ao usuário do login no FB
			FB.login(function(oResponse) {
				if(oResponse.authResponse) {
					gsAccessToken = FB.getAuthResponse()['accessToken'];
					console.log('Token de acesso = '+ gsAccessToken);
					FB.api('/me', function(oResponse) {
					  console.log('Bem-vindo, ' + oResponse.name + '!');
					  console.dir(oResponse);
					});

					FB.api('/me/friends?limit=10', function(fResponse) {
					  console.dir(fResponse);
					  var divFriendsList = document.getElementById('friendsList');
					  var friend_data = fResponse.data.sort(sortMethod);
					  var newLine = '';
					  for(var i = 0; i < friend_data.length; i++) {
					  	newLine += '<div class="allFriends">';
					  	newLine += '<div class="singleFriend">';
					  	newLine += '<img class="friendImg" src="https://graph.facebook.com/' + friend_data[i].id + '/picture">';
					  	newLine += '<p>' + friend_data[i].name + '</p>';
						newLine += '</div>';
					  	newLine += '<div id="friend' + friend_data[i].id + '" class="friendPosts"></div>';
						newLine += '</div>';
						divFriendsList.innerHTML = newLine;

					  	FB.api(
						  	{
						  		method: 'fql.query',
						  		locale: 'pt_BR',
						  		query: 'SELECT post_id, source_id, message, created_time, type, description, permalink FROM stream WHERE source_id = ' + friend_data[i].id + ' LIMIT 50'
						  	},
						  	function(posts){
						  		if(posts.length>0){
						  			var divFriendsPost = document.getElementById('friend' + posts[0].source_id);
						  			var friendPosts = '';
							  		for(var j=0; j < posts.length ; j++) {

										var d = new Date(0);
										d.setUTCSeconds(posts[j].created_time);
										dateFormat = [d.getDate(), (d.getMonth()+1), d.getFullYear()].join('/');
										timeFormat = [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');

									  	if(posts[j].permalink != null && posts[j].permalink != '') {
									  		friendPosts += '<a href="' + posts[j].permalink + '" target="_blank">';
									  	}
										  	friendPosts += '<div class="singlePost">';
											  	friendPosts += '<div class="spLeft">';
												  	friendPosts += '<p>' + dateFormat + '</p>';
												  	friendPosts += '<p>' + timeFormat + '</p>';
											  	friendPosts += '</div>';
											  	friendPosts += '<div class="spRight">';
												  	friendPosts += '<p>' + posts[j].description +'</p>';
												  	friendPosts += '<p>' + posts[j].message  + '(' + posts[j].type + ')</p>';
												  	var fburl = 'https://graph.facebook.com/' + posts[j].post_id + '?access_token=' + gsAccessToken;
												  	$.get(fburl, function(data){
												  		console.log(data);
												  	},'jsonp');
											  	friendPosts += '</div>';
										  	friendPosts += '</div>';
									  	if(posts[j].permalink != null && posts[j].permalink != '') {
									  		if(j == 1) {
									  			friendPosts += '<div class="fb-post" data-href="' + posts[j].permalink + '">'
									  			friendPosts += '</div>';	
									  		}
										  	friendPosts += '</a>';
										}
							  		}
							  		var newNode = document.createElement('div');
							  		newNode.innerHTML = friendPosts;
									divFriendsPost.appendChild(newNode);
						  		}
						  	}
						);
					  }
					});

				}
				else
					console.log('O usuário cancelou o login ou não autorizou completamente.');
			}, {scope: 'read_stream, publish_actions, read_friendlists, user_photos'});
		};
		// FIM DA FUNÇÃO DE INICIALIZAÇÃO E LOGIN (que pode ser comentada se desejado)

	</script>

	<div class="fb-post" data-href="https://www.facebook.com/michaellincolnfranca/posts/656812811046153"></div>

  </body>
</html>


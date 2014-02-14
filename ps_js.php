<html>

  <head>
	<title>Teste de Likes</title>
	<link rel="stylesheet" type="text/css" href="css/jquery-ui.min.css">
	<link rel="stylesheet" type="text/css" href="css/ps.css?<?php echo filemtime('css/ps.css');?>">
	<script src="js/jquery-1.10.2.min.js"></script>
	<script src="js/jquery-ui.min.js"></script>
	<script type="text/javascript" src="js/facebook.js?<?php echo filemtime('js/facebook.js');?>"></script>
  </head>

	<h1>Lista de Amigos</h1>

	<input type="button" id="btnAccordion" value="Accordion This">

  	<div id="friendsList"></div>

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

	</script>

	<!--
	<div class="fb-post" data-href="https://www.facebook.com/michaellincolnfranca/posts/656812811046153"></div>
	-->

	<script>

		/** Armazena o token de acesso */
		var gsAccessToken = "";
		var tryLink = [];

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
			
			get_custom_feed();

		};

		window.setTimeout(function() {
	        $('#friendsList').accordion('destroy').accordion();	
		}, 10000);

		$(document).ready(function(){
			$("#friendsList").accordion({
				collapsible:true
			});
			$("#btnAccordion").click(function(){
				$("#friendsList").accordion('destroy').accordion();	
			})
			// $("#friendsList").accordion("refresh");
		});

		/*
		var tryPost = $('<div class="fb-post" data-href="https://www.facebook.com/tablelessbr/posts/10151837493556920"></div>');
		$("#myDiv2").append(tryPost);

		$(document).ready(function(){

			var tryPost = $('<div class="fb-post" data-href="https://www.facebook.com/alexandre.bonfa/posts/615714938481998"></div>');
			$("#myDiv3").append(tryPost);

			var i = 0;
			var intervalo = window.setInterval(function() {
				i++;
				console.log("CHOBA RAIN " + i);
				console.log(tryLink);
			}, 10000);

			window.setTimeout(function() {
				clearInterval(intervalo);
				console.log("CHOBA STORM " + tryLink[0]);
				var tryPost = $('<div class="fb-post" data-href="' + tryLink[2] + '"></div>');
				$("#firstPosts").append(tryPost);
				FB.XFBML.parse(document.getElementById('firstPosts'));
			}, 10000);


		});
		*/
	</script>

  </body>
</html>


<html>

  <head>
	<title>Embedded Post</title>
	<meta charset="UTF-8">
	<script src="js/jquery-1.10.2.min.js"></script>

  </head>

  <body>

	<h1>Exemplo de Incorporação de Post</h1>
	<div id="myDiv"></div>

	<div id="fb-root"></div>
	<script>(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/pt_BR/all.js#xfbml=1&appId=390907424378928";
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));</script>
	<div class="fb-post" data-href="https://www.facebook.com/DrPepperBlog/posts/631344796913735?stream_ref=1" data-width="400"></div>

  </body>

</html>


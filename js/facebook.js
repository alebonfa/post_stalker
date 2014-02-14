function get_custom_feed() {

    var feed_posts = [];

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
                newLine += '<h3>' + friend_data[i].name +'</h3>';
                newLine += '<div class="allFriends">';
                newLine += '<div class="singleFriend">';
                newLine += '<img class="friendImg" src="https://graph.facebook.com/' + friend_data[i].id + '/picture">';
                newLine += '<p>' + friend_data[i].name + '</p>';
                newLine += '</div>';
                newLine += '<div id="friend' + friend_data[i].id + '" class="friendPosts"></div>';
                newLine += '</div>';
                divFriendsList.innerHTML = newLine;
                handle_posts_by_source(friend_data[i].id);
              }
            });
        }
        else
            console.log('O usuário cancelou o login ou não autorizou completamente.');
    }, {scope: 'read_stream, read_insights, publish_actions, publish_stream, read_friendlists, user_photos'});

    return feed_posts;

}


function handle_posts_by_source(friend_id) {
    FB.api(
        {
            method: 'fql.query',
            locale: 'pt_BR',
            query: 'SELECT post_id, source_id, message, created_time, attachment, privacy, likes, type, description, permalink FROM stream WHERE source_id = ' + friend_id + ' LIMIT 5'
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

                    console.log('choba permalink ' + posts[j].permalink);
                    console.log('choba attachment blah');
                    console.dir(posts[j].attachment);

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
                            friendPosts += '</div>';
                        friendPosts += '</div>';
                    if(posts[j].permalink != null && posts[j].permalink != '') {
                        tryLink.push(posts[j].permalink);
                        friendPosts += '</a>';
                    }

                    if(posts[j].attachment.media != undefined) {
                        console.log('choba works');
                        friendPosts += '<div class="fbPost">';
                            if(posts[j].attachment.media[0].src != undefined) {
                                friendPosts += '<div class="fbImage"><img src="' + posts[j].attachment.media[0].src + '"></div>';
                            }
                            friendPosts += '<div class="fbName">' + posts[j].attachment.name + '</div>';
                            friendPosts += '<div class="fbCaption">' + posts[j].attachment.caption + '</div>';
                            friendPosts += '<div class="fbDescription">' + posts[j].attachment.description + '</div>';
                        friendPosts += '</div>';
                    } else {
                        console.log('choba fails');
                    }

                }
                var newNode = document.createElement('div');
                newNode.innerHTML = friendPosts;
                divFriendsPost.appendChild(newNode);
            }
        }
    );
}

function sortMethod(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

/**
 * Função de consulta dos Likes de um recurso (páginas, fotos, vídeos, etc) do Facebook.
 * @param sResourceID Identificador do Facebook para o recurso. O identificador é facilmente
 * obtido a partir de uma consulta com o link do recurso na ferramenta Graph API Explorer do Facebook.
 * @param oCallback Função de callback com a assinatura function(iLikes) a ser chamada com o resultado
 * da consulta.
 */

function queryLikes(sResourceID, oCallback) {

    var oCounter = { likes: 0 };

    // Consulta o número de likes do recurso
    FB.api("/" + sResourceID + "/likes?limit=5000",
        function(oResponse) {
            outputLikers(oResponse.data);
            queryResponse(oCounter, oResponse.data.length, oResponse.paging.next, oCallback);
        }
    );
}

/**
 * Função recursiva para contagem acumulada dos likes em múltiplas páginas.
 * @param oCounter Objeto para manter a contagem dos likes entre as chamadas.
 * @param iLikes Número de likes da atualização da paginação atual recebida do Facebook.
 * @param sNext String com o link para a próxima paginação ou null se não existir mais paginações.
 * @param oCallback Função de callback com a assinatura function(iLikes) a ser chamada com o resultado
 * da consulta.
 */
function queryResponse(oCounter, iLikes, sNext, oCallback) {
    oCounter.likes += iLikes;

    if(sNext != null) {
        FB.api(sNext,
            function(oResponse) {
                outputLikers(oResponse.data);
                queryResponse(oCounter, oResponse.data.length, oResponse.paging.next, oCallback);
            }
        );
    }
    else
        oCallback(oCounter.likes);
}

/**
 * Função utilitária para 'imprimir' no console os nomes (e IDs) dos usuários que curtiram
 * o recurso.
 * @param aData Array com os objetos de usuários que curtiram o recurso, conforme retornado pela
 * query ao FB.
 */
function outputLikers(aData) {
    for(var i = 0; i < aData.length; ++i) {
        var oUser = aData[i];
        console.log(oUser.name + "(" + oUser.id + ")");
    }
}


// Código para resgatar todos os detalhes de um post do Facebook via jsonP
//var fburl = 'https://graph.facebook.com/' + posts[j].post_id + '?access_token=' + gsAccessToken;
// $.get(fburl, function(data){
    // console.log(data);
// },'jsonp');

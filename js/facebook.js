/**
 * Função de consulta dos Likes de um recurso (páginas, fotos, vídeos, etc) do Facebook.
 * @param sResourceID Identificador do Facebook para o recurso. O identificador é facilmente
 * obtido a partir de uma consulta com o link do recurso na ferramenta Graph API Explorer do Facebook.
 * @param oCallback Função de callback com a assinatura function(iLikes) a ser chamada com o resultado
 * da consulta.
 */

function sortMethod(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

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
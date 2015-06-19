$(document).ready(function(){
//Menu de navigation
$("#menuTrig").click(function(){
	$(".menu").toggleClass("menu-ouvert");
	if ( $("#fermOverlay").css('display') == 'none' ){
	$("#fermOverlay").show();}
	else {$("#fermOverlay").hide();};
});
$("#fermOverlay").click(function(){
	$("#menuTrig").trigger("click");
	$("#fermOverlay").hide();
});		
//Onglets Jquery gestion de compte
$(function() {
$( "#tabs" ).tabs();
});
//Trigger pour partie handicap, Code pour maquette uniquement
$("#triggerHandicap").click(function(){
	$("#containerHandicap").toggle(300);
});
//Triggers pour champ modif mot de passe
$("#modifMdp").click(function(){
	$("#containerMdp").toggle(500);
	$(this).parent("div").toggle(500);
});
$("#validMdp").click(function(){
	$("#modifMdp").parent("div").toggle(500);
	$("#containerMdp").toggle(500);
});
//ajouter le style error à un onglet
$("#educError").addClass( "error" );
//Champs de upload de documents, style et harmonisation navigateurs
$('input[type="file"]').bind('change',function(){         
	$(this).parent("div.uploadMasque").children("span").html($('input[type="file"]').val()).addClass("validUpload");
	$(".ui-state-active").removeClass("error"); //retrait du style error de l'onglet actuel
	$(this).parents("fieldset").children(".errorFC").hide(1000); //retrait du message erreur du fieldset actuel
});



//  ##################### CODE POUR INSCRIPTION MULTI STEP #######################


var current_fs, next_fs, previous_fs;
var left, opacity, scale;
var animating;
$('.next').click(function () {
    if (animating)
        return false;
    animating = true;
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    $('#progressbar li').eq($('fieldset').index(next_fs)).addClass('active');
    next_fs.show();
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            scale = 1 - (1 - now) * 0.1; //multiplicateur pr l'effet de scale en transition
            left = now * 50 + '%';
            opacity = 1 - now;
            current_fs.css({ 'transform': 'scale(' + scale + ')' });
            next_fs.css({
                'left': left,
                'opacity': opacity
            });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        easing: 'easeInOutBack'
    });
});
$('.previous').click(function () {
    if (animating)
        return false;
    animating = true;
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();
    $('#progressbar li').eq($('fieldset').index(current_fs)).removeClass('active');
    previous_fs.show();
    current_fs.animate({ opacity: 0 }, {
        step: function (now, mx) {
            scale = 0.8 + (1 - now) * 0.1;//multiplicateur pr l'effet de scale en transition
            left = (1 - now) * 50 + '%';
            opacity = 1 - now;
            current_fs.css({ 'left': left });
            previous_fs.css({
                'transform': 'scale(' + scale + ')',
                'opacity': opacity
            });
        },
        duration: 800,
        complete: function () {
            current_fs.hide();
            animating = false;
        },
        easing: 'easeInOutBack'
    });
});

});
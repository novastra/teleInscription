/**
 * Affichage des champs en fonction du choix du diplome effectué.
 */
function changeChoixDiplome() {
	
	if ($('#choixDiplome').val() == "aucunDipl") {
		$('.blocDerogation').show();
		$('.blocDiplome').hide();
		$('#enCoursObtention .checkbox').attr("checked", false);
		$('#anneeObtention').disabled = false;
		$('#paysObtention').disabled = false;
	}
	else if ($('#choixDiplome').val() == "autreDipl") {
		$('.blocDiplome').show();
		$('.obtentionBox').show();
		$('.autreDiplome').show();
		$('.blocDerogation').hide();
		$('.blocDerogation .checkbox').attr("checked", false);
	}
	else if ($('#choixDiplome').val() != "-999999") {
		$('.blocDiplome').show();
		$('.obtentionBox').show();
		$('.blocDerogation').hide();
		$('.autreDiplome').hide();
		$('.blocDerogation .checkbox').attr("checked", false);
	}
	else {
		$('.blocDiplome').hide();
		$('.blocDerogation').hide();
		$('.autreDiplome').hide();
		$('#enCoursObtention .checkbox').attr("checked", false);
		$('.blocDerogation .checkbox').attr("checked", false);
	}
	
	if ($('#enCoursObtention input[type="checkbox"]').is(':checked')) {
		$('.obtentionBox').hide();
	}
}

/**
 * Traitement à réaliser lorsque l'utilisateur selectionne la case "en cours d'obtention"
 * (affiche/masque les options d'un diplome en fonction de l'état de la checkbox).
 */
function changeEnCoursObtention() {
	if ($('#enCoursObtention input[type="checkbox"]').is(':checked')) {
		$('.obtentionBox').hide();
	}
	else {
		$('.obtentionBox').show();
	}
}

/**
 * Evénement associé à la fin du chargement de la page.
 * Permet notamment d'associer les traitements aux événements.
 */
$(document).ready(function () {
	
	// Affichage des champs en fonction du choix du diplome effectué
	// au chargement de la page.
	changeChoixDiplome();
	
	// Affichage des champs en fonction du choix du diplome effectué
	$('#choixDiplome').change(function() {
		changeChoixDiplome();
	});
	
	// Traitement à réaliser lorsque l'utilisateur selectionne la case "en cours d'obtention"
	// (affiche/masque les options d'un diplome en fonction de l'état de la checkbox).
	$('#enCoursObtention input[type="checkbox"]').click(function() {
		changeEnCoursObtention();
	});

});
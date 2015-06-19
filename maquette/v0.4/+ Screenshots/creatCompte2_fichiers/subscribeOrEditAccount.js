/**
 * cache le champs de saisie du numéro de téléphone si le pays choisi n'est pas la FRance
 */
function activedesactiveTelephone()
{
	if (document.getElementById('paysHabitation').value.toUpperCase() != "FRANCE") 
	{
		//document.getElementById('telephoneHabitation').disabled=true;
		document.getElementById('divtelephoneHabitation').style.display = 'none';
		document.getElementById('inputtelephoneHabitation').value = '';
		//$("label[for=telephoneHabitation]").hide();
	}
	else
	{
		//document.getElementById('telephoneHabitation').disabled=false;
		document.getElementById('divtelephoneHabitation').style.display = 'block';
		//document.getElementById('telephoneHabitation').innerHTML="*";
		//$("label[for=telephoneHabitation]").show();
	}
}

/**
 * Evénement associé à la fin du chargement de la page.
 */
$(document).ready(function () {
	
	// Affichage (ou pas) du champ de saisie du téléphone au chargement de la page.
	activedesactiveTelephone();
});
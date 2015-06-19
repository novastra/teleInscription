
function changeTypeNationalite() {
	var radioButton = document.getElementsByName('compteCandidatDTO.anation');
	// Index selon position d'affichage
	var nationaliteFrancaise = radioButton[0].checked;
	var nationaliteEuropeen = radioButton[1].checked;
	var nationaliteAutre = radioButton[2].checked;
	
	var blockSelectNationaliteEuropeen = document.getElementById('blockSelectNationaliteEuropeen');
	var blockCheckboxNationaliteAutre = document.getElementById('blockCheckboxNationaliteAutre');
	var blockInformationNationaliteAutre = document.getElementById('blockInformationNationaliteAutre');
	
	if (nationaliteFrancaise)
	{
		blockSelectNationaliteEuropeen.style.display = 'none';
		blockCheckboxNationaliteAutre.style.display = 'none';
		blockInformationNationaliteAutre.style.display = 'none';
	}
	if (nationaliteEuropeen)
	{
		blockSelectNationaliteEuropeen.style.display = 'block';
		blockCheckboxNationaliteAutre.style.display = 'none';
		blockInformationNationaliteAutre.style.display = 'none';
	}
	if (nationaliteAutre)
	{
		blockSelectNationaliteEuropeen.style.display = 'none';
		blockCheckboxNationaliteAutre.style.display = 'block';
		blockInformationNationaliteAutre.style.display = 'block';
	}		
	
	return true;
}

function submitCreateAccountForm() {
	if (document.getElementById('email_input').value == "") {
		alert("Email obligatoire");
		return false;
	}
	if (document.getElementById('password_input').value == "") {
		alert("Mot de passe obligatoire");
		return false;
	}
	if (document.getElementById('password_input').value != document
			.getElementById('password_confirmation_input').value) {
		alert("La confirmation de mot de passe est erronée");
		return false;
	}
	if (document.getElementById('captcha_input').value == "") {
		alert("Captcha obligatoire");
		return false;
	}

	doit("flux.ex", "validateAccountCreation");
	return true;
}

function submitValidateAccountForm() {
	if (document.getElementById('email_input').value == "") {
		alert("Email obligatoire");
		return false;
	}
	if (document.getElementById('activation_code_input').value == "") {
		alert("Code d'activation obligatoire");
		return false;
	}

	doit("flux.ex", "validateActivation");
	return true;
}

function submitGeneratePasswordAccountForm() {
	if (document.getElementById('email_input').value == "") {
		alert("Email obligatoire");
		return false;
	}

	doit("flux.ex", "generatePassword");
	return true;
}

function submitPersonalInformationCivil() {
	doit("flux.ex", "step1");
	return true;
}

function submitPersonalInformationAddressAndMilitary() {
	doit("flux.ex", "step2");
	return true;
}

function submitPersonalInformation() {
	doit("flux.ex", "validatePersonalInformation");
	return true;
}

function submitNewPasswordForm() {
	doit("flux.ex", "validateNewPassword");
	return true;
}

function submitDeleteAccountForm() {
	if (confirm("Supprimer le compte?")) {
		doit("flux.ex", "validateDeleteAccount");
	}
	return true;
}

jQuery(document).ready(function(){
	$("input[name='compteCandidatDTO.anation']").change(changeTypeNationalite);
});
/*
 * Copyright : DGCP
 * Contributeurs :
 * Bureau 3D - DGCP
 *
*/

/*Variables globales*/

/*Indique que le formulaire n'a pas encore ete soumis */
var form_submitted = false;
var pumFocusErrorId;

tagsappAddEvent(window,'load',initbody);

/*Fonctions utilisees par le tag app:page*/
/*Utilise dans l'attribut onload de l'element <body>*/
function initbody()
{
placeFocus();
popdetail();
}

function tagsappAddEvent(obj, evType, fn)
{
	if (obj.addEventListener)
		{
		obj.addEventListener(evType, fn, false);
		return true;
		}
	else if (obj.attachEvent)
		{
		var r = obj.attachEvent("on" + evType, fn);
		return r;
		}
	else
		{
		return false;
		}
}

function tagsappRemoveEvent(el, evname, func) 
{
	if (el.detachEvent) 
	   { // IE
		el.detachEvent("on" + evname, func);
	   }
	else if (el.removeEventListener) 
	  { // Gecko / W3C
		el.removeEventListener(evname, func, true);
	   }
	else
	 {
		el["on" + evname] = null;
	}
};

/*Affiche un message d'erreur si necessaire*/
function popupmsgerreur()
{
	var divmsgid = document.getElementById("popmsgid");
	if (divmsgid != null)
				{
				pumShowErrorPopup("boite",pumPopuperreurouterdiv);
				}
}

/*Place le focus sur un champ particulier ou sur le premier */
function placeFocus() 
	{
	if (document.forms != null && document.forms.length > 0)
		 {
		 //Place le focus sur le premier champ en erreur
		 if (pumFocusErrorId != null)
		 	{
		 	focusById(pumFocusErrorId);
		 	}
		 else	
			{
		 	//Place le focus sur le premier champ du formulaire
		 	focusFirstField(document.forms[0]);
		 	}
  	}
}

/*Positionne le curseur sur l'id en parametre*/
function focusById(id)
{
var element = document.getElementById(id);
if (element != null)
	{
	if ((element.getAttribute('readonly') != true || element.getAttribute('disabled') != true )
		&& element.getAttribute('type') != 'hidden')
		{
		element.focus();
		}
	}
}

/*Positionne le curseur sur le premier element du formulaire*/
function focusFirstField(fields)
{
	if (fields != null)
	{
		for (i = 0; i < fields.length; i++)
		{
			el = fields.elements[i];
			if (el != null && el.name != null)
			{
				var tagName = fields.elements[i].tagName;

				if (tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA' || (tagName == 'BUTTON' && el.getAttribute('id') == "enterButton"))
				{
					if (el.type == "text" || el.type == "textarea" || el.type == "select-one" || el.type == "checkbox" || el.type == "radio")
					{
						pos = el.name.length -3;
						if (el.name.substring(pos,pos+3) != '_rd' && el.name.substring(0,3) != "ec_"
							&& el.name.substring(0,3) != 'ev_' && el.name.lastIndexOf('_f_') == -1)
						{
							if (el.getAttribute('readonly') != true || el.getAttribute('disabled') != true)
							{
								el.focus();
								break;
							}
						}
					}
				}
			}
		}
	}
} 


/*Fonctions utilisees par le tag app:submit */

/* Utilise dans l'attribut onmousedown du champ input de type submit.
   Supprime l'element du formulaire dont le comme nom commence par '_eventId'
   Un seul parametre prefixe par _eventId est accepte par le webflow. Permet
   de definir une transition par defaut pour utiliser les fonctions de tri
   et de pagination du tableau extremecomponents*/

function removeInputEventId()
{
var fields = document.forms[0];
if (fields != null)
	{
	for (i = 0; i < fields.length; i++)
		 {
		 var el = fields.elements[i];
		 if (el != null)
		 	{
		 	var tagName = fields.elements[i].tagName;
		 	if (tagName == 'INPUT' || tagName == 'SELECT')
		 		{ 
		 		if (el.type == "text" || el.type == "textarea" || el.type == "select-one" || el.type == "hidden")
				 	{
				 	if (el.name != null && el.name.search('_eventId_') != -1)
				 		{
				 		el.parentNode.removeChild(el);
						}
		 			}	 
			 	}
	    	 }
	    }
  	}
}


/*
Réinitialise à self l'attribut target des formulaire pour être sûr que
le formulaire est soumis dans la fenêtre courante
*/
function openinselfwindow()
{
if (document.forms != null && document.forms.length > 0)
	{
	for (i=0;i<document.forms.length;i++)
		{
		document.forms[i].target='_self';
		}
	}
return true;
}

/* Utilise dans l'attribut onmousedown du champ input de type submit. 
   Reinitialise les champs ec_ev et ec_efn
   utilises par eXtremeComponents pour filter  les requetes d'edition*/
function initecevefn()
{
var tab_ec_ev = document.getElementsByName('ec_ev');
if (tab_ec_ev != null)
	{
	for( i=0; i< tab_ec_ev.length; i++)
		{
	    tab_ec_ev.item(i).value=''; 
    	}
    }
var tab_ec_efn = document.getElementsByName('ec_efn');
if (tab_ec_efn != null)
	{
	for( i=0; i < tab_ec_efn.length; i++)
		{
	    tab_ec_efn.item(i).value=''; 
    	}
    }
var tab_ec_efn = document.getElementsByName('ec_eti');
if (tab_ec_efn != null)
	{
	for( i=0; i < tab_ec_efn.length; i++)
		{
	    tab_ec_efn.item(i).value=''; 
    	}
    }
}

/*
Stocke la transition demandée dans un champ caché du formulaire
*/
function stocketransition(transition)
{	
	var nomchamptransitiondemandee = "transitiondemandee";
	var transitiondemandee = "aucun";
	if (document.getElementsByName(nomchamptransitiondemandee) != null && document.getElementsByName(nomchamptransitiondemandee).length >0)
		{
		var champcachetransitiondemandee = document.getElementsByName(nomchamptransitiondemandee);
		champcachetransitiondemandee[0].value = transition;
		}
}

/*
Lit dans un champ cache la transition demandée, placée dans le formulaire par le tag app:submit
*/
function lecturetransition()
{
	var nomchamptransitiondemandee = "transitiondemandee";
	var transitiondemandee = "aucun";
	if (document.getElementsByName(nomchamptransitiondemandee) != null && document.getElementsByName(nomchamptransitiondemandee).length >0)
		{
		var champcachetransitiondemandee = document.getElementsByName(nomchamptransitiondemandee);
		transitiondemandee = champcachetransitiondemandee[0].value;
		}
	return transitiondemandee;
}


/*
Lit dans un champ caché le nom du flux en cours placé dans le formulaire par le tag app:form
*/
function lecturenomflux()
{
	var nomchampcacheflux = "nomdufluxencours"
	var fluxencours = "aucun"
	if (document.getElementsByName(nomchampcacheflux) != null && document.getElementsByName(nomchampcacheflux).length >0)
		{
		var champcacheflux = document.getElementsByName(nomchampcacheflux);
		fluxencours = champcacheflux[0].value;
		}
	return fluxencours;
}


/* pour cliquer sur un bouton associe lorsque l'on clique sur un onglet */
/* on passe en parametre le nom du bonton sur lequel on doit appuyer */
/* le nom du bouton correspond a la transition du webflow prefixee par _eventId_*/

function submitfromonglet(transition) 
{	
	//Ajoute le prefixe _eventId_ a la transition si necessaire
	if (transition != null && transition.search('_eventId_') == -1)
		{
		transition = '_eventId_' + transition ;
		}

	stocketransition(transition);

	//Utilise le champ submit de la page qui porte le nom de la transition
	if (document.getElementsByName(transition) != null && document.getElementsByName(transition).length >0)
		{//Soumission a partir d'un champ submit existant dans la page
	   	var bouton = document.getElementsByName(transition);
	   	bouton[0].click();
		}
	else
		{//Creation d'un champ submit (non affiche) 
		if (document.forms != null && document.forms.length > 0)
			{
			var formulaire = document.forms[0];	
			var el = null;
			el = document.createElement('INPUT');
			el.setAttribute('type','submit');
			el.setAttribute('name', transition);
			removeInputEventId();
			initecevefn();
			el.style.visibility='hidden';
			formulaire.appendChild(el);
			el.click();
			}
		else
			alert('Aucun formulaire dans la page');
		}
}	

function submitfromonglet_parameter(transition,parameterName,parameterValue) 
{	
	//Ajoute le prefixe _eventId_ a la transition si necessaire
	if (transition != null && transition.search('_eventId_') == -1)
		{
		transition = '_eventId_' + transition ;
		}

	stocketransition(transition);

	//Utilise le champ submit de la page qui porte le nom de la transition
	if (document.getElementsByName(transition) != null && document.getElementsByName(transition).length >0)
		{//Soumission a partir d'un champ submit existant dans la page
	   	var bouton = document.getElementsByName(transition);
	   	
	   	if (document.forms != null && document.forms.length > 0)
			{
			var formulaire = document.forms[0];	
			
			var param = null;
			param = document.createElement('INPUT');
			param.setAttribute('type','hidden');
			param.setAttribute('name',parameterName);
			param.setAttribute('value',parameterValue);
			formulaire.appendChild(param);
	   		}
	   	bouton[0].click();
		}
	else
		{//Creation d'un champ submit (non affiche) 
		if (document.forms != null && document.forms.length > 0)
			{
			var formulaire = document.forms[0];	
			
			var param = null;
			param = document.createElement('INPUT');
			param.setAttribute('type','hidden');
			param.setAttribute('name',parameterName);
			param.setAttribute('value',parameterValue);
			formulaire.appendChild(param);
			
			var el = null;
			el = document.createElement('INPUT');
			el.setAttribute('type','submit');
			el.setAttribute('name', transition);
			removeInputEventId();
			initecevefn();
			el.style.visibility='hidden';
			formulaire.appendChild(el);
			el.click();
			}
		else
			alert('Aucun formulaire dans la page');
		}
}	


function doit(action,transition) 
{	
	if (transition != null && transition.search('_eventId_') == -1)
		{
		transition = '_eventId_' + transition ;
		}

	stocketransition(transition);

		if (document.forms != null && document.forms.length > 0)
			{
			var formulaire = document.forms[0];	
			formulaire.setAttribute('action',action);
			var el = null;
			el = document.createElement('INPUT');
			el.setAttribute('type','submit');
			el.setAttribute('name', transition);
			removeInputEventId();
			initecevefn();
			el.style.visibility='hidden';
			formulaire.appendChild(el);
			el.click();
			}
		else
			{
			alert('Aucun formulaire dans la page');
			}
}	


function doit_on_other_doc(docactif,action,transition) 
{
	
	if (transition != null && transition.search('_eventId_') == -1)
		{
		transition = '_eventId_' + transition ;
		}

	stocketransition(transition);

	if (docactif == null)
		{
		docactif=document;
		}
		
		if (docactif != null && docactif.forms != null && docactif.forms.length > 0)
			{
			var formulaire = docactif.forms[0];	
			formulaire.setAttribute('action',action);
			var el = null;
			el = docactif.createElement('INPUT');
			el.setAttribute('type','submit');
			el.setAttribute('name', transition);
			removeInputEventId();
			initecevefn();
			el.style.visibility='hidden';
			formulaire.appendChild(el);
			el.click();
			}
		else
			{
			alert('Impossible d\'accéder à la page ou aucun formulaire dans la page');
			}
}

function doit_with_attr(action,transition,parameterName,parameterValue) 
{	
	
	if (transition != null && transition.search('_eventId_') == -1)
		{
		transition = '_eventId_' + transition ;
		}

	stocketransition(transition);

		if (document.forms != null && document.forms.length > 0)
			{
			var formulaire = document.forms[0];	
			formulaire.setAttribute('action',action);
			var param = null;
			param = document.createElement('INPUT');
			param.setAttribute('type','hidden');
			param.setAttribute('name',parameterName);
			param.setAttribute('value',parameterValue);
			formulaire.appendChild(param);
			
			var el = null;
			el = document.createElement('INPUT');
			el.setAttribute('type','submit');
			el.setAttribute('name', transition);
			removeInputEventId();
			initecevefn();
			el.style.visibility='hidden';
			formulaire.appendChild(el);
			el.click();
			}
		else
			alert('Aucun formulaire dans la page');

}	


//Test si un objet est un element <a>
function isA(obj)
{
if (obj != null)
	{
	var tagName = obj.tagName;
	if (tagName == 'a' || tagName == 'A' )
	  {
	  return true;
	  }
	}
return false;
}
	
/* Pour l'affichage d'un message d'erreur generique */

function popdetail(object)
{
	var numpopdetailcourant = 0;
    var myAs = document.getElementsByTagName('a');
   
   //on recherche le numero d'onglet a afficher    
    if (! object || ! isA(object))
     {
    	// si aucun objet n'est passa c'est le premier
    	numpopdetail=1;
     } 
    else
     {
  	   //on recupere le numaro en derniere position du lien href (...#popdetailx)  
       numpopdetail=object.href.charAt(object.href.length-1);
      }
    
    for (var a = 0; a < myAs.length; ++a) {
	// Si le lien a une classe de type popdetail
        if (myAs[a].className == 'liendetailerreur') {
	// on extrait l'id de la popup a partir du href
            var pop = document.getElementById(myAs[a].href.substring(myAs[a].href.lastIndexOf('#') + 1));
	// si la popup existe on l'affiche (display block)
            if (pop) {
                numpopdetailcourant = numpopdetailcourant + 1;
                if (numpopdetailcourant==numpopdetail) {
                	pop.style.display = 'block';
                	myAs[a].parentNode.className = 'ongleterreuractive';
                } else {
                    pop.style.display = 'none';
                	myAs[a].parentNode.className = 'ongleterreurdesactive';
                }
                myAs[a].onclick = function() {
                	popdetail(this);
                    return false;
                };   
            }
        }
    }
}
 

/*Fonction soumettre une requete*/
function send_url(url)
{
    window.location.href = updateurlforctra(url);
}

function updateurlforctra(url)
{
  	var nomfluxencours = lecturenomflux();
  	
  	var transitiondemandee = lecturetransition();

	var sep = "&";
    if (url != null && url.lastIndexOf("?") == -1)
	    {
	    sep = "?";
	    }

	if (nomfluxencours != "aucun"  && transitiondemandee != "_eventId_" && transitiondemandee != '_eventId_aucun')
		{
		url = url + sep + "flux=" + nomfluxencours + "&transition=" + transitiondemandee  ;
		}

return url;
}

/*Fonction soumettre une requete et activer le message d'attente*/
function send_url_waiting(url)
{
	var timebeforemsg = 500;
	setTimeout("active_pleasewait()",timebeforemsg);
    document.body.style.cursor='wait';
    window.location.href = updateurlforctra(url);
}

/*Fonction soumettre une requete dans une nouvelle fenetre window*/

function send_url_openwindow(url,name,options)
{
    if (options == null)
        {
        options = "'toolbar=yes, directories=no, location=no, status=yes, menubar=no, resizable=yes, scrollbars=yes, width=500, height=400'";
       }
    if (name == null)
        {
            name = "";
        }
    var newurl =  updateurlforctra(url);;
    var popupwin = window.open(newurl,name,options);
    if (popupwin && popupwin.focus) popupwin.focus();
}

/*Fonction soumettre une requete dans une nouvelle fenetre window modale*/

function send_url_openwindow_modal(url,name,options,modaloptions)
{
    if (options == null)
        {
        options = "'toolbar=yes, directories=no, location=no, status=yes, menubar=no, resizable=yes, scrollbars=yes, width=500, height=400, modal=yes'";
       }
    if (name == null)
        {
            name = "";
        }
    var newurl =  updateurlforctra(url);
    var popupwin;
    if (window.showModalDialog) {
    	popupwin = window.showModalDialog(newurl,name,modaloptions);
    }
    else
	{
        popupwin = window.open(newurl,name,options);    	
	}
    if (popupwin && popupwin.focus) popupwin.focus();
}


/*Fonctions utilisees dans le Tag app:form*/

/* Peut etre utilise apres la demande de soumission d'un formulaire,
   si specifie dans l'attribut 'onsubmit' de l'element <form>.
   - empeche de soumettre deux fois le meme formulaire en 
     retournant 'false' si la variable form_submitted est 
     egale a 'true'.
   - sinon soumet la requete et active un message d'attente 
     apres avoir attendu timebeforemsg millisecondes
   */
function submit_form (timebeforemsg)
{
  openinselfwindow();
  if ( form_submitted )
  {
	active_pleasewait();
    return false;
  }
  else
  {
	updateformactionforctra();
    form_submitted = true;
	setTimeout("active_pleasewait()",timebeforemsg);
    document.body.style.cursor='wait';
    return true;
  }
}

/*
Mise à jour de l'attribut action du formulaire lors de la navigation dans un tableau ec,
puis soumission du formulaire
*/
function ecupdatectra(transition)
{
	stocketransition(transition);
	updateformactionforctra();
	var formulaire = document.forms[0];	
	formulaire.submit();
}

/*
Complète l'attribut action du formulaire avec l'identifiant du flux courrant et la transition demandée
Paramètres destinés à être utilisé par CTRA pour présenter les statistiques d'accès à l'application
*/
function updateformactionforctra()
{
	var formulaire = document.forms[0];	
	var action = formulaire.getAttribute('action');  	
  	var nomfluxencours = lecturenomflux();
  	var transitiondemandee = lecturetransition();

	if (nomfluxencours != "aucun"  && transitiondemandee != "_eventId_" && transitiondemandee != '_eventId_aucun')
		{
		action = action + "?flux=" + nomfluxencours + "&transition=" + transitiondemandee  ;
		formulaire.setAttribute('action',action);
		}
}


function submit_form_sans_attente()
{
  if ( form_submitted )
  {
    return false;
  }
  else
  {
	updateformactionforctra();  
    form_submitted = true;
    return true;
  }
}


/* Affiche le bloc <div> ayant pour id 'pleaseWait'
   Raffraichit l'image gif animee pour declencher l'animation*/
function active_pleasewait()
{
	var obj = document.getElementById('pleaseWait');
	if (obj != null)
	{
	   	obj.style.display = 'block';
   		var x = "document.images[\"waitimg\"].src = \"" + document.images["waitimg"].src + "\"";
		tagsHideSelect('pleaseWait');
   		setTimeout(x, 200); 
   		
   		document.getElementById('pleaseWait').focus(); 
   		
   		showOverlay();
	}
}

function showOverlay(){
	var obj = document.getElementById('overlay');
	if (obj != null)
	{
		obj.style.display = 'block';
	}
}

function hideOverlay(){
	var obj = document.getElementById('overlay');
	if (obj != null)
	{
		obj.style.display = 'none';
	}
}

 //Cache & affiche les elements select,iframe et object si necessaire
function tagsHideSelect(blocId)
{
tagsHideControl("SELECT",blocId);
/*@cc_on @*/
/*@if (@_jscript_version >= 5.5)
@else @*/
tagsHideControl("IFRAME",blocId);
/*@end @*/
tagsHideControl("OBJECT",blocId);
}
  
function tagsHideControl(tagName,blocId) {
 if (/msie/i.test(navigator.userAgent) &&  ! /opera/i.test(navigator.userAgent))
 	{	
	var blocwait = document.getElementById(blocId)
	if (blocwait == null)
		{
		return ;
		}
	var selects = document.getElementsByTagName(tagName); 
	
	var waitCurrX = tagsGetposx(blocwait);
	var waitCurrY = tagsGetposy(blocwait);  
	var waitCurrWidth = blocwait.offsetWidth;
	var waitCurrHeight = blocwait.offsetHeight; 

	for(x=0; x < selects.length; x++)
		{		
		var obj=selects[x];
		_posx = tagsGetposx(selects[x]);
		_posy = tagsGetposy(selects[x]);    	
		_width = selects[x].offsetWidth;
		_height = selects[x].offsetHeight; 

		if(tagsIsToHide(_posx,_posy,_width,_height,waitCurrX,waitCurrWidth,waitCurrY,waitCurrHeight))
			{
			//Si l'objet est deja masque, on ne fait rien	
	  		if(obj.style.visibility == "hidden")
				continue; 
			obj.style.visibility='hidden'; 
			}
		}
    }
}

//PosX
function tagsGetposxbyid(id,defaultx)
{
var obj = document.getElementById(id);
if (obj != null)
	return tagsGetposx(obj)
else
	return defaultx;
}

function tagsGetposx(y){
	var _posx = 0;
	if (y.offsetParent){
		while (y.offsetParent){
			_posx += y.offsetLeft;
			y = y.offsetParent;
		}
	}else if(y.x){ 
		_posx += y.x;
	}
	
	return _posx;
 }

//PosY 
function tagsGetposybyid(id,defaulty)
{
var obj = document.getElementById(id);
if (obj != null)
	return tagsGetposy(obj)
else
	return defaulty;
}

function tagsGetposy(y){
	var _posy  = 0;
	if (y.offsetParent){
		while (y.offsetParent){
			_posy += y.offsetTop;
			y = y.offsetParent;
		}
	}else if (y.y){ 
		_posy += y.y;
	}
	
	return _posy;
 }

//Determine si le popup doit masquer un select
 function tagsIsToHide(_posx,_posy,_width,_height,waitCurrX,waitCurrWidth,waitCurrY,waitCurrHeight)
	{ 
	if (_posx > (waitCurrX + waitCurrWidth) || (_posx + _width) < waitCurrX)
			return false;
	if (_posy > (waitCurrY + waitCurrHeight) || (_posy + _height) < waitCurrY)
			return false;
return true;
 }


/* Peut etre utilise apres la demande de soumission du formulaire 
   si specifie dans l'attribut 'onsubmit' de l'element <form>.
   - De-active la soumission du formulaire par le touche ENTREE
   - execute le javascript submit_form cas de soumission du 
     formulaire par un autre moyen que la touche ENTREE.
*/
function submit_form_noenter(timebeforemsg)
{
if (window.event && window.event.keyCode == 13)
	{return false;}
else
	{
	return submit_form(timebeforemsg);
	}
}


/*Fonctions utilisees dans le Tag app:input*/

/* Peut etre utilise dans l'attribut onkeypress d'un element
   La touche ENTREE simule alors un clic sur l'element qui
   a pour id 'enterButton' dans la page*/
function submitEnterButton(e)
{
var key;
	if(window.event)
		 {
		// for IE, e.keyCode ou window.event.keyCode peut etre utilise
		key = e.keyCode; 
		}
	else if (e.which)
		 {
		// netscape
		key = e.which; 
		}

if (key == 13)
	{
	if (document.getElementById('enterButton') != null)
		{
		document.getElementById('enterButton').click();
		return false;
		}
	else 
		{
		return false;
		}
}
}


/*
Fonctions utilisees dans le tag app:inputcombo
*/
/*Positionne la liste deroulante en fonction de la
valeur d'un champ input*/
function refreshCombo(x,idselcombo)
{
  var S = document.getElementById(idselcombo);
  var L = S.options.length;
  var found = false;
  var foundautre = false;
  var myIndex = 0;
  var myIndexautre = 0;
  var myTextautre = 'Autre';

    if (S == null || x == null ||x.value == null || x.value == "")
    	return false;
    	
    for (var i=0; i <= L-1; i++)
    {
      if (x.value == S.options[i].value) {found = true; myIndex = i};
      
    }

    if (found)
    {
      S.options.selectedIndex = myIndex;
    }
    else
    {
   	for (var i=0; i <= L-1; i++)
    	{
    	if (myTextautre == S.options[i].text) {foundautre = true; myIndexautre = i};
    	}
    	if (foundautre) 
    		{
   		      S.options.selectedIndex = myIndexautre;
    		}
    	else
    	{
	    for (var i=L; i >0; i--)
    		{
    		S.options[i] = new Option(S.options[i-1].text,S.options[i-1].value);
    		}
	    	S.options[0].value=x.value;
    		S.options[0].text=myTextautre;
    		S.options.selectedIndex = myIndexautre;
    	}
    }
    
    return false;
}

/*Met a jour un champ de saisie en fonction de la selection
d'une liste deroulante*/
function populateInput(id,x)
{
 if (document.getElementById(id) != null && x != null)
 	{
 	document.getElementById(id).value = x.options[x.selectedIndex].value;
 	}
}


function doSablier()
{
  document.body.style.cursor = 'wait';
}


function noenter()
{
  	return !(window.event && window.event.keyCode == 13); 
}

function enter(nextfield) 
{
	if(window.event && window.event.keyCode == 13)
		{
  		nextfield.focus();
	  	return false; 
	  	}
	else
		{
	  	return true;
	  	}
 }


/*Tag app:checkbox 
  Selectionne toutes les cases a cocher d'un groupe de checkboxes*/
function checkall(id,cptid) { 
var checker = document.getElementById(id + "_checker");
if (id != null && cptid >0 && checker != null)
	{
  	for (var i=1; i <= cptid ;i++) 
  		{
  		var checkbox = document.getElementById(id + "_" + i);
  		if (checkbox != null && checkbox.type.indexOf('checkbox') == 0)
  			{
			if (checker != null && checker.type.indexOf('checkbox') == 0)
				{
  				checkbox.checked=checker.checked;
 				}
			}
		}
	}
}

/*Tag app:inputmultiple
  Passe au champ suivant dès que le max de caractères autorisés est saisi
  * supression suite à modification tag appmultiple juillet 09
  * méthode remplacée par autotab
 
function gotofieldaftermax(content,elt,id)
{	
if (elt != null && getFinSelection(elt) == elt.maxLength)
	{
	focusById(id);
	}
}*/

/*
Retourne la position du curseur dans un champ texte
 supression suite à modification tag appmultiple juillet 09
  * méthode remplacée par autotab
 
function getFinSelection(input)
 {
 var finSelection;
	if (/gecko/i.test(navigator.userAgent))
		{
		finSelection = input.selectionEnd;
		}
	else
		{
		var range = document.selection.createRange();
		var isCollapsed = range.compareEndPoints("StartToEnd", range) == 0;
		if (!isCollapsed)
			{
			range.collapse(false);
			}
		var b = range.getBookmark();
		finSelection = b.charCodeAt(2) - 2;;
		}
	return finSelection;
}*/

/* Affiche un popup contenant la version de l'application */
function aproposde()
{
var applilibelle = document.getElementById("appli-libellelong");
var appliversion = document.getElementById("appli-version");
var cn = document.getElementById("personneannuaire-cn");
var fonction = document.getElementById("personneannuaire-fonction");
var expiration = document.getElementById("expirationhabilitation");

if (applilibelle != null && appliversion != null)
	{
	var apropo;
	apropo = "application : ";
	if (applilibelle != null)
		apropo += applilibelle.innerHTML;
	
	apropo  +=  "\nversion     : ";
	if (appliversion != null)
		apropo  += appliversion.innerHTML;
	
	apropo += "\n";
	if (cn != null)
		apropo += cn.innerHTML;
	
	apropo += "\n";
	if (fonction != null)
		apropo +=  fonction.innerHTML;
		
	apropo  += "\n";
	if (expiration != null)
		apropo += expiration.innerHTML;
	
	alert(apropo);
	}
}

/*
 * Fonctions utilisée par le tag app:selectorder
 */
 
function moveup(obj,champcache) 
{ 
	obj = (typeof obj == "string") ? document.getElementById(obj) : obj;
	if (obj.tagName.toLowerCase() != "select" && obj.length < 2)
	    {
		return false;
	    }
	var sel = new Array();
	for (var i=0; i<obj.length; i++) 
	    {
		if (obj[i].selected == true)
		    {
			sel[sel.length] = i;
		   }
	    }
	for (i in sel) 
	  {
		if (sel[i] != 0 && !obj[sel[i]-1].selected) 
		  {
			var tmp = new Array((document.body.innerHTML ? obj[sel[i]-1].innerHTML : obj[sel[i]-1].text), obj[sel[i]-1].value, obj[sel[i]-1].style.color, obj[sel[i]-1].style.backgroundColor, obj[sel[i]-1].className, obj[sel[i]-1].id);
			if (document.body.innerHTML) 
			  {
			  obj[sel[i]-1].innerHTML = obj[sel[i]].innerHTML;
			  }
			else 
			  {
			  obj[sel[i]-1].text = obj[sel[i]].text;
			  }
			obj[sel[i]-1].value = obj[sel[i]].value;
			obj[sel[i]-1].style.color = obj[sel[i]].style.color;
			obj[sel[i]-1].style.backgroundColor = obj[sel[i]].style.backgroundColor;
			obj[sel[i]-1].className = obj[sel[i]].className;
			obj[sel[i]-1].id = obj[sel[i]].id;

			if (document.body.innerHTML)
			  {
			     obj[sel[i]].innerHTML = tmp[0];
			  }
			else 
			  {
			  obj[sel[i]].text = tmp[0];
			  }
			  
			obj[sel[i]].value = tmp[1];
			obj[sel[i]].style.color = tmp[2];
			obj[sel[i]].style.backgroundColor = tmp[3];
			obj[sel[i]].className = tmp[4];
			obj[sel[i]].id = tmp[5];
			obj[sel[i]-1].selected = true;
			obj[sel[i]].selected = false;
		}
	}
	synchronisechampcacheavecliste(obj,champcache);
}

function movedown(obj,champcache)
   {
	obj = (typeof obj == "string") ? document.getElementById(obj) : obj;
	if (obj.tagName.toLowerCase() != "select" && obj.length < 2)
	  {
	  return false;
	  }
	var sel = new Array();
	for (var i=obj.length-1; i>-1; i--)
	    {
		if (obj[i].selected == true)
		   {
		   sel[sel.length] = i;
		   }
	    }

	for (i in sel) 
	   {
		if (sel[i] != obj.length-1 && !obj[sel[i]+ 1].selected)
		    {
			var tmp = new Array((document.body.innerHTML ? obj[sel[i]+1].innerHTML : obj[sel[i]+1].text), obj[sel[i]+1].value, obj[sel[i]+1].style.color, obj[sel[i]+1].style.backgroundColor, obj[sel[i]+1].className, obj[sel[i]+1].id);
			if (document.body.innerHTML)
			   {
			   obj[sel[i]+1].innerHTML = obj[sel[i]].innerHTML;
			   }
			else 
			   {
      			obj[sel[i]+1].text = obj[sel[i]].text;
			   }
			   
			obj[sel[i]+1].value = obj[sel[i]].value;
			obj[sel[i]+1].style.color = obj[sel[i]].style.color;
			obj[sel[i]+1].style.backgroundColor = obj[sel[i]].style.backgroundColor;
			obj[sel[i]+1].className = obj[sel[i]].className;
			obj[sel[i]+1].id = obj[sel[i]].id;
			if (document.body.innerHTML)
			    {
			    obj[sel[i]].innerHTML = tmp[0];
			    }
			else 
			   {
     			obj[sel[i]].text = tmp[0];
			   }
			obj[sel[i]].value = tmp[1];
			obj[sel[i]].style.color = tmp[2];
			obj[sel[i]].style.backgroundColor = tmp[3];
			obj[sel[i]].className = tmp[4];
			obj[sel[i]].id = tmp[5];
			obj[sel[i]+1].selected = true;
			obj[sel[i]].selected = false;
		}
	}
		synchronisechampcacheavecliste(obj,champcache);
}

function movebottom(obj,champcache) 
{ 
	obj = (typeof obj == "string") ? document.getElementById(obj) : obj;
	if (obj.tagName.toLowerCase() != "select" && obj.length < 2)
	     {
		 return false;
	     }
	var elements = new Array();
	for (var i=0; i<obj.length; i++) 
	   {
		if (!obj[i].selected) 
		   {
			elements[elements.length] = new Array((document.body.innerHTML ? obj[i].innerHTML : obj[i].text), obj[i].value, obj[i].style.color, obj[i].style.backgroundColor, obj[i].className, obj[i].id, obj[i].selected);
		   }
	   }
	for (i=0; i<obj.length; i++)
	    {
		if (obj[i].selected) 
		  {
		  elements[elements.length] = new Array((document.body.innerHTML ? obj[i].innerHTML : obj[i].text), obj[i].value, obj[i].style.color, obj[i].style.backgroundColor, obj[i].className, obj[i].id, obj[i].selected);
		  }
	     }
	     
	for (i=obj.length-1; i>-1; i--) 
	    {
		if (document.body.innerHTML)
		    {
		     obj[i].innerHTML = elements[i][0];
		    }
		else 
		    {
      		obj[i].text = elements[i][0];
		    }
		obj[i].value = elements[i][1];
		obj[i].style.color = elements[i][2];
		obj[i].style.backgroundColor = elements[i][3];
		obj[i].className = elements[i][4];
		obj[i].id = elements[i][5];
		obj[i].selected = elements[i][6];
	    }
	synchronisechampcacheavecliste(obj,champcache);	    
}

function movetop(obj,champcache) 
{ 
	obj = (typeof obj == "string") ? document.getElementById(obj) : obj;
	if (obj.tagName.toLowerCase() != "select" && obj.length < 2)
	   {
		return false;
	   }
	var elements = new Array();
	for (var i=0; i<obj.length; i++)
	  {
		if (obj[i].selected)
		   {
			elements[elements.length] = new Array((document.body.innerHTML ? obj[i].innerHTML : obj[i].text), obj[i].value, obj[i].style.color, obj[i].style.backgroundColor, obj[i].className, obj[i].id, obj[i].selected);
		   }
	  }
	for (i=0; i<obj.length; i++) 
	  {
		if (!obj[i].selected) 
		    {
			elements[elements.length] = new Array((document.body.innerHTML ? obj[i].innerHTML : obj[i].text), obj[i].value, obj[i].style.color, obj[i].style.backgroundColor, obj[i].className, obj[i].id, obj[i].selected);
		    }
	  }
	
	for (i=0; i<obj.length; i++) 
	  {
		if (document.body.innerHTML) 
		     {
     		obj[i].innerHTML = elements[i][0];
		     }
		else 
		     {
     		 obj[i].text = elements[i][0];
		     }
		obj[i].value = elements[i][1];
		obj[i].style.color = elements[i][2];
		obj[i].style.backgroundColor = elements[i][3];
		obj[i].className = elements[i][4];
		obj[i].id = elements[i][5];
		obj[i].selected = elements[i][6];
	}
	synchronisechampcacheavecliste(obj,champcache);
}
	
function synchronisechampcacheavecliste(obj,champcache)
{
	if (obj.tagName.toLowerCase() != "select" && obj.length < 2)
	    {
		return false;
	    }
	    
	var valchampcache;
   	for (i=0; i<obj.length; i++) 
	  {
	      valchampcache = valchampcache + ";" + obj[i].value;
	  }

    champcache = (typeof champcache == "string") ? document.getElementById(champcache) : champcache;

    var tagName = champcache.tagName;
 	if (tagName == 'INPUT')
     	{
		champcache.setAttribute('value', valchampcache);
     	}
     else
         {
          alert('ERREUR' ) ;
         }
}

function Autotab(id, longueur, texte) {    
	if (texte.length > longueur-1) {
		Deplacerfocus(id);
	}
}

function Deplacerfocus(id) {
	var element = document.getElementById(id);	
	if (element != null)
	{
		if (element.getAttribute('readonly') != true && element.getAttribute('disabled') != true 
				&& element.getAttribute('type') != 'hidden')
		{
			element.select();
		}
	}
}

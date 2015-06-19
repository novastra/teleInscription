/*Popup.js
Date de creation : 21/03/2006
Modifications
27/08/2007 : deplacement de l'enregistrement de document;onmousemove dans la fonction  pumGrab_id
             pour permettre la gestion de plusieurs popup dans la meme page
Auteur : W. Petit
Version : 0.2
Affiche un Popup Windows DHTML Redimensionnable - deplacable - qui masque les elements SELECT
*/

PumPopUp.addEvent = function(el, evname, func)
{
	if (el.attachEvent) { // IE
		el.attachEvent("on" + evname, func);
	} else if (el.addEventListener) { // Gecko / W3C
		el.addEventListener(evname, func, true);
	} else {
		el["on" + evname] = func;
	}
};

PumPopUp.removeEvent = function(el, evname, func) {
	if (el.detachEvent) { // IE
		el.detachEvent("on" + evname, func);
	} else if (el.removeEventListener) { // Gecko / W3C
		el.removeEventListener(evname, func, true);
	} else {
		el["on" + evname] = null;
	}
};


PumPopUp.objectpopup = function()
   {
	if (window._dynarch_PumPopup)
				{
				window._dynarch_PumPopup.show();
				}
   } ;

PumPopUp.getPopupRef = function()
  {
  return window._dynarch_PumPopup;
  }

PumPopUp.setPopupRef = function(popup)
  {
  window._dynarch_PumPopup = popup;
  }

/*Parametres de creation de la popup
nearid : id de l'objet qui sert de reference pour positionner le popup
cid : id_de_la_popup
contentid : id de l'objet qui contient les messages d'erreur ?? afficher
bgcolor : couleur arriere-plan popup
textcolor : couleur texte
fontstyleset : police
title : titre
titlecolor : couleur arriere-plan du titre
titletextcolor : couleur titre
bordercolor : couleur bordure,
scrollcolor : couleur barre de scroll
dirimg : Repertoire de stockage des images
*/
function PumPopUp(pnearid,pcid,pcontentid,pbgcolor,ptextcolor,pfontstyleset,ptitle,ptitlecolor,ptitletextcolor,
                 pbordercolor,pscrollcolor,pdirimg,pheightdelta,pmaxwidth,pmaxheight,pafficheboutons)
{                        
    var that = this; //Contournement permettant d'accéder à this dans les fonctions internes
    this.pumW3c = (document.getElementById)? true: false;
    this.pumIe5 = PumPopUp.pumIs_ie5();
    this.pumIe = PumPopUp.pumIs_ie();
    this.pumIsFirefox = PumPopUp.pumIs_firefox();
    this.pumNs6 = (this.pumW3c && (navigator.appName=="Netscape"))? true: false;
    this.pum_overlap = null;
    this.pmCurrIDb = null;
    this.pumXoff = 0;
    this.pumYoff = 0;
    this.pumCurrRS = null;
    this.pumRsxoff = 0;
    this.pumRsyoff = 0;
    this.pumOldac = null;
    this.pumZdx = 1;
    this.pumMx = 0;
    this.pumMy = 0;
    this.pumIsMinimize = false;
    this.pumCurrX = 0;
    this.pumCurrY = 0;
    this.pumCurrWidth = 0;
    this.pumCurrHeight = 0;
    this.pumPopuperreurouterdiv = null;
    
    //elts du documents 
    this.bxprinc = null;
    this.bxtitle = null;
    this.bxtitletext = null;
    this.bxmin = null;
    this.bxmax = null;
    this.bxcls = null;
    this.bxsel = null,
    this.bxcontent=null;
    this.bxrs = null;

	this.nearid = pnearid;
	this.cid = pcid;
	this.contentid = pcontentid;
	this.bgcolor = pbgcolor;
	this.textcolor = ptextcolor;
	this.fontstyleset = pfontstyleset;
	this.title = ptitle;
	this.titlecolor = ptitlecolor;
	this.titletextcolor = ptitletextcolor; 	
	this.bordercolor = pbordercolor;
	this.scrollcolor = pscrollcolor;
	this.dirimg = pdirimg;
	this.heightdelta = pheightdelta;
	this.maxwidth = pmaxwidth;
	this.maxheight = pmaxheight;
    this.afficheboutons = pafficheboutons;
    
    initPositionAndWidth();
    initOuterDiv();
    
   	function initPositionAndWidth()
		{
	  	var wh = new Array();
	    var wh = pumCalculWidthPopup(that.contentid,that.heightdelta,that.maxwidth,that.maxheight);
	    var xy = pumCalculPositionPopup(that.nearid,wh);
	    var tw, th;		
	    that.pumCurrX = xy[0];
	    that.pumCurrY = xy[1];
	    that.pumCurrWidth = wh[0];
	    that.pumCurrHeight = wh[1];
		}
		
	//Calcule la taille du popup a utiliser en fonction de son contenu
    function pumCalculWidthPopup(objid,heightdelta,maxwidth,maxheight)
            {
            var defaultw = 300;
            var defaulth = 175;
            var minw = 100;
            var minh = 80;
            var maxw = 500;
            var maxh = 300;
            if (maxwidth > 0)
            	{
            	maxw = maxwidth;
            	}
            
            if (maxheight > 0)
            	{
            	maxh = maxheight;
            	}
                
            var maxAncetres=0;
            var ancetre = document.getElementById(objid);
            var result = new Array();
            
            if (ancetre != null)
            	{
            	while (PumPopUp.pumFirst_child(ancetre) != null && ! PumPopUp.pumIsLi(PumPopUp.pumFirst_child(ancetre)) && maxAncetres < 4)
            		{
            		maxAncetres++;
            		ancetre = PumPopUp.pumFirst_child(ancetre);
            		}
            	if (PumPopUp.pumIsLi(PumPopUp.pumFirst_child(ancetre)))
            		{		
            		var nbli = ancetre.childNodes.length;
            		var maxcar=0;
            		nbligne = 0;
            		for (var i = 0; i <nbli;i++)
            			 {
            			 if (! PumPopUp.pumIs_ignorable(ancetre.childNodes[i]))
            			 	{
            			 	 ligneSize = (ancetre.childNodes[i].innerHTML).length;
            				 size = 60 + Math.floor(ligneSize*10/1.5);	
            				 deltaligne = Math.ceil(size/maxw) 
            			 	 nbligne = nbligne + deltaligne;
            				 maxcar = Math.max(maxcar,(ancetre.childNodes[i].innerHTML).length);
            				}
            			 }
            		result[0] = Math.min(Math.max(60 + Math.floor(maxcar*10/1.5),minw),maxw) +15;
            		result[1] = Math.min(Math.max(Math.ceil(nbligne*25),minh),maxh)  + 20 + heightdelta ;	
            		return result;
            		}
            	else 
            		{
            		result[0] = defaultw;
            		result[1] = defaulth ;
            		return result;
            		}
            	}
 
         }
            
    //calcul de la position du popup
    function pumCalculPositionPopup(nearid,wh)
        {
        	var maxscreenh = 540;
        	var maxscreenw = 900;
        	var defaultx = (document.body.clientWidth-that.pumCurrWidth)/2 ; /*400 */
        	var defaulty = 300;
        	var xy= new Array();
        	//Placement du popup sous le premier champ en erreur
        	var firsterrorX = PumPopUp.pumGetposxbyid(nearid,defaultx);
        	var firsterrorY = PumPopUp.pumGetposybyid(nearid,defaulty);
        	var offw = PumPopUp.pumGetWidthDivAncetre(nearid,0);
        	var offh = PumPopUp.pumGetHeightDivAncetre(nearid,0);
        	if (firsterrorX <= 0 || firsterrorY <= 0 || offh <= 0)
        		{
        		firsterrorX = defaultx;
        		firsterrorY = defaulty;
        		}
        	if ((firsterrorY + offh + wh[1]) < maxscreenh)
		      {
		      //positionnement au dessous de nearid
		      xy[1] = firsterrorY + offh;
		      }
	        else if ((firsterrorY - offh - wh[1]) > 0)
		      {
		      //positionnement au dessus de nearid
		      xy[1] = firsterrorY - offh - wh[1];
		      }
	        else
	         {
	         xy[1] = firsterrorY;
	         }
        	xy[0] = Math.min(maxscreenw - wh[0],firsterrorX + Math.floor(offw/2));
        	return xy;
        }
    
   	function initOuterDiv()
		{
      	//Box principale
		var outerdiv = new PumPopUp.pumSubBox(that.pumCurrX,that.pumCurrY,that.pumCurrWidth,
                                            that.pumCurrHeight,that.bordercolor,that.cid + '_b');    	
    	outerdiv.style.borderStyle = "outset";
    	outerdiv.style.borderWidth = "2px";
    	outerdiv.style.borderColor = that.bordercolor;
    	outerdiv.style.zIndex = ++that.pumZdx;    
		
        //Box contenant le titre
    	var tw = (that.pumIe5)?that.pumCurrWidth-8:that.pumCurrWidth-5;
    	var th =(that.pumIe5)?that.pumCurrHeight+4:that.pumCurrHeight-4;
    	var titlebar = new PumPopUp.pumSubBox(2,2,tw,20,that.titlecolor,that.cid + '_t');
    	titlebar.style.overflow = "hidden";
    	titlebar.style.cursor = "default";
    	var titlebartext = '<span style="position:absolute; left:3px; top:1px; font:bold 10pt sans-serif; color:';
    	titlebartext += that.titletextcolor + '; height:18px; overflow:hidden; clip-height:16px;" id="titletext">'+ that.title + '</span>';
    	titlebartext += '<span id="'+ that.cid +'_btt" style="position:absolute; width:48px; height:16px;';
    	titlebartext += 'left:' + (tw-48) + 'px; top:2px;">';
    	
    	if (that.afficheboutons) 
    	{
    		titlebartext += '<img src="' + that.dirimg +'/min.gif" width="16" height="16" id="' + that.cid + '_min">';
    		titlebartext += '<img src="' + that.dirimg +'/max.gif" width="16" height="16"  id="' + that.cid + '_max">';
    		/*titlebartext += '<img src="' + that.dirimg +'/close.gif" width="16" height="16" id="' + that.cid + '_cls">';*/
    		titlebartext += '<span alt="Fermer" title="Fermer" id="'  + that.cid + '_cls">×</span>';
    		
    	}
    	
    	titlebartext += '</span>';
    	
    	titlebar.innerHTML = titlebartext;   
		 
    	//Box contenant le contenu de la popup
    	tw = (that.pumIe5)?that.pumCurrWidth-7:that.pumCurrWidth-13;
    	th = (that.pumIe5)?that.pumCurrHeight-36:that.pumCurrHeight-36;
    	var content = new PumPopUp.pumSubBox(2,24,tw,th,that.bgcolor,that.cid + '_c');
    	content.style.borderColor = that.bordercolor;
    	content.style.borderStyle = "inset";
    	content.style.borderWidth = "2px";
    	content.style.overflow = "auto";
    	content.style.padding = "0px 2px 0px 4px";
    	content.style.font = that.fontstyleset;
    	content.style.color = that.textcolor;
    	if (that.pumIe5) 
    	 {
    	    content.style.scrollbarBaseColor= that.scrollcolor;
    	 }
    	 
   		//Determination du contenu du popup d'erreur
    	var contentobj = document.getElementById(that.contentid);
	    if (contentobj)
	      {
        	content.innerHTML = contentobj.innerHTML; 
	      }
		    
		//Box contenant l'image permettant d'etirer le popup
    	var rdiv = new PumPopUp.pumSubBox( that.pumCurrWidth -((PumPopUp.pumIsFirefox)?8:8),that.pumCurrHeight-((PumPopUp.pumIsFirefox)?12:8),7,7,'',that.cid + '_rs');
    	rdiv.innerHTML='<img src="' + that.dirimg +'/resize.gif" width="7" height="7">';
       	rdiv.style.cursor='move';
    
    	outerdiv.appendChild(titlebar);
    	outerdiv.appendChild(content);
    	outerdiv.appendChild(rdiv);
    	
    	that.pumPopuperreurouterdiv = outerdiv;		    
		}        
}
//fin constructeur

//Active le popup
PumPopUp.prototype.show = function () 
		{
		document.body.appendChild(this.pumPopuperreurouterdiv);

		this.bxprinc = document.getElementById(this.cid + '_b');
		this.bxtitle = document.getElementById(this.cid + '_t');
		this.bxcontent = document.getElementById(this.cid + '_c');
		this.bxrs = document.getElementById(this.cid + '_rs');
		this.bxbtt = document.getElementById(this.cid + '_btt');
		
		if (this.afficheboutons)
		{
			this.bxmin = document.getElementById(this.cid + '_min');
			this.bxmax = document.getElementById(this.cid + '_max');
			this.bxcls = document.getElementById(this.cid + '_cls');
		}
		
	 	this.bxsel = document.getElementById(this.cid + '_selectc');
		this.bxtitletext = document.getElementById(this.cid + '_titletext');

		if (this.afficheboutons)
		{
			//Masque la totalité du popup
			PumPopUp.addEvent(this.bxcls, 'click', PumPopUp.pumHidebox);
	
			//Ouverture / fermeture du popup (sauf la barre de titre)
			PumPopUp.addEvent(this.bxmin, 'click', PumPopUp.pumMinimize);
			PumPopUp.addEvent(this.bxmax, 'click', PumPopUp.pumRestore);
		}
		
		//Dimensionnement du popup
		PumPopUp.addEvent(this.bxrs, 'mousedown', PumPopUp.pumStartRS);
		
		//Déplacement du popup
		PumPopUp.addEvent(this.bxtitle, 'mousedown', PumPopUp.pumGrab_id);
		PumPopUp.addEvent(this.bxtitle, 'mouseup', PumPopUp.pumStopdrag);
		
	    this.pumHideShowSelect();	
	    
	    //Stockage dans une variable globale du popup
	    PumPopUp.setPopupRef(this);
		}

PumPopUp.pumIs_firefox = function()
    {
    return navigator.userAgent.toLowerCase().indexOf('firefox') + 1;
    }

PumPopUp.pumIs_ie = function()
    {
    return ( /msie/i.test(navigator.userAgent) &&
    		   !/opera/i.test(navigator.userAgent) );
    }

PumPopUp.pumIs_ie5 = function()
    {
    return ( PumPopUp.pumIs_ie() && /msie 5\.0/i.test(navigator.userAgent) );
    }

		
PumPopUp.pumHidebox = function(evt)
{
    var popup = PumPopUp.getPopupRef();
	if (popup.pumW3c)
		{
		popup.bxprinc.style.display = 'none';
		popup.pumHideShowSelect();
		}
}
	
PumPopUp.pumShowbox = function(evt)
{
    var popup = PumPopUp.getPopupRef();
    
    if (! popup.bxprinc)
     {
         popup.show();
     }
	popup.bxprinc.style.display = 'block';
	popup.zIndex = ++ popup.cid.pumZdx;

    popup.pumHideShowSelect();	
}

PumPopUp.pumMinimize = function(evt)
{
    var popup = PumPopUp.getPopupRef();
	
	if (popup.pumW3c && ! popup.pumIsMinimize)
		{
		popup.heightbefmini = popup.bxprinc.style.height;
		popup.bxprinc.style.height = (popup.pumIe5)? '28px':'24px';
		popup.bxcontent.style.display = 'none';
		popup.bxrs.style.display = 'none';

		if (! popup.pumIsMinimize)
			{
			popup.pumIsMinimize = true;
			popup.pumCurrHeight = (popup.pumIe5)? 28:24;
			}
		}
	if (!popup.pumIsFirefox)
	{
	setTimeout('PumPopUp.pumNs6bugfix()',100);
}
}

PumPopUp.pumRestore = function(evt)
{
    var popup = PumPopUp.getPopupRef();
		
	if (popup.pumW3c && popup.pumIsMinimize)
	{
    	var h = popup.heightbefmini;
    	popup.bxprinc.style.height = h ;
    	popup.bxcontent.style.display = 'block';
    	popup.bxrs.style.display = 'block'; 
    	if (popup.pumIsMinimize)
    		{
    		popup.pumIsMinimize = false;	
    		popup.pumCurrHeight = h;
    		}
    	if (!popup.pumIsFirefox)
    	{
    	setTimeout('PumPopUp.pumNs6bugfix()',100);
	}
}
}

PumPopUp.pumNs6bugfix = function()
	{
	self.resizeBy(0,1);
	self.resizeBy(0,-1);
	}

/**
 * Caractères blancs :
 *  "\t" TAB \u0009
 *  "\n" LF  \u000A
 *  "\r" CR  \u000D
 *  " "  SPC \u0020
 * 
 *  "\s" n'est pas utilisé car il contient, entre autres, des espaces insécables
 */
/**
 * Détermine un noeud texte contient uniquement des caractères blancs.
 *
 * @param nod  un noeud qui implémente l'interface |CharacterData| interface 
 *             (un noeud  |Text|, |Comment|, ou |CDATASection| )
 * @return     True si tout le texte contenu dans le  |nod| est blanc
 */
PumPopUp.pumIs_all_ws = function(nod)
{
  // Use ECMA-262 Edition 3 String and RegExp features
  return !(/[^\t\n\r ]/.test(nod.data));
}


/**
 * Determine if a node should be ignored by the iterator functions.
 * Détermine si un noeud doit être ignoré dans les itérations
 * @param nod  un objet qui implémente l'interface |Node| de Dom1
 * @return     true si le noeud est :
 *                1) un noeud |Text| composé de blancs
 *                2) un noeud |Comment| 
 *             false sinon
 */
PumPopUp.pumIs_ignorable = function(nod)
{
  return ( nod.nodeType == 8) || // A comment node
         ( (nod.nodeType == 3) && PumPopUp.pumIs_all_ws(nod) ); // a text node, all ws
}

/**
 * Version de |previousSibling| qui ignore les noeuds qui sont blancs ou
 * qui sont de type |Comment|.
 */
PumPopUp.pumNode_before = function(sib)
{
  while ((sib = sib.previousSibling)) 
     {
     if (! PumPopUp.pumIs_ignorable(sib)) 
       {
       return sib;
       }
     }
  return null;
}

/**
 * Version de |nextSibling| qui ignore les noeuds qui sont blancs ou
 * qui sont de type |Comment|.
 */
PumPopUp.pumNode_after = function(sib)
{
  while ((sib = sib.nextSibling)) 
   {
    if (! PumPopUp.pumIs_ignorable(sib)) 
       {
         return sib;
       }
   }
  return null;
}

/**
 * Version de |lastChild| qui ignore les noeuds qui sont blancs ou
 * qui sont de type |Comment|.
 */
PumPopUp.pumLast_child = function(par)
{
  var res = par.lastChild;
  while (res)
       {
       if (! PumPopUp.pumIs_ignorable(res)) 
         {
         return res;
         }
       res = res.previousSibling;
        }
  return null;
}

/**
 * Version de |firstChild| qui ignore les noeuds qui sont blancs ou
 * qui sont de type |Comment|.
 */
PumPopUp.pumFirst_child = function(par)
{
  var res = par.firstChild;
  while (res)
      {
       if (! PumPopUp.pumIs_ignorable(res)) 
         {
         return res;
         }
       res = res.nextSibling;
         }
  return null;
}

/**
 * Version de |data| qui ignore les blancs en début et fin et normalise
 * tous les blancs en un seul caractère blanc
 */
PumPopUp.pumData_of = function(txt)
{
  var data = txt.data;
  // Use ECMA-262 Edition 3 String and RegExp features
  data = data.replace(/[\t\n\r ]+/g, " ");
  if (data.charAt(0) == " ")
    {
    data = data.substring(1, data.length);
    }
  if (data.charAt(data.length - 1) == " ")
     {
     data = data.substring(0, data.length - 1);
     }
  return data;
}

PumPopUp.pumTrackmouse  = function(evt)
	{
    var popup = PumPopUp.getPopupRef();
	
	popup.pumMx = PumPopUp.pumGetX(evt);
	popup.pumMy = PumPopUp.pumGetY(evt);
 	popup.pumMovepopup(evt);

	if ((popup.pumCurrIDb != null)|| (popup.pumCurrRS != null)) 
		{
		return false;
		}
	}


PumPopUp.prototype.pumMovepopup = function(evt)
	{
	if (( this.pumCurrIDb != null) && this.pumW3c)
		{
		this.pumCurrX = this.pumMx + this.pumXoff;
		this.pumCurrY = this.pumMy + this.pumYoff;
		this.pumCurrIDb.style.left = this.pumCurrX  + 'px';
		this.pumCurrIDb.style.top = this.pumCurrY + 'px';

		if (! this.pumIsMinimize)
			{
			this.pumCurrWidth = this.pumCurrIDb.offsetWidth;
			this.pumCurrHeight = this.pumCurrIDb.offsetHeight;
			}
		else
			{
			this.pumCurrHeight = (this.pumIe5)? 28:24;
			}
		}
	if ((this.pumCurrRS != null) && this.pumW3c)
		{
		var rx = this.pumMx + this.pumRsxoff;
		var ry = this.pumMy + this.pumRsyoff;

		this.pumCurrRS.style.left = Math.max(rx,((this.pumIe5)?88:92)) + 'px';
		this.pumCurrRS.style.top = Math.max(ry,((this.pumIe5)?68:72)) + 'px';
		this.bxprinc.style.width = Math.max(rx+((this.pumIe5)?12:8),100) + 'px';
		this.bxprinc.style.height=Math.max(ry+((this.pumIe5)?12:8),80)+'px';
		this.bxtitle.style.width = Math.max(rx+((this.pumIe5)?4:3),((this.pumNs6)?95:92)) + 'px';
		this.bxbtt.style.left = parseInt(this.bxtitle.style.width)-48 + 'px';
		this.bxcontent.style.width = Math.max(rx-((this.pumIe5)?-5:5),((this.pumIe5)?92:87)) + 'px';
		this.bxcontent.style.height = Math.max(ry-((this.pumIe5)?24:28),44) + 'px';

		var ex = PumPopUp.pumGetX(evt);
		var ey = PumPopUp.pumGetY(evt);
		this.pumXoff = parseInt(this.bxprinc.style.left) - ex;
		this.pumYoff = parseInt(this.bxprinc.style.top) - ey;
		this.pumCurrX = this.pumMx + this.pumXoff;
		this.pumCurrY = this.pumMy + this.pumYoff;

		this.pumCurrWidth = Math.max(rx + ((this.pumIe5)?12:8),100);
		this.pumCurrHeight = Math.max(ry + ((this.pumIe5)?12:8),80);
		}
     this.pumHideShowSelect();
}


/**
 * Retourne l'abscisse du curseur 
 * @param event
 * @return abscisse du curseur
 */
PumPopUp.pumGetX = function(evt)
{
    var posX;
    if (window.event)
       {
           if (window.event.clientX)
               {
               posX =  window.event.clientX + document.body.scrollLeft;
               }
       }
    else if (evt.pageX)
      {
          posX = evt.pageX ;
      }

     return posX;
}

/**
 * Retourne l'ordonnée du curseur 
 * @param event
 * @return abscisse du curseur
 */
PumPopUp.pumGetY = function(evt)
{
    var posY;
    if (window.event)
       {
           if (window.event.clientY)
               {
               posY =  window.event.clientY + document.body.scrollTop;
               }
       }
    else if (evt.pageY)
      {
          posY = evt.pageY ;
      }
     
     return posY;
}

/**
 * Fonction exécutée pour redimensionner le popup
 * @param evt
 * @return false
 */
PumPopUp.pumStartRS = function(evt)
	{
    var popup = PumPopUp.getPopupRef();
	PumPopUp.addEvent(document,'mousemove',PumPopUp.pumTrackmouse);
	PumPopUp.addEvent(document,'mouseup',PumPopUp.pumStopTrackmouse);
		
	var ex = PumPopUp.pumGetX(evt);
	var ey = PumPopUp.pumGetY(evt);

	popup.pumRsxoff = parseInt(popup.bxrs.style.left) - ex;
	popup.pumRsyoff = parseInt(popup.bxrs.style.top) - ey;
	popup.pumCurrRS = popup.bxrs;

	if(popup.pumNs6)
		{
		popup.bxcontent.style.overflow = 'hidden';
		}

	return false;
	}

PumPopUp.pumStopdrag = function(evt)
	{
    var popup = PumPopUp.getPopupRef();
	
	popup.pumCurrIDb = null;
	if (!popup.pumIsFirefox)
	{
	PumPopUp.pumNs6bugfix();
	}
	PumPopUp.removeEvent(document,'mousemove',PumPopUp.pumTrackmouse);
	PumPopUp.removeEvent(document,'mouseup',PumPopUp.pumStopTrackmouse);
	}

PumPopUp.pumStopTrackmouse = function()
{
    var popup = PumPopUp.getPopupRef();
	popup.pumCurrRS = null;
	PumPopUp.removeEvent(document,'mousemove',PumPopUp.pumTrackmouse);
	PumPopUp.removeEvent(document,'mouseup',PumPopUp.pumStopTrackmouse);	
}

PumPopUp.pumGrab_id= function(evt)
	{
    var popup = PumPopUp.getPopupRef();

	if (popup.pumW3c)
		{
		var bx = popup.bxprinc.style;
		var maxz = PumPopUp.pumFindMaxZindex();
		bx.zIndex = maxz + 1;
		}
	
		var ex = PumPopUp.pumGetX(evt);
		var ey = PumPopUp.pumGetY(evt);
		
		popup.pumXoff = parseInt(popup.bxprinc.style.left) - ex;
		popup.pumYoff = parseInt(popup.bxprinc.style.top) - ey;
		popup.pumCurrIDb = popup.bxprinc;

	PumPopUp.addEvent(document,'mousemove',PumPopUp.pumTrackmouse);
	PumPopUp.addEvent(document,'mouseup',PumPopUp.pumStopTrackmouse);

    return false;
	}

PumPopUp.pumSubBox = function(x,y,w,h,bgc,id)
	{
	var v = PumPopUp.pumCreateElement('div');
	v.setAttribute('id',id); 
	v.style.position = 'absolute';
	v.style.left = x + 'px';
	v.style.top = y + 'px';
	v.style.width = w + 'px';
	v.style.height = h + 'px';
	v.style.backgroundColor = bgc;
	v.style.visibility = 'visible';
	v.style.padding = '0px 0px 0px 0px';
	v.style.margin = '0px 0px 0px 0px';
	return v;
	}

/**
 * Determine si le popup doit masquer un élément 
 * @param _posx abscisse
 * @param _posy ordonnée
 * @param _width largeur
 * @param _width hauteur
 * @return 
 */
PumPopUp.prototype.pumIsToHide = function(_posx,_posy,_width,_height)
	{ 
	var bIsToHide = true;
	if ( _posx > (this.pumCurrX + this.pumCurrWidth) || (_posx + _width) < this.pumCurrX )
		{
		bIsToHide = false;
		}
	if (_posy > (this.pumCurrY + this.pumCurrHeight) || (_posy + _height) < this.pumCurrY )
		{
		bIsToHide = false;
		}
	if (this.bxprinc.style.display == 'none')
	   {
	    bIsToHide = false;
	   }
return bIsToHide;
}

PumPopUp.pumIsTRNode = function(obj)
{
	var tagName = obj.tagName;
	return tagName == "TR" || tagName == "tr" || tagName == "Tr" || tagName == "tR";
}

//Retourne la largeur du premier bloc div ancetre
PumPopUp.pumGetWidthDivAncetre = function(objid,defaultwidth)
    {
    var maxAncetres = 0;
    var ancetre = document.getElementById(objid);
    if (objid != 'null' || ancetre != null)
    	{
    	while (! PumPopUp.pumIsDiv(ancetre) && maxAncetres < 4)
    		{
    		ancetre = ancetre.parentNode;
    		}
    	if (PumPopUp.pumIsDiv(ancetre))
    	   {
    		return PumPopUp.pumGetWidth(ancetre);
    	   }
    	}
    return defaultwidth;
    }

//Retourne la hauteur du premier bloc div ancetre
PumPopUp.pumGetHeightDivAncetre = function(objid,defaultheight)
    {
    var maxAncetres = 0;
    var ancetre = document.getElementById(objid);
    if (objid != 'null' || ancetre != null)
    	{
    	while (! PumPopUp.pumIsDiv(ancetre) && maxAncetres < 4)
    		{
    		ancetre = ancetre.parentNode;
    		}
    	if (PumPopUp.pumIsDiv(ancetre))
    	  {
    		return PumPopUp.pumGetHeight(ancetre);
    	  }
    	}
    
    return defaultheight;
    }

//Test si un objet est un bloc div
PumPopUp.pumIsDiv = function(obj)
{
if (obj != null)
	{
	var tagName = obj.tagName;
	if (tagName == 'DIV' || tagName == 'div' )
	  {
	  return true;
	  }
	}
return false;
}

//Test si un objet est un li
PumPopUp.pumIsLi = function(obj)
{
if (obj != null)
	{
	var tagName = obj.tagName;
	if ( typeof tagName == 'undefined')
	   {
	   return false;
	   }
	if (tagName == 'LI' || tagName == 'li' || tagName == 'Li' || tagName == 'lI' )
	  {
	  return true;
	  }
	}
return false
}

// Retourne la hauteur d'un element HTML
PumPopUp.pumGetHeight = function(obj)
{
if (obj != null)
	{
	var height = obj.offsetHeight;
	if (height > 0 || ! PumPopUp.pumIsTRNode (obj))
	    {
		return height;
	    }
	if (! PumPopUp.pumFirst_child(obj))
	    {
		return 0;
	    }
	// utilise la hauteur du premier fils
	return PumPopUp.pumFirst_child(obj).offsetHeight;
	}
return 0;
}

// Retourne la largeur d'un element HTML
PumPopUp.pumGetWidth = function(obj)
{
if (obj != null)
	{
	var width = obj.offsetWidth;
	if (width > 0 || ! PumPopUp.pumIsTRNode(obj))
	   {
		return width;
	   }
	if (! PumPopUp.pumFirst_child(obj))
	   {
		return 0;
	   }
	// utilise la hauteur du premier fils
	return PumPopUp.pumFirst_child(obj).offsetWidth;
	}
return 0;
}

//PosX
PumPopUp.pumGetposxbyid = function(id,defaultx)
{
var obj = document.getElementById(id);
if (obj != null)
  {
	return PumPopUp.pumGetposx(obj);
  }
else
   {
	return defaultx;
   }
}

PumPopUp.pumGetposx = function(y)
{
	var _posx = 0;
	if (y.offsetParent)
	  {
		while (y.offsetParent)
		 {
			_posx += y.offsetLeft;
			y = y.offsetParent;
		 }
	}
	else if (y.x)
	  { 
		_posx += y.x;
	 }
	return _posx;
 }

//PosY 
PumPopUp.pumGetposybyid = function(id,defaulty)
{
var obj = document.getElementById(id);
if (obj != null)
   {
	return PumPopUp.pumGetposy(obj);
   }
else
   {
	return defaulty;
   }
}

PumPopUp.pumGetposy = function(y)
{
	var _posy  = 0;
	if (y.offsetParent)
	  {
		while (y.offsetParent)
		 {
			_posy += y.offsetTop;
			y = y.offsetParent;
		   }
	    }
	else if (y.y)
	    { 
		_posy += y.y;
	    }
	return _posy;
 }
 
 //Cache & affiche les elements select,iframe et object si necessaire
PumPopUp.prototype.pumHideShowSelect = function()
{
this.pumHideShowControl("SELECT");
/*@cc_on @*/
/*@if (@_jscript_version >= 5.5)
@else @*/
this.pumHideShowControl("IFRAME");
/*@end @*/
this.pumHideShowControl("OBJECT");
}
  

//Affiche ou masque les éléments selon qu'ils sont placés ou non
//sous le popup
PumPopUp.prototype.pumHideShowControl = function(tagName)
{
	 if (this.pumIe)
	 	{
		if ( ! this.pum_overlap)
			{
			this.pum_overlap = new Array ();
			}
					
		var selects = document.getElementsByTagName(tagName); 
			
		for(x=0; x < selects.length; x++)
			{
			var obj = selects[x];		
			var _posx = PumPopUp.pumGetposx(obj);
			var _posy = PumPopUp.pumGetposy(obj);    	
			var _width = obj.offsetWidth;
			var _height = obj.offsetHeight; 
		
			if( this.pumIsToHide(_posx, _posy ,_width, _height)) 
				{
				//Si l'objet est deja masque, on ne fait rien	
		  		if (obj.style.visibility == "hidden")
		  			{
					continue; 
					}
				obj.style.visibility='hidden'; 
					//Ajout de l'objet dans la liste des objets masque par le popup
					this.pum_overlap[this.pum_overlap.length] = obj;
				}
				else
					{
					if (PumPopUp.pumInList(this.pum_overlap,obj))
						{
						obj.style.visibility = 'visible'; 
						this.pum_overlap = PumPopUp.pumRemovefromlist(this.pum_overlap,obj);
						}
					}
		    	}
			}
}

PumPopUp.pumInList = function(liste,obj)
{
	for(i=0; i < liste.length; i++)
	{
	if (liste[i] == obj)
		return true;
	}
	return false;
}

PumPopUp.pumRemovefromlist = function(liste,obj)
{
var temp=new Array();
for(i=0; i < liste.length; i++)
	{
	if (liste[i] != obj)
		temp[temp.length] = liste[i];
	}
return temp;
}

PumPopUp.pumCreateElement = function(type, parent)
{
	var el = null;
	if (document.createElementNS) {
		// use the XHTML namespace; IE won't normally get here unless
		// _they_ "fix" the DOM2 implementation.
		el = document.createElementNS("http://www.w3.org/1999/xhtml", type);
	} else {
		el = document.createElement(type);
	}
	if (typeof parent != "undefined") {
		parent.appendChild(el);
	}
	return el;
};


PumPopUp.pumFindMaxZindex = function()
{
	var allElems = document.getElementsByTagName ? document.getElementsByTagName("*"):document.all; 
	var maxZIndex = 0;
	for(var i=0;i<allElems.length;i++) 
		{
			var elem = allElems[i];
			var cStyle = null;
			if (elem.currentStyle)
			 	{
			 	cStyle = elem.currentStyle;
			 	}
			else if (document.defaultView && document.defaultView.getComputedStyle) 
				{
				cStyle = document.defaultView.getComputedStyle(elem,"");
				}
			var sNum;
			if (cStyle) 
				{
				sNum = Number(cStyle.zIndex);
				}
			else
				{
				sNum = Number(elem.style.zIndex);
				}
			if (!isNaN(sNum)) 
				{
				maxZIndex = Math.max(maxZIndex,sNum);
				}
		}
	return maxZIndex;
}

	
	

/*
 * Copyright : DGCP
 * Contributeurs :
 * Bureau 3D - DGCP
 * Date de creation : 03/09/2007
 * Affiche un Popup Windows DHTML Redimensionnable - deplacable - qui permet d'afficher 
 * des documents PDF
*/

PumPdfPopup.addEvent = function(el, evname, func)
{
	if (el.attachEvent) { // IE
		el.attachEvent("on" + evname, func);
	} else if (el.addEventListener) { // Gecko / W3C
		el.addEventListener(evname, func, true);
	} else {
		el["on" + evname] = func;
	}
};

PumPdfPopup.removeEvent = function(el, evname, func) {
	if (el.detachEvent) { // IE
		el.detachEvent("on" + evname, func);
	} else if (el.removeEventListener) { // Gecko / W3C
		el.removeEventListener(evname, func, true);
	} else {
		el["on" + evname] = null;
	}
};

PumPdfPopup.objectpopuppdf = function()
{
	if (window._dynarch_PumPdfPopup)
				{
				window._dynarch_PumPdfPopup.show();
				}
};

PumPdfPopup.getPopupRef = function()
{
  return window._dynarch_PumPdfPopup;
}

PumPdfPopup.setPopupRef = function(popup)
{
  window._dynarch_PumPdfPopup = popup;
}

//Contructeur de l'objet 
function PumPdfPopup(pnearid,pcid,pbgcolor,ptextcolor,pfontstyleset,ptitle,
                    ptitlecolor,ptitletextcolor,pbordercolor,pscrollcolor,pdirimg,
                    pmaxwidth,pmaxheight,
                    pprefixurlpdf,ppdfs)
{
    var that = this; //Contournement permettant d'accéder à this dans les fonctions internes
    
	this.pumpdfW3c = (document.getElementById) ? true : false;
	this.pumpdfIe5 = PumPdfPopup.pumpdfIs_ie5();
	this.pumpdfIe = PumPdfPopup.pumpdfIs_ie();
	this.pumpdfIsFirefox = PumPdfPopup.pumpdfIs_firefox();
	this.pumpdfNs6 = (this.pumpdfW3c && (navigator.appName=="Netscape"))? true: false;
	
	this.pumpdf_overlap = null; //liste des objets masqués
	this.pumpdfCurrIDb = null;
	this.pumpdfXoff = 0;
	this.pumpdfYoff = 0;
	this.pumpdfCurrRS = null;
	this.pumpdfRsxoff = 0;
	this.pumpdfRsyoff = 0;
	this.pumpdfZdx = 1;
	this.pumpdfMx = 0;
	this.pumpdfMy = 0;
	this.pumpdfIsMinimize = false;
	this.pumpdfCurrX = 0;
	this.pumpdfCurrY = 0;
	this.pumpdfCurrWidth = 0;
	this.pumpdfCurrHeight = 0;
	this.pumpdfPopupouterdiv = null;

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

    this.pdfs = ppdfs.split('#');
    this.pdftitles = ppdfs.split('#');
    this.numpdf = this.pdftitles.length ; //nb de pdf affiché par le popup
    this.numpdfactif = 0; //numéro du pdf actif
    this.titlepdfactif = this.pdftitles[0]; //titre du pdf actif

    this.prefixeurlpdf = pprefixurlpdf;

	this.nearid = pnearid;
	this.cid = pcid;
	this.pmaxwidth = pmaxwidth;
	this.bgcolor = pbgcolor;
	this.textcolor = ptextcolor;
	this.fontstyleset = pfontstyleset;
	this.titlecolor = ptitlecolor;
	this.titletextcolor = ptitletextcolor; 	
	
	this.bordercolor = pbordercolor;
	this.scrollcolor = pscrollcolor;

	this.dirimg = pdirimg;
	this.maxwidth = pmaxwidth;

	this.maxheight = pmaxheight;

	initPositionAndWidth();
	initOuterDiv();

	function initPositionAndWidth()
		{
		var wh = new Array();
		var wh = pumpdfCalculWidthPopup();
		var xy = pumpdfCalculPositionPopup(that.nearid,wh);
		that.pumpdfCurrX = xy[0];
		that.pumpdfCurrY = xy[1];
		that.pumpdfCurrWidth = wh[0];
		that.pumpdfCurrHeight = wh[1];
		}

	function initOuterDiv()
		{

		//Box principale
		var outerdiv = new PumPdfPopup.pumpdfSubBox(that.pumpdfCurrX,that.pumpdfCurrY,that.pumpdfCurrWidth,
		                                            that.pumpdfCurrHeight,that.bordercolor,that.cid + '_b');
		outerdiv.style.borderStyle = "outset";
		outerdiv.style.borderWidth = "2px";
		outerdiv.style.borderColor = that.bordercolor;
		outerdiv.style.zIndex = ++ that.pumpdfZdx;

		//Box contenant le titre
		var tw,th;
		tw = (that.pumpdfIe5)?that.pumpdfCurrWidth-8:that.pumpdfCurrWidth-5;
		th = (that.pumpdfIe5)?that.pumpdfCurrHeight+4:that.pumpdfCurrHeight-4;
		
		//Box contenant le titre
		var titlebar = new PumPdfPopup.pumpdfSubBox(2,2,tw,20,that.titlecolor,that.cid + '_t');
		titlebar.style.overflow = "hidden";
		titlebar.style.cursor = "default";
	
		var titlebartext = '<span id="' + that.cid + '_titletext" style="position:absolute; left:3px; top:1px; font:bold 10pt sans-serif; color:';
		titlebartext += that.titletextcolor + '; height:18px; overflow:hidden; clip-height:16px;">' + ptitle + '</span>';
		titlebartext += '<span id="' + that.cid + '_btt" style="position:absolute; width:48px; height:16px;';
		titlebartext += 'left:'+(tw-48)+'px; top:2px;">';
		titlebartext += '<img src="' + that.dirimg +'/min.gif" width="16" height="16" alt="Réduire" title="Réduire" id="' + that.cid + '_min">';
		titlebartext += '<img src="' + that.dirimg +'/max.gif" width="16" height="16" alt="Agrandir" title="Agrandir" id="' + that.cid + '_max">';
		/*titlebartext += '<img src="' + that.dirimg +'/close.gif" width="16" height="16" alt="Fermer" title="Fermer" id="'  + that.cid + '_cls"></span>';*/
		titlebartext += '<span alt="Fermer" title="Fermer" id="'  + that.cid + '_cls">x</span></span>';
		
		titlebar.innerHTML = titlebartext;
	
		//Box contenant les boutons de choix du pdf à afficher
		tw=(that.pumpdfIe5)?that.pumpdfCurrWidth-7:that.pumpdfCurrWidth-13;
		th=(that.pumpdfIe5)?that.pumpdfCurrHeight-36:that.pumpdfCurrHeight-36;
		var selectcontent = new PumPdfPopup.pumpdfSubBox(2,24,tw,20,that.bgcolor,that.cid + '_selectc');
		selectcontent.style.borderColor = that.bordercolor;
		selectcontent.style.borderStyle = "inset";
		selectcontent.style.borderWidth = "2px";
		selectcontent.style.overflow = "auto";
		selectcontent.style.padding = "0px 2px 0px 4px";
		selectcontent.style.font = that.fontstyleset;
		selectcontent.style.color = that.textcolor;
		
		//Box contenant le contenu de la popup
		tw=(that.pumpdfIe5)?that.pumpdfCurrWidth-7:that.pumpdfCurrWidth-13;
		th=(that.pumpdfIe5)?that.pumpdfCurrHeight-64:that.pumpdfCurrHeight-64;
		
		var content=new PumPdfPopup.pumpdfSubBox(2,54,tw,th,that.bgcolor,that.cid+'_c');
		content.style.borderColor = that.bordercolor;
		content.style.borderStyle = "inset";
		content.style.borderWidth = "2px";
		content.style.overflow = "hidden";
		content.style.padding = "0px 2px 0px 4px";
		content.style.font = that.fontstyleset;
		content.style.color = that.textcolor;
		if (that.pumpdfIe5) 
    		 {
    		 content.style.scrollbarBaseColor=that.scrollcolor;
    		 }

        var pdfdiv = PumPdfPopup.pumpdfCreateElement('DIV');
   	    pdfdiv.setAttribute('id','objectpdfdivid' ); 
	    pdfdiv.style.width = '100%';
	    pdfdiv.style.height = '100%';
	    pdfdiv.style.display = 'block';
	
	    var objectel = PumPdfPopup.pumpdfCreateElement('object');

        objectel.setAttribute('width','100%');
        objectel.setAttribute('height','100%');
        objectel.setAttribute('id','objectpdfid');  
        objectel.setAttribute('standby','Chargement...');
        objectel.setAttribute('type','application/pdf');

		//Box contenant l'image permettant d'etirer le popup
		var rdiv=new PumPdfPopup.pumpdfSubBox(that.pumpdfCurrWidth - ((that.pumpdfIsFirefox)?8:8),that.pumpdfCurrHeight-((that.pumpdfIsFirefox)?12:8),7,7,'',that.cid+'_rs');
		
		rdiv.innerHTML='<img src="' + that.dirimg +'/resize.gif" width="7" height="7">';
	   	rdiv.style.cursor='move';

		outerdiv.appendChild(titlebar);
		outerdiv.appendChild(selectcontent);
		outerdiv.appendChild(content);
		content.appendChild(pdfdiv);
		pdfdiv.appendChild(objectel);
		outerdiv.appendChild(rdiv);
		
		that.pumpdfPopupouterdiv = outerdiv;
		}
	
	//Calcule la taille du popup a utiliser en fonction de son contenu
	function pumpdfCalculWidthPopup()
		{
		var defaultw = 400;
		var defaulth = 540;
		var result = new Array();
		result[0] = defaultw;
		result[1] = defaulth ;
		return result;
		}

	//calcul de la position du popup
	function pumpdfCalculPositionPopup(nearid,wh)
	{
		var maxscreenh = 540;
		var maxscreenw = 900;
		var defaultx = 10;
		var defaulty = 10;
		var xy= new Array();
		var firstX = PumPdfPopup.pumpdfGetposxbyid(nearid,defaultx);
		var firstY = PumPdfPopup.pumpdfGetposxbyid(nearid,defaulty);
		xy[1] = firstY;
		xy[0] = firstX;
		return xy;
	}	
	
}
//fin constructeur	

//Active le popup
PumPdfPopup.prototype.show = function () 
		{
		document.body.appendChild(this.pumpdfPopupouterdiv);
		
		this.bxprinc = document.getElementById(this.cid + '_b');
		this.bxtitle = document.getElementById(this.cid + '_t');
		this.bxcontent = document.getElementById(this.cid + '_c');
		this.bxrs = document.getElementById(this.cid + '_rs');
		this.bxbtt = document.getElementById(this.cid + '_btt');
		this.bxmin = document.getElementById(this.cid + '_min');
		this.bxmax = document.getElementById(this.cid + '_max');
		this.bxcls = document.getElementById(this.cid + '_cls');
	 	this.bxsel = document.getElementById(this.cid + '_selectc');
		this.bxtitletext = document.getElementById(this.cid + '_titletext');
        this.bxpdf = document.getElementById('objectpdfdivid');
	    this.objectpdf = document.getElementById('objectpdfid') ;
	    
	    //Masque la totalité du popup
	    PumPdfPopup.addEvent(this.bxcls, 'click', PumPdfPopup.pumpdfHidebox);
	
		//Ouverture / fermeture du popup (sauf la barre de titre)
		PumPdfPopup.addEvent(this.bxmin, 'click', PumPdfPopup.pumpdfMinimize);
		PumPdfPopup.addEvent(this.bxmax, 'click', PumPdfPopup.pumpdfRestore);
		
		//Dimensionnement du popup
		PumPdfPopup.addEvent(this.bxrs, 'mousedown', PumPdfPopup.pumpdfStartRS);
		
		//Déplacement du popup
		PumPdfPopup.addEvent(this.bxtitle, 'mousedown', PumPdfPopup.pumpdfGrab_id);
		PumPdfPopup.addEvent(this.bxtitle, 'mouseup', PumPdfPopup.pumpdfStopdrag);
		
	    this.pumpdfHideShowSelect();	
	    
	    //Stockage dans une variable globale du popup
	    PumPdfPopup.setPopupRef(this);
	    
	    this.createPdfcall(this.numpdfactif);   
	    PumPdfPopup.pumpdfDisplayselectedpdf(this.numpdfactif); 	    
		}


PumPdfPopup.prototype.createPdfcall = function(numpdf)
{          
    var pdfdivselect = PumPdfPopup.pumpdfCreateElement('DIV',this.bxsel);
   	pdfdivselect.setAttribute('id','select' + this.cid); 
	pdfdivselect.style.display = 'block';		    
	
	for (var t = 0; t < this.numpdf ;t++)
    	{
    	var objectel = PumPdfPopup.pumpdfCreateElement('button',pdfdivselect);
        objectel.setAttribute('id', 'button' + t);
        if (t == this.numpdfactif)
            {
            objectel.setAttribute('disabled','disabled');
            }
        objectel.setAttribute('style','margin-right: 4px;');
        objectel.setAttribute('title',this.pdftitles[t]);   
        objectel.innerHTML = t + 1 ;
        objectel.onclick = new Function("PumPdfPopup.pumpdfDisplayselectedpdf('" + t + "');");
    	}
       
    var datapdf = this.prefixeurlpdf + this.pdfs[numpdf];
    this.objectpdf.setAttribute('data', datapdf);   
}


//Cache & affiche les elements select,iframe et object si necessaire
PumPdfPopup.prototype.pumpdfHideShowSelect = function()
			{
			this.pumpdfHideShowControl("SELECT");
			/*@cc_on @*/
			/*@if (@_jscript_version >= 5.5)
			@else @*/
			this.pumpdfHideShowControl("IFRAME");
			/*@end @*/
		//	this.pumpdfHideShowControl("OBJECT");
			}

//Affiche ou masque les éléments selon qu'ils sont placés ou non
//sous le popup
PumPdfPopup.prototype.pumpdfHideShowControl = function(tagName)
{
	 if (this.pumpdfIe)
	 	{
		if ( ! this.pumpdf_overlap)
			{
			this.pumpdf_overlap = new Array ();
			}
					
		var selects = document.getElementsByTagName(tagName); 
			
		for(x=0; x < selects.length; x++)
			{
			var obj = selects[x];		
			var _posx = PumPdfPopup.pumpdfGetposx(obj);
			var _posy = PumPdfPopup.pumpdfGetposy(obj);    	
			var _width = obj.offsetWidth;
			var _height = obj.offsetHeight; 
		
			if( this.pumpdfIsToHide(_posx, _posy ,_width, _height)) 
				{
				//Si l'objet est deja masque, on ne fait rien	
		  		if (obj.style.visibility == "hidden")
		  			{
					continue; 
					}
				obj.style.visibility='hidden'; 
					//Ajout de l'objet dans la liste des objets masque par le popup
					this.pumpdf_overlap[this.pumpdf_overlap.length] = obj;
				}
				else
					{
					if (PumPdfPopup.pumpdfInList(this.pumpdf_overlap,obj))
						{
						obj.style.visibility = 'visible'; 
						this.pumpdf_overlap = PumPdfPopup.pumpdfRemovefromlist(this.pumpdf_overlap,obj);
						}
					}
		    	}
			}
}

/**
 * Determine si le popup doit masquer un élément 
 * @param _posx abscisse
 * @param _posy ordonnée
 * @param _width largeur
 * @param _width hauteur
 * @return 
 */
PumPdfPopup.prototype.pumpdfIsToHide = function(_posx,_posy,_width,_height)
	{ 
	var bIsToHide = true;
	if ( _posx > (this.pumpdfCurrX + this.pumpdfCurrWidth) || (_posx + _width) < this.pumpdfCurrX )
		{
		bIsToHide = false;
		}
	if (_posy > (this.pumpdfCurrY + this.pumpdfCurrHeight) || (_posy + _height) < this.pumpdfCurrY )
		{
		bIsToHide = false;
		}
	if (this.bxprinc.style.display == 'none')
	   {
	    bIsToHide = false;
	   }
return bIsToHide;
}

//Teste si un objet est dans une liste d'objets
PumPdfPopup.pumpdfInList = function(liste,obj)
{
	for(i=0; i < liste.length; i++)
		{
		if (liste[i] == obj)
			{
			return true;
			}
		}
	return false;
}
		
//Retire un objet d'une liste d'objets
PumPdfPopup.pumpdfRemovefromlist = function(liste,obj)
{
	var temp=new Array();
	for(i=0; i < liste.length; i++)
		{
		if (liste[i] != obj)
			{
			temp[temp.length] = liste[i];
			}
		}
	return temp;
}

PumPdfPopup.pumpdfIs_firefox = function()
{
	return navigator.userAgent.toLowerCase().indexOf('firefox') + 1 ;
}
		
PumPdfPopup.pumpdfIs_ie = function()
{
	return ( /msie/i.test(navigator.userAgent) &&
				   !/opera/i.test(navigator.userAgent) );
}
		
PumPdfPopup.pumpdfIs_ie5 = function()
{
	return ( PumPdfPopup.pumpdfIs_ie() && /msie 5\.0/i.test(navigator.userAgent) );
}

PumPdfPopup.pumpdfIs_ns6 = function()
{
	return (((document.getElementById) ? true : false) && (navigator.appName=="Netscape"))? true: false;
}


//Cache le bloc contenant le pdf		
PumPdfPopup.pumpdfHidebox = function(evt)
{
    var popup = PumPdfPopup.getPopupRef();
		
	if (popup.pumpdfW3c)
		{
		popup.bxprinc.style.display = 'none';
		popup.pumpdfHideShowSelect();
		}
}

//Affiche le bloc contenant le pdf		
PumPdfPopup.pumpdfShowbox = function(evt)
{
    var popup = PumPdfPopup.getPopupRef();
    
    if (! popup.bxprinc)
     {
         popup.show();
     }
	popup.bxprinc.style.display = 'block';
	popup.zIndex = ++ popup.cid.pumpdfZdx;

    popup.pumpdfHideShowSelect();	
}

//Ferme le bloc contenant le pdf	
PumPdfPopup.pumpdfMinimize = function(evt)
{
    var popup = PumPdfPopup.getPopupRef();
	
	if (popup.pumpdfW3c && ! popup.pumpdfIsMinimize)
		{
		popup.heightbefmini = popup.bxprinc.style.height;
		popup.bxprinc.style.height = (popup.pumpdfIe5)? '28px':'24px';
		popup.bxcontent.style.display = 'none';
		popup.bxrs.style.display = 'none';
		popup.bxsel.style.display = 'none';
		if (! popup.pumpdfIsMinimize)
			{
			popup.pumpdfIsMinimize = true;
			popup.pumpdfCurrHeight = (popup.pumpdfIe5)? 28:24;
			}
		}
		
	setTimeout('PumPdfPopup.pumpdfNs6bugfix()',100);

}
		
PumPdfPopup.pumpdfRestore = function(evt)
{
    var popup = PumPdfPopup.getPopupRef();
		
	if (popup.pumpdfW3c && popup.pumpdfIsMinimize)
	{
    	var h = popup.heightbefmini;
    	popup.bxprinc.style.height = h ;
    	popup.bxcontent.style.display = 'block';
    	popup.bxrs.style.display = 'block'; 
    	popup.bxsel.style.display = 'block'; 		
    	if (popup.pumpdfIsMinimize)
    		{
    		popup.pumpdfIsMinimize = false;	
    		popup.pumpdfCurrHeight = h;
    		}
    	setTimeout('PumPdfPopup.pumpdfNs6bugfix()',100);
	}
}


PumPdfPopup.prototype.pumpdfMovepopup = function(evt)
	{
	if ((this.pumpdfCurrIDb != null) && this.pumpdfW3c)
		{
		this.pumpdfCurrX = this.pumpdfMx + this.pumpdfXoff;
		this.pumpdfCurrY = this.pumpdfMy + this.pumpdfYoff;
		this.pumpdfCurrIDb.style.left = this.pumpdfCurrX + 'px';
		this.pumpdfCurrIDb.style.top = this.pumpdfCurrY + 'px';
		
		if (! this.pumpdfIsMinimize)
			{
			this.pumpdfCurrWidth = this.pumpdfCurrIDb.offsetWidth;
			this.pumpdfCurrHeight = this.pumpdfCurrIDb.offsetHeight;
			}
		else
			{
			this.pumpdfCurrHeight=(this.pumpdfIe5)? 28:24;
			}
		}
		
	if ((this.pumpdfCurrRS != null) && this.pumpdfW3c)
		{
		var rx = this.pumpdfMx + this.pumpdfRsxoff;
		var ry = this.pumpdfMy + this.pumpdfRsyoff;
          
		this.pumpdfCurrRS.style.left = Math.max(rx,((this.pumpdfIe5) ? 88:92)) + 'px';
		this.pumpdfCurrRS.style.top = Math.max(ry,((this.pumpdfIe5) ? 68:72)) + 'px';
		
		this.bxprinc.style.width = Math.max(rx + ((this.pumpdfIe5) ? 12:8),100) + 'px';
		this.bxprinc.style.height = Math.max(ry + ((this.pumpdfIe5) ? 12:8),80) + 'px';
		this.bxtitle.style.width = Math.max(rx + ((this.pumpdfIe5) ? 4:3),((this.pumpdfNs6) ? 95:92)) + 'px';
		this.bxbtt.style.left = parseInt(this.bxtitle.style.width) - 48 + 'px';
		this.bxcontent.style.width = Math.max(rx-((this.pumpdfIe5) ? -5:5),((this.pumpdfIe5) ? 92:87)) + 'px';
		this.bxcontent.style.height = Math.max(ry-((this.pumpdfIe5) ? 58:60),84) + 'px';

		this.bxsel.style.width = Math.max(rx-((this.pumpdfIe5) ? -5:5),((this.pumpdfIe5) ? 92:87)) + 'px';
		
		var ex = PumPdfPopup.pumpdfGetX(evt);
		var ey = PumPdfPopup.pumpdfGetY(evt);
			
		this.pumpdfXoff = parseInt(this.bxprinc.style.left) - ex;
		this.pumpdfYoff = parseInt(this.bxprinc.style.top) - ey;
		this.pumpdfCurrX = this.pumpdfMx + this.pumpdfXoff;
		this.pumpdfCurrY = this.pumpdfMy + this.pumpdfYoff;

		this.pumpdfCurrWidth = Math.max(rx + ((this.pumpdfIe5)?12:8),100);
		this.pumpdfCurrHeight = Math.max(ry + ((this.pumpdfIe5)?12:8),80);
		}
		this.pumpdfHideShowSelect();
}

	
PumPdfPopup.pumpdfNs6bugfix = function()
{
	self.resizeBy(0,1);
	self.resizeBy(0,-1);
}
		

//
PumPdfPopup.pumpdfTrackmouse  = function(evt)
	{
    var popup = PumPdfPopup.getPopupRef();
	
	popup.pumpdfMx = PumPdfPopup.pumpdfGetX(evt);
	popup.pumpdfMy = PumPdfPopup.pumpdfGetY(evt);

 	popup.pumpdfMovepopup(evt);
	 	
	if ((popup.pumpdfCurrIDb != null)|| (popup.pumpdfCurrRS != null)) 
		{
		return false;
		}
	}


/**
 * Retourne l'abscisse du curseur 
 * @param event
 * @return abscisse du curseur
 */
PumPdfPopup.pumpdfGetX = function(evt)
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
PumPdfPopup.pumpdfGetY = function(evt)
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


PumPdfPopup.ns6move = function(evt)
{
    var popup = PumPdfPopup.getPopupRef();
	popup.pumpdfMovepopup(evt);  
}


/**
 * Fonction exécutée pour redimensionner le popup
 * @param evt
 * @return false
 */
PumPdfPopup.pumpdfStartRS = function(evt)
	{
    var popup = PumPdfPopup.getPopupRef();
	PumPdfPopup.addEvent(document,'mousemove',PumPdfPopup.pumpdfTrackmouse);
	PumPdfPopup.addEvent(document,'mouseup',PumPdfPopup.pumpdfStopTrackmouse);
		
	var ex = PumPdfPopup.pumpdfGetX(evt);
	var ey = PumPdfPopup.pumpdfGetY(evt);

	popup.pumpdfRsxoff = parseInt(popup.bxrs.style.left) - ex;
	popup.pumpdfRsyoff = parseInt(popup.bxrs.style.top) - ey;
	popup.pumpdfCurrRS = popup.bxrs;

	if(popup.pumpdfNs6)
		{
		popup.bxcontent.style.overflow = 'hidden';
		}

	return false;
	}


PumPdfPopup.pumpdfStopdrag = function(evt)
	{
    var popup = PumPdfPopup.getPopupRef();
	
	popup.pumpdfCurrIDb = null;
	PumPdfPopup.pumpdfNs6bugfix();
	PumPdfPopup.removeEvent(document,'mousemove',PumPdfPopup.pumpdfTrackmouse);
	PumPdfPopup.removeEvent(document,'mouseup',PumPdfPopup.pumpdfStopTrackmouse);
	}

/**
 * 
 * @param evt
 * @return false
 */
PumPdfPopup.pumpdfGrab_id= function(evt)
	{
    var popup = PumPdfPopup.getPopupRef();
	PumPdfPopup.addEvent(document,'mousemove',PumPdfPopup.pumpdfTrackmouse);
	PumPdfPopup.addEvent(document,'mouseup',PumPdfPopup.pumpdfStopTrackmouse);
	
	if (popup.pumpdfW3c)
		{
		var bx = popup.bxprinc.style;
		var maxz = PumPdfPopup.pumpdfFindMaxZindex();
		bx.zIndex = maxz + 1;
		}
	
		var ex = PumPdfPopup.pumpdfGetX(evt);
		var ey = PumPdfPopup.pumpdfGetY(evt);
		
		popup.pumpdfXoff = parseInt(popup.bxprinc.style.left) - ex;
		popup.pumpdfYoff = parseInt(popup.bxprinc.style.top) - ey;
		popup.pumpdfCurrIDb = popup.bxprinc;

	return false;
	}


PumPdfPopup.pumpdfStopTrackmouse = function()
{
    var popup = PumPdfPopup.getPopupRef();
	popup.pumpdfCurrRS = null;
	PumPdfPopup.removeEvent(document,'mousemove',PumPdfPopup.pumpdfTrackmouse);
	PumPdfPopup.removeEvent(document,'mouseup',PumPdfPopup.pumpdfStopTrackmouse);	
}

/**
 * Création d'un bloc div
 * @param x abscisse
 * @param y ordonnée
 * @param w largeur
 * @param h hauteur
 * @param bgc couleur d'arrière plan
 * @param id
 * @return false
 */
PumPdfPopup.pumpdfSubBox = function(x,y,w,h,bgc,id)
	{
	var v = PumPdfPopup.pumpdfCreateElement('div');
	v.setAttribute('id',id); 
	v.style.position = 'absolute';
	v.style.left = x + 'px';
	v.style.top = y  + 'px';
	v.style.width = w + 'px';
	v.style.height = h + 'px';
	v.style.backgroundColor = bgc;
	v.style.visibility = 'visible';
	v.style.padding = '0px 0px 0px 0px';
	v.style.margin = '0px 0px 0px 0px';
	return v;
	}


PumPdfPopup.pumpdfIsTRNode = function(obj)
{
	var tagName = obj.tagName;
	return tagName == "TR" || tagName == "tr" || tagName == "Tr" || tagName == "tR";
}






//Test si un objet est un bloc div
PumPdfPopup.pumpdfIsDiv = function(obj)
{
if (obj != null)
	{
	var tagName = obj.tagName;
	if (tagName == 'DIV' || tagName == 'div' )
		return true;
	}
return false;
}

//Test si un objet est un li
PumPdfPopup.pumpdfIsLi = function(obj)
{
if (obj != null)
	{
	var tagName = obj.tagName;
	if ( typeof tagName == 'undefined')
		return false;	
	if (tagName == 'LI' || tagName == 'li' || tagName == 'Li' || tagName == 'lI' )
		return true;
	}
return false
}


//PosX
PumPdfPopup.pumpdfGetposxbyid = function(id,defaultx)
{
var obj = document.getElementById(id);
if (obj != null)
	return PumPdfPopup.pumpdfGetposx(obj)
else
	return defaultx;
}

PumPdfPopup.pumpdfGetposx = function(y)
{
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
PumPdfPopup.pumpdfGetposybyid = function(id,defaulty)
{
var obj = document.getElementById(id);
if (obj != null)
	return pumpdfGetposy(obj)
else
	return defaulty;
}

PumPdfPopup.pumpdfGetposy = function(y)
{
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

  
PumPdfPopup.pumpdfCreateElement = function(type, parent)
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

PumPdfPopup.pumpdfFindMaxZindex = function()
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

/* MAsque ou rend visible un élément div*/
PumPdfPopup.pumpdfToggleBox = function(szDivID, iState) // 1 visible, 0 caché
{
   var obj =  document.getElementById(szDivID);
   if (obj != null)
   	{
   	var objstyle= obj.style;
   	if (objstyle != null)
   		{
	   	objstyle.display = (iState ? "block" : "none");
	   	}
   	}
}

/* Active ou inactive un élément de type button*/
PumPdfPopup.pumpdfToogleButton = function(idbutton,bState) // 1 actif, 0 inactif
{
   var obj =  document.getElementById(idbutton);
   if (obj != null)
   	{
   	obj.disabled = (bState ? false : true) ;
   	}
}

/* Affiche le bloc div contenant le document sélectionné et masque les autres
   Inactive le bouton permettant de sélectionné un document et active les autres
*/
PumPdfPopup.pumpdfDisplayselectedpdf = function(nu)
{
    var popup = PumPdfPopup.getPopupRef();
    
    popup.numpdfactif = nu;
    
    for (var i=0; i < popup.numpdf; i++)
    	{
    	var id = "pdf" + i;
    	var idbutton = "button" + i;

    	var pdfdiv = popup.bxpdf;

		if (i != nu)
				{
				PumPdfPopup.pumpdfToogleButton(idbutton,1);
				}
		else
				{
				PumPdfPopup.pumpdfToogleButton(idbutton,0); 
				}    	
		}

      	var objectel = popup.objectpdf;    	
    	var datapdf = popup.prefixeurlpdf + popup.pdfs[nu];
    	objectel.setAttribute('data',datapdf);
    	         
	   	 // Actualise l'affichage
    	popup.bxpdf.innerHTML = popup.bxpdf.innerHTML;
    	
        // Mise à jour des références des objets actualisés
    	popup.bxpdf = document.getElementById('objectpdfdivid');
	    popup.objectpdf = document.getElementById('objectpdfid');

	    if (popup.bxtitletext != null)
		       {
		         popup.bxtitletext.innerHTML = popup.pdfs[nu];
	           } 
}










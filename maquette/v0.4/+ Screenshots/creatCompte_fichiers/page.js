 $(document).ready(function(){
	 
	 if($(".ie-version").hasClass("lt-ie8")){
		 IE_CorrectAlpha_PNG();		
	 }
	 
	// Reset Font Size
	 
	var minSize = 10;
	var maxSize = 20;
	 
	var fontTarget = "body, a, label, input, th, td, div, p, ul, li, select, form, textarea, caption, button";
		
	var originalFontSize = $(fontTarget).css('font-size');
	$("#resetfont").click(function() {
		$(fontTarget).css('font-size', originalFontSize);
		setStorage("fontSize","");
		return false;
	});
	// Increase Font Size
	$("#incfont").click(function() {
		var currentFontSize = $(fontTarget).css('font-size');
		var currentFontSizeNum = parseFloat(currentFontSize, 10);
		var newFontSize = currentFontSizeNum * 1.1;
		if(newFontSize <= maxSize){
			$(fontTarget).css('font-size', newFontSize);
			setStorage("fontSize",newFontSize);
		}		
		return false;
	});
	// Decrease Font Size
	$("#decfont").click(function() {
		var currentFontSize = $(fontTarget).css('font-size');
		var currentFontSizeNum = parseFloat(currentFontSize, 10);
		var newFontSize = currentFontSizeNum * 0.9;
		if(newFontSize >= minSize){
			$(fontTarget).css('font-size', newFontSize);
			setStorage("fontSize",newFontSize);
		}
		return false;
	});
	
	/* init font size */
	if(getStorage("fontSize") != undefined &&  getStorage("fontSize") != ""){
		$(fontTarget).css('font-size', parseFloat(getStorage("fontSize"),10));
	}
	
	 
	 
	 
	/*
	 * script jquery pour permettre la navigation au clavier sur le
	 * menu
	 */
       $("div.nav li a").focus(function(event){
    	                         $("div.nav ul, div.nav li").removeClass("focus hover");
                                 $(this).parents("div.nav ul, div.nav li").addClass("focus hover");
                               }).hover(function(event){
                            	   $("div.nav ul, div.nav li").removeClass("focus hover");
                                   $(this).parents("ul").addClass("focus");
                                   $(this).parents("li").addClass("hover");
                                 });
       
       $("div.nav").hover(  function(){},                		   
    		                function(){ $("div.nav ul, div.nav li").removeClass("focus hover");
    		                }
        );
       
       /*
		 * END : script jquery pour permettre la navigation au
		 * clavier sur le menu
		 */
       
       
       /* script js pour ie <8 
        * 
        * Si l'élément ayant la classe CSS ie-version à aussi la classe CSS lt-ie8
        * Cela signifie que nous avons à faire à un IE 6, 7 ou 8
        * 
        * */
       if($(".ie-version").hasClass("lt-ie8")){
    	   
    	   /* menu */
    	   
    	   /* suppression du menu en pure css */
    	   $("div.nav").remove();    	   
    	   /* affichage de l'ancien menu tout de javascript vétu */
    	   //FIXME
    	   //cmDraw (_menudiv, barremenu , 'hbr', cm_menutheme, _menutheme);
    	   $("div.menu").removeClass("hidden").after("<br/><br/>");
    	   
           /* pagination */
           
           $("div.otherpage").hover(  function(){ 	                	   
        	   $(this).find("div").show().css("height","132px");
        	   $("select").css("visibility","hidden");
					                   }
				                   ,                        
				                    function(){ 
				                	   $(this).find("div").hide();
				                	   $("select").css("visibility","visible");
				                    });
       } else{
    	   $('*[title]').tooltip({placement : "bottom"});
       }
           
          
       /* END : script js pour ie6 */
       
    /* Add conditional classname based on support */
       $('html').addClass($.fn.details.support ? 'details' : 'no-details');

       /* Show a message based on support */
/*       $('body').prepend($.fn.details.support ? 'Native support detected; the plugin will only add ARIA annotations and fire custom open/close events.' 
    		   									: 'Emulation active; you are watching the plugin in action!');
*/       
       /*
		 * Emulate <details> where necessary and enable open/close
		 * event handlers
		 */
       $('details').details();
       
       
   /* theme roller */   
    
   
     $("#custom").change(function(){
   		$("link.ui-theme").remove();
   		
   		if($(this).val() != ""){   			
   			var cssLink = $('<link href="'+composantsrepertoire+'tagsapp/css/themes/'+$(this).val()+'.css?'+(new Date().getTime())+'" type="text/css" rel="Stylesheet" class="ui-theme" />');
   	   		$("head").append(cssLink);
   	   		log(cssLink);
   		}   		   		
   		
   		if(supports_local_storage()){
   			localStorage["custom-theme"] = $(this).val();
   		}
     });
       
       
    /* init custom */
    if(supports_local_storage() && localStorage["custom-theme"] != undefined){		
		$("#custom").val(localStorage["custom-theme"]).change();
	}
    
});
 
/* html5 local storage */ 
function supports_local_storage() {
	try {
		return ('localStorage' in window && window['localStorage'] !== null);
	} catch(e) {
		return false;
	}
}

function IE_CorrectAlpha_PNG(){
	for(i=0; i<document.images.length; i++){
		img    = document.images[i];
		imgExt  = img.src.substring(img.src.length-3, img.src.length);
		imgExt  = imgExt.toUpperCase();
		if (imgExt == "PNG"){
			imgID    = (img.id) ? "id='" + img.id + "' " : "";
			imgClass= (img.className) ? "class='" + img.className + "' " : "";
			imgTitle= (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' ";
			imgStyle= "display:inline-block;" + img.style.cssText;
			if (img.align == "left") { imgStyle = "float:left;"  + imgStyle; } else if (img.align == "right"){ imgStyle = "float:right;" + imgStyle; }
			if (img.parentElement.href)   { imgStyle = "cursor:hand;" + imgStyle; }       
			strNewHTML    = '<span '+imgID+imgClass+imgTitle+' style="width:'+img.width+'px; height:'+img.height+'px;'+imgStyle+';'+'filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\''+img.src+'\', sizingMethod=\'scale\');"pascontent/span>';
			img.outerHTML = strNewHTML;
			i = i-1;
		}
	}
}

function setStorage(_name,_value){
	if(supports_local_storage()){
		localStorage[_name] = _value;
	}else{
		setCookie(_name, _value);
	}
}

function getStorage(_name){
	if(supports_local_storage()){
		return localStorage[_name];
	}else{
		return getCookie(_name);
	}
}


function supports_local_storage() {
	try {
		return ('localStorage' in window && window['localStorage'] !== null);
	} catch(e) {
		return false;
	}
}

function setCookie(c_name, value, exdays) {
	
	if(exdays == null || exdays == undefined){
		exdays = 365*100;
	}
	
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
	document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(";");
	for ( i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
		x = x.replace(/^\s+|\s+$/g, "");
		if (x == c_name) {
			return unescape(y);
		}
	}
}

function log(logtext){
	try{
		if(typeof(console) != undefined){
			console.log(logtext);
		}		
	}catch(e) {
		return false;
	}
}
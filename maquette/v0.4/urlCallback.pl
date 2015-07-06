#!/usr/bin/perl

use FCGI ;

use strict ;
use LWP::UserAgent ;
use JSON ;
use HTML::HashTable ;
use Encode qw(encode decode) ;
use MIME::Base64 ;
use Data::Dumper;
use utf8;
use HTML::Template ;
use URI::Escape ;
use Net::FranceConnect ;
use Digest::SHA
	qw/hmac_sha256_base64 hmac_sha384_base64 hmac_sha512_base64 sha256 sha256_base64 sha384_base64 sha512_base64/;

#my $callbackURL = "http://127.0.0.1/hackathon/urlcallback.pl" ;
my $callbackURL = "http://hackathon.local/teleInscription/urlCallback.pl" ;
my $authorizationURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize" ;
my $tokenURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/token" ;
my $userInfoURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo" ;
my $logoutURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/logout" ;

# label : DGFIP - Projet Télé-inscription
# email de contact : olivier.blanc@dgfip.finances.gouv.fr
# client_id : 9641ff3252bf9b00dc852bfa359629a7d963c2d10d407c03
# secret : 67db6a90071af5b7b96ee98f77c9b4d97e3701a348db0b76

# URLs de redirection :

# http://127.0.0.1/urlcallback.pl

#my $proxy='http://10.154.61.3:3128' ;
my $proxy ;
my $proxy_scheme = ['http', 'https'] ;


my $count = 0;
my $handling_request = 0;
my $exit_requested = 0;
my $DEBUG=1;

my $request = FCGI::Request();

sub sig_handler {
    $exit_requested = 1;
    exit(0) if !$handling_request;
}

$SIG{USR1} = \&sig_handler;
$SIG{TERM} = \&sig_handler;
$SIG{PIPE} = 'IGNORE';
$|=1;
while ($handling_request = ($request->Accept() >= 0)) {
	print STDERR Dumper(%ENV), "\n"
		if $DEBUG > 1 ;
	eval {&abort_request;} if (!eval {&do_request; 1;} && $@ ne 'SIGPIPE\n');
	$handling_request = 0;
	last if $exit_requested;
}

$request->Finish();

exit(0);

sub abort_request() {
    $exit_requested = 1; # assume the error isn't recoverable
    print STDERR "fatal error, request aborted, shutting down: $@\n"
			;
    $request->Finish();
}

####################

sub do_request()
{
	my $callbackURL = "http://hackathon.local/teleInscription/urlCallback.pl" ;

	my $fc = Net::FranceConnect->new() ;
	$fc->setDebug(1) ;

	my $ui_json ;
	if (  $fc->initFromQueryString($ENV{'QUERY_STRING'}) and
				$fc->retreiveAccessToken($callbackURL) and
				($ui_json = $fc->retreiveUserInfo()) ) {

		print STDERR  "Session : ", $fc->getSessionId(), "\n" ;
    print STDERR "FranceConnect User Info return : ", Dumper($ui_json), "\n"
			if $ui_json;

		# Recperer les donnees

		my $etatCivil =	eval { $fc->getFdDatas('etatcivil_cnf') } ;
		if($@) {
			print STDERR "Erreur : ", $@, "\n" ;
		}
    my $dgfip = $fc->getFdDatas('dgfip_rp') ;
    my $dgfip_rp = $dgfip->{'records'}->[0]->{'fields'}
			if ($dgfip and
					exists $dgfip->{'records'} and
					exists $dgfip->{'records'}->[0] and
					exists $dgfip->{'records'}->[0]->{'fields'}) ;
    print STDERR "DGFiP Residence principale : ", Dumper($dgfip_rp), "\n"
      if ($dgfip_rp) ;

    #     'situation_clair' => "d\\x{e9}gag\\x{e9} des obligations militaires",
    # 		'situation_sn' => bless( do{\\(my $o = 1)}, 'JSON::XS::Boolean'

    my $serviceNational = $fc->getFdDatas('situation_service_national') ;
    print STDERR "Service National : ", Dumper($serviceNational), "\n"
      if defined $serviceNational ;

    my $educationNationale  = $fc->getFdDatas('men_diplomes') ;
    print STDERR "Education Nationale : ", Dumper($educationNationale), "\n"
			if defined $educationNationale ;

    print STDERR "creating template \n" ;
    my $template = eval {HTML::Template->new(filename => 'gestionCompte.tmpl' ,
																						 path => ['maquette/current',
																											'maquette/v0.4',
																											'/Users/olivier/Development/teleInscription.xcworkspace/teleInscription/maquette/v0.4',
																											'/home/olivier/Development/hackathon/maquette/v0.4'
																										]
																					 )} ;
    unless ( $template) {
      print STDERR "Error creating template \n" ;
      $request->Finish();
      return ;
    }

    eval {
      # Etat sur les informations récupérées de FC :
      $template->param(etat_EtatCivil => (defined $ui_json ? "accept" : "refus")) ;
      $template->param(etat_LaPoste => (defined $dgfip ? "accept" : "refus")) ;
      $template->param(etat_ServiceNational => (defined $serviceNational ? "accept" : "refus")) ;
      $template->param(etat_EducationNationale => (defined $educationNationale ? "accept" : "refus")) ;
    } ;
    if ($@) {
      my $msg = $@ ;
      print STDERR "Error setting info on FC services : ", $msg, "\n";
    }

    # Etat civil
    eval {
      if ($ui_json) {
				$template->param(ID_CANDIDAT => encode('utf-8', ($ui_json->{'nom_d_usage'} ? $ui_json->{'nom_d_usage'} : $ui_json->{'nom_de_naissance'}) . ', ' . $ui_json->{'prenoms'} ) ) ;
				$template->param(nom => encode('utf-8', $ui_json->{'nom_de_naissance'}) ) ;
				$template->param(nomUsag => encode('utf-8', $ui_json->{'nom_d_usage'} ) ) ;
				if($ui_json->{'prenoms'} =~ m/^\s*([^\s]+)\s*(.*)$/) {
					$template->param(prenom => encode('utf-8', $1) ) ;
					$template->param(prenom2 => encode('utf-8', $2) ) ;
				}
				if ($ui_json->{'sexe'} eq "male") {
					$template->param('sexe_m' => 'checked') ;
				} else {
					$template->param('sexe_f' => 'checked') ;
				}
				{
					my ($y, $m, $j) = split(/\-/, $ui_json->{'date_de_naissance'}) ;
					$template->param(dateNaissance => encode('utf-8', "$j/$m/$y") ) ;
				}
				my $dptNaissance ;
				my $villeNaissance ;

				# villeNaissance
				# departementNaissance
				# paysNaissance
				my $paysNaissance ;
				if ($ui_json->{'pays_de_naissance'} eq "99100") {
					my $cmd = "grep -e '^" . $ui_json->{'lieu_de_naissance'} . "' villes2015.txt" ;
					my $line = `$cmd` ;
					if ($line) {
						print STDERR "ville $line \n" ;
						# CODGEO	LIBGEO	DEP	REG	REG2016	EPCI	NATURE_EPCI	ARR	CV	ZE2010	UU2010	TUU2010	TDUU2010	AU2010	TAU2010	CATAEU2010	BV2012
						my @infos = split(/\t/, $line) ;
						eval { $villeNaissance = $infos[1] } ;
						eval { $dptNaissance = $infos[2] } ;
						$template->param(nationalite_francaise => "checked") ;
					}
				} else {
					my $cmd = "grep " . $ui_json->{'pays_de_naissance'} . " pays2015.txt" ;
					my $line = `$cmd` ;
					if ($line) {
						my @infos = split(/\t/, $line) ;
						# COG	ACTUAL	CAPAY	CRPAY	ANI	LIBCOG	LIBENR	ANCNOM	CODEISO2	CODEISO3	CODENUM3
						eval { $paysNaissance = $infos[6] ; } ;
						$dptNaissance='999' ;
						$villeNaissance = 'Etranger' ;
						$template->param(nationalite_autre => "checked") ;
						print STDERR "Pays $paysNaissance\n" ;
					}
				}
				if ($dptNaissance) {
					$template->param(villeNaissance => encode('utf-8', $villeNaissance) ) ;
					$template->param("DPT_" . $dptNaissance . "_NAI" => "selected") ;
				}
      }
    } ;
    if ($@) {
      my $msg = $@ ;
      print STDERR "Error settings infos on Etat Civil : ", $msg, "\n";
    }

    # Nationalité
    # numVoieHab
		if ($dgfip_rp) {
			eval {
				if ($dgfip_rp->{'adresse'}) {
					my $adresse = $dgfip_rp->{'adresse'} ;
					if ($adresse =~ m/(\d*)\s*,?\s*(.+)/i) {
						my $nVoie = $1 ;
						my $rue = $2 ;
						# indicNumVoieHab
						$template->param(numVoieHab => $nVoie) ;
						# addresseHab
						$template->param(addresseHab => encode('utf-8', $rue) ) ;
					}
				}
				if ($dgfip_rp->{'commune'}) {
					$template->param('communeHab' => encode('utf-8', $dgfip_rp->{'commune'}) ) ;
					if ($dgfip_rp->{'code_postal'} =~ /([\d]{2})\s?\d+/) {
						my $dep = $1 ;
						if ($dep > 96 or $dep == 20) {
							$dgfip_rp->{'code_postal'} =~ /([\d]{3})\d+/ ;
							$dep = $1 ;
						}
						# departementHab
						eval { $template->param('DEP_' . sprintf("%02d", $dep) .'_SEL' => 'selected') } ;
						if ( $@ ) {
							print STDERR "Erreur de détermination du département : $@\n" ;
						}
					}
					# paysHab
					eval { $template->param('PAYS_' . '10' .'_SEL' => 'selected') } ;
				}
				$template->param('codepostalHab' => $dgfip_rp->{'code_postal'})
					if exists $dgfip_rp->{'code_postal'} ;
				$template->param('numTel' => encode('utf-8', $dgfip_rp->{'tel_fixe'}))
					if exists $dgfip_rp->{'tel_fixe'} ;
				$template->param('addresseMail' => encode('utf-8', $ui_json->{'mail'}))
					if exists $ui_json->{'mail'} ;
			} ;
			if ($@) {
				my $msg = $@ ;
				print STDERR "Wrong JSON content in dgfip_rp : ", $msg, "\n";
			}
		}

    $template->param("nationalite_francaise" => "checked") ; # On triche !

    # Service National
		if ($serviceNational) {
			eval {
				if ($serviceNational->{'situation_clair'}) {
					$template->param("situation_sn" => encode('utf-8', $serviceNational->{'situation_clair'}) ) ;
				}
				$template->param(etat_SN_FC => "validFC") ;
			} ;
			if ($@) {
				my $msg = $@ ;
				print STDERR "Error setting params for SN : ", $msg, "\n";
			}

		} else {
			$template->param(etat_SN_FC => "errorFC") ;
		}

    # Education Nationale
		if ($educationNationale) {
			eval {
				# {"nhits": 1,
				# 	 "parameters": {"dataset":["men_diplomes"],
				# 									"timezone": "UTC",
				# 									"rows": 10,
				# 									"format": "json"},
				# 									"records": [{"datasetid": "men_diplomes", "recordid": "913721b3339c998be68e22331e075e1e7d70d328", "fields": {"sexe": "female", "serie": "Serie A", "date_de_naissance": "1985-01-05", "mention": "ADMIS", "academie_d_origine": "A25", "session": "2003-06", "nom_de_naissance": "AMA", "examen": "BACCALAUREAT GENERAL", "lieu_de_naissance": "91471", "prenoms": "Patricia", "pays_de_naissance": "99100"}, "record_timestamp": "2015-06-16T15:53:00+00:00"}]}
				my $nDiplomes = $educationNationale->{'nhits'} ;
				for (my $i = 0 ; $i < $nDiplomes ; ++$i) {
					my $record = $educationNationale->{'records'}->[$i] ;
					if ($record) {
						my $fields = $record->{'fields'} ;
						print STDERR "Settings info :", Dumper($fields), "\n" ;
						if ($fields->{'examen'} =~ m/baccalaureat/i) {
							$template->param("diplome_bac" => encode('utf-8', $fields->{'examen'} . ' ' . $fields->{'serie'} . ', ' . $fields->{'mention'} . '. Session ' . $fields->{'session'}) ) ;
						}
						if ($fields->{'examen'} =~ m/supérieur/i) {
							$template->param("diplome_sup" => encode('utf-8', $fields->{'examen'} . ' ' . $fields->{'serie'} . ', ' . $fields->{'mention'} . '. Session ' . $fields->{'session'}) ) ;
						}
						if ($fields->{'examen'} =~ m/brevet/i) {
							$template->param("diplome_brevet" => encode('utf-8', $fields->{'examen'} . ' ' . $fields->{'serie'} . ', ' . $fields->{'mention'} . '. Session ' . $fields->{'session'}) ) ;
						}
					}
				}
				$template->param('etat_EN_FC' => 'validFC') ;
				$template->param("explain_EN_status" => "Le minist&egrave;re de l'&eacute;ducation nationale a transmis les informations suivantes vous concernant.") ;
			} ;
			if ($@) {
				my $msg = $@ ;
				print STDERR "Error setting params for Education Nationale : ", $msg, "\n";
			}
		} else {
			$template->param("explain_EN_status" => "Le minist&egrave;re de l'&eacute;ducation nationale n'a pas pu transmettre l'ensemble des pi&egrave;ces justificatives. Veuillez fournir une copie (scan .jpg, .pdf) de votre dipl&ocirc;me le plus &eacute;lev&eacute;.") ;
			$template->param('etat_EN_FC' => 'errorFC') ;
		}
		$template->param(connection_state => $fc->generateStateParam()) ;

		print("Content-type: text/html; charset=utf-8\r\n\r\n");
		print $template->output ;
		$fc->enregistrer() ;
	} else {
		# La session n'existe pas ou plus mais est invalide. Redirection vers la page de connexion
		print "HTTP/1.0 301" ;
		print "Content-type: text/html; charset=utf-8\r\n" ;
		print "Status: 301 Moved Permanently\r\n" ;
		print "Location: http://hackathon.local/teleInscription/connect.pl\r\n\r\n" ;
	}
	$request->Finish();
}

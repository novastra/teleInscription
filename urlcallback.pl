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
use Digest::SHA
  qw/hmac_sha256_base64 hmac_sha384_base64 hmac_sha512_base64 sha256 sha256_base64 sha384_base64 sha512_base64/;

my $callbackURL = "http://127.0.0.1/hackathon/urlcallback.pl" ;
my $authorizationURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize" ;
my $tokenURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/token" ;
my $userInfoURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/userinfo" ;
my $logoutURL = "https://fcp.integ01.dev-franceconnect.fr/api/v1/logout" ;

my $count = 0;
my $handling_request = 0;
my $exit_requested = 0;

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
    eval {&abort_request;} if (!eval {&do_request; 1;} && $@ ne 'SIGPIPE\n');
    $handling_request = 0;
    last if $exit_requested;
}

$request->Finish();

exit(0);

sub abort_request() {
    $exit_requested = 1; # assume the error isn't recoverable
    print STDERR "fatal error, request aborted, shutting down: $@\n";
    $request->Finish();
}


sub param
{
	my $paramName = shift ;
	my $qString = $ENV{'QUERY_STRING'} ;
	my $value = join('', map { if($_ =~ /^$paramName=(.+)$/) { $1; } } split(/&/, $qString)) ;
	return $value ;
}

####################

sub getSN
{
	my $token = shift ;

	my $url = "http://localhost:9000/api/checkSituation?TOKEN=" . $token ;
	print STDERR "GET SN Datas url : ", $url, "\n" ;
	my $ua = LWP::UserAgent->new ;
	my $response = $ua->get($url) ;

	if($response->is_success) {
		print STDERR "SN Data response : ", $response->content, "\n" ;
		print STDERR "Data response UTF-8 : ", decode('UTF-8', $response->content), "\n" ;
		print STDERR "Data response ISO : ", decode('iso8859-1', $response->content), "\n" ;
		my $content = eval { decode_json $response->decoded_content } ;
		return $content ;
	} else {
		print STDERR "Query SN Error : " . $response->status_line . "\n" ;
	}
	return undef ;
}

sub getDatas
{
	my $dataset = shift ;
	my $token = shift ;

	my $fc = 'https://datafranceconnect.opendatasoft.com/api/records/1.0/search?' ;

	my $ua = LWP::UserAgent->new ;
	my $url = $fc .'dataset='. $dataset . "&access_token=" . $token ;

	print STDERR "Requesting : ", $url, "\n" ;

	my $response = $ua->get($fc .'dataset='. $dataset,
													"Authorization" => "Bearer $token"
												) ;

	if($response->is_success) {
		print STDERR "Data response : ", $response->decoded_content, "\n" ;
		my $json = eval { decode_json $response->decoded_content } ;
		print STDERR "Data response : ", Dumper($json), "\n" ;
		return $json
	} else {
		print STDERR "Query dataser $dataset Error : " . $response->status_line . "\n" ;
	}
	return undef ;
}

sub do_request()
{
	my $clientID = "ad1a0a5c98728c5a837f23a1e7cbdba779bd68b599517cdb0a788604f45da323" ; # E. German

	my $state = param('state') ;
	my $code = param('code') ;

	if ($code and $state) {
		# Authentification
    my $clientSecret = "c5c5fb51276ff890c9d65f274040489420cb97e4b3b3be020a35a94f050337a4" ; # E.German
		my $grantType = "authorization_code";
		my $form =
			{
			 code => $code,
			 client_id => $clientID,
			 client_secret => $clientSecret,
			 redirect_uri => $callbackURL,
			 grant_type => $grantType,
		 } ;

		my $ua = LWP::UserAgent->new ;
		my $response = $ua->post($tokenURL, $form, "Content-Type" => 'application/x-www-form-urlencoded') ;
		if ( $response->is_error ) {
			print STDERR  "Error retreiving access_token : " . $response->message . "\n" ;
			$request->Finish();
			return ;
		}

		# Get access_token and id_token
		my $content = $response->decoded_content;

		my $json;
		my $access_token ;
		my $id_token ;
		eval { $json = decode_json $content; };
		if ($@) {
			my $msg = $@ ;
			print STDERR "Wrong JSON  content in get access token : ", $msg, "\n", "Content : ", $content, "\n";
			$request->Finish();
			return ;
		}
		if ( $json->{error} ) {
			print STDERR "Error in token response:" . $json->{error} . "\n";
			$request->Finish();
			return ;
		} else {
			$access_token = $json->{"access_token"} ;
			$id_token     = $json->{"id_token"};
    }

    # Get ID token content

    my ( $id_token_header, $id_token_payload, $id_token_signature ) =
      split( /\./, $id_token );
    # TODO check signature

    my $id_token_payload_hash ;
		$id_token_payload_hash = eval { decode_json( decode_base64($id_token_payload) ) };
		if ($@) {
			my $msg = $@ ;
			print STDERR "Wrong JSON content in id token payload : ", $msg, "\n";
			$request->Finish();
			return ;
		}

    # Request UserInfo

		my $ui_response =
			$ua->get( $userInfoURL, "Authorization" => "Bearer $access_token" );

		if ( $ui_response->is_error ) {
			print STDERR  "Error retreiving access_token : " . $ui_response->message . "\n" ;
			print("Content-type: text/html\r\n\r\n");
			print "<html><head><title>Erreur : acc&egrave; &agrave; FranceConnect</title></head><body><h1>Erreur d'acc&egrave;s &agrave; FranceConnect :</h1><p>",
				$ui_response->message, "</p><br/><p>",
				$ui_response->status_line, "</p></body></html>\n" ;

			$request->Finish();
			return ;
		}

		my $ui_content = $ui_response->decoded_content;
		my $ui_json;
		my $content_type = $ui_response->header('Content-Type');

		if ( $content_type =~ /json/ ) {
			eval { $ui_json = decode_json($ui_content); };
		} elsif ( $content_type =~ /jwt/ ) {
			my ( $ui_header, $ui_payload, $ui_signature ) =
				split( /\./, $ui_content );
			eval { $ui_json = decode_json( decode_base64($ui_payload) ); };
		}
		if($@) {
			my $msg = $@ ;
			print STDERR "Wrong JSON content in user info : ", $msg, "\n";
			$request->Finish();
			return ;
		}
		print STDERR "FranceConnect User Info return : ", Dumper($ui_json), "\n" ;

		my $etatCivil = getDatas('etatcivil_cnf', $access_token) ;
		print STDERR "Etat Civil : ", Dumper($etatCivil), "\n" ;

		my $faiContact = getDatas('fai_contact', $access_token) ;
		my $fai ;
		$fai = $faiContact->{'records'}->[0]->{'fields'}
			if ($faiContact and
					exists $faiContact->{'records'} and
					exists $faiContact->{'records'}->[0] and
					exists $faiContact->{'records'}->[0]->{'fields'}) ;
		print STDERR "FAI Contact : ", Dumper($fai), "\n"
			if($fai) ;


		#     'situation_clair' => "d\\x{e9}gag\\x{e9} des obligations militaires",
		# 		'situation_sn' => bless( do{\\(my $o = 1)}, 'JSON::XS::Boolean'
		my $serviceNational = getSN($access_token) ;
		print STDERR "Service National : ", Dumper($serviceNational), "\n"
			if ($serviceNational) ;

		my $educationNationale  = getDatas('men_diplomes', $access_token) ;
		print STDERR "Education Nationale : ", Dumper($educationNationale), "\n" ;

		print STDERR "creating template \n" ;
		my $template = HTML::Template->new(filename => 'gestionCompte.tmpl' ,
																			 path => [
																								'maquette/current',
																								'/home/olivier/Development/hackathon/maquette/v0.4',
																							]
																		 ) ;
		unless ( $template) {
			print STDERR "Error creating template \n" ;
			$request->Finish();
			return ;
		}

		eval {
			# Etat sur les informations récupérées de FC :
			$template->param(etat_EtatCivil => (defined $ui_json ? "accept" : "refus")) ;
			$template->param(class_ec => (defined $ui_json ? "accept" : "refus")) ;
			$template->param(etat_LaPoste => (defined $fai ? "accept" : "refus")) ;
			$template->param(class_laposte => (defined $fai ? "" : "error")) ;
			$template->param(etat_ServiceNational => (defined $serviceNational ? "accept" : "refus")) ;
			$template->param(class_sn => (defined $serviceNational ? "" : "error")) ;
			$template->param(etat_EducationNationale => (defined $educationNationale ? "accept" : "refus")) ;
			$template->param(class_men => (defined $educationNationale ? "" : "error")) ;
		} ;
		if($@) {
			my $msg = $@ ;
			print STDERR "Error setting info on FC services : ", $msg, "\n";
		}


		# Etat civil
		eval {
			if ($ui_json) {
				$template->param(ID_CANDIDAT => $ui_json->{'preferred_username'} . ', ' . $ui_json->{'given_name'} ) ;
				$template->param(nom => $ui_json->{'preferred_username'} ) ;
				$template->param(nomUsag => $ui_json->{'family_name'} ) ;
				$template->param(prenom => $ui_json->{'given_name'}) ;
				if ($ui_json->{'gender'} eq "male") {
					$template->param('sexe_m' => 'checked') ;
				} else {
					$template->param('sexe_f' => 'checked') ;
				}
				{
					my ($y, $m, $j) = split(/\-/, $ui_json->{'birthdate'}) ;
					$template->param(dateNaissance => "$j/$m/$y") ;
				}
				my $dptNaissance ;
				my $villeNaissance ;

				# villeNaissance
				# departementNaissance
				# paysNaissance

				if ($ui_json->{'birthplace'} eq "99100") {
					$dptNaissance = "France" ;
				} else {

					my $cmd = "grep " . $ui_json->{'birthplace'} . " france2015.txt" ;
					my $line = `$cmd` ;
					if ($line) {
						print STDERR "Pays $line \n" ;
						my @infos = split(/\t/, $line) ;
						# 4\t\t\t\t11\t78\t471\t\t\t1\t91471\t1\t\tORSAY\t\tOrsay\t\t
						eval { $villeNaissance = $infos[13] ; } ;
						eval { $dptNaissance = $infos[5] ; } ;
					}
				}
				if ($dptNaissance) {
					$template->param(villeNaissance => $villeNaissance) ;
					$template->param("DPT_" . $dptNaissance . "_NAI" => "selected") ;
				}
			}
		} ;
		if($@) {
			my $msg = $@ ;
			print STDERR "Error settings infos on Etat Civil : ", $msg, "\n";
		}

		# Nationalité
		# numVoieHab
		eval {
			if ($fai) {
				if ($fai->{'adresse'}) {
					my $adresse = $fai->{'adresse'} ;
					if ($adresse =~ m/(\d+)\s*,\s*(.+)/i) {
						my $nVoie = $1 ;
						my $rue = $2 ;
						# indicNumVoieHab
						$template->param(numVoieHab => $nVoie) ;
						# addresseHab
						$template->param(addresseHab => $rue) ;
					}
				}
				if ($fai->{'commune'}) {
					$template->param('communeHab' => $fai->{'commune'}) ;
					if ($fai->{'code_postal'} =~ /([\d]{2})\d+/) {
						my $dep = $1 ;
						if ($dep > 96 or $dep == 20) {
							$fai->{'code_postal'} =~ /([\d]{3})\d+/ ;
							$dep = $1 ;
						}
						# departementHab
						eval { $template->param('DEP_' . $dep .'_SEL' => 'selected') ; } ;
						if ( $@ ) {
							print STDERR "Erreur de détermination du département : $@\n" ;
						}
					}
					# paysHab
					eval { $template->param('PAYS_' . '10' .'_SEL' => 'selected') ; } ;
				}
				$template->param('codepostalHab' => $fai->{'code_postal'})
					if $fai->{'code_postal'} ;
				$template->param('numTel' => $fai->{'tel_fixe'})
					if $fai->{'tel_fixe'} ;
				$template->param('addresseMail' => $fai->{'mail'})
					if $fai->{'mail'} ;
			}
		} ;
		if($@) {
			my $msg = $@ ;
			print STDERR "Wrong JSON content in fai : ", $msg, "\n";
		}

		$template->param("nationalite_francaise" => "checked") ; # On triche !


		# Service National
		eval {
			if ($serviceNational) {
				if ($serviceNational->{'situation_clair'}) {
					$template->param("situation_sn" => $serviceNational->{'situation_clair'}) ;
				}
				$template->param(etat_SN_FC => "validFC") ;
			} else {
				$template->param(etat_SN_FC => "errorFC") ;
			}
		} ;
		if($@) {
			my $msg = $@ ;
			print STDERR "Error setting params for SN : ", $msg, "\n";
		}


		# Education Nationale
		eval {
			if ($educationNationale) {
				# {"nhits": 1,
				# 	 "parameters": {"dataset":["men_diplomes"],
				# 									"timezone": "UTC",
				# 									"rows": 10,
				# 									"format": "json"},
				# 									"records": [{"datasetid": "men_diplomes", "recordid": "913721b3339c998be68e22331e075e1e7d70d328", "fields": {"sexe": "female", "serie": "Serie A", "date_de_naissance": "1985-01-05", "mention": "ADMIS", "academie_d_origine": "A25", "session": "2003-06", "nom_de_naissance": "AMA", "examen": "BACCALAUREAT GENERAL", "lieu_de_naissance": "91471", "prenoms": "Patricia", "pays_de_naissance": "99100"}, "record_timestamp": "2015-06-16T15:53:00+00:00"}]}
				my $nDiplomes = $educationNationale->{'nhits'} ;
				for (my $i = 0 ; $i < $nDiplomes ; ++$i) {
					my $record = $educationNationale->{'records'}->[$i] ;
					if($record) {
						my $fields = $record->{'fields'} ;
						print STDERR "Settings info :", Dumper($fields), "\n" ;
						if($fields->{'examen'} =~ m/baccalaureat/i) {
							$template->param("diplome_bac" => $fields->{'examen'} . ' ' . $fields->{'serie'} . ', ' . $fields->{'mention'} . '. Session ' . $fields->{'session'}) ;
						}
						if($fields->{'examen'} =~ m/supérieur/i) {
							$template->param("diplome_sup" => $fields->{'examen'} . ' ' . $fields->{'serie'} . ', ' . $fields->{'mention'} . '. Session ' . $fields->{'session'}) ;
						}
						if($fields->{'examen'} =~ m/brevet/i) {
							$template->param("diplome_brevet" => $fields->{'examen'} . ' ' . $fields->{'serie'} . ', ' . $fields->{'mention'} . '. Session ' . $fields->{'session'}) ;
						}
					}
				}
				$template->param('etat_EN_FC', => 'validFC') ;
				$template->param("explain_EN_status" => "Le minist&egrave;re de l'&Eacute;ducation nationale a transmis les informations suivantes vous concernant.") ;
			} else {
				$template->param("explain_EN_status" => "Le minist&egrave;re de l'&Eacute;ducation nationale n'a pas pu transmettre l'ensemble des pièces justificatives. Veuillez fournir une copie (scan .jpg, .pdf) de votre diplôme le plus élevé.") ;
				$template->param('etat_EN_FC', => 'errorFC') ;
			}
		} ;
		if($@) {
			my $msg = $@ ;
			print STDERR "Error setting params for Education Nationale : ", $msg, "\n";
		}
		
		print("Content-type: text/html\r\n\r\n");
		print $template->output ;

	}
	$request->Finish();
}

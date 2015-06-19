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
	# my $apikey = 'apikey=fd6fc4b687e9c78892f206d4a76b82b4a70c7ef418e3cdc8d7b548c2' ;
	# my $fc = 'https://datafranceconnect.opendatasoft.com/api/records/1.0/search?' ;
	# my $dataset = 'dataset=identite_pivot' ;
	# #$ua->proxy(['http', 'https'], 'http://10.154.61.3:3128/') ;
	# my $response = $ua->get($fc . $apikey . '&' . $dataset . '&' . $ENV{'QUERY_STRING'}) ;

	my $clientID = "ad1a0a5c98728c5a837f23a1e7cbdba779bd68b599517cdb0a788604f45da323" ;

	my $state = param('state') ;
	my $code = param('code') ;

	if ($code and $state) {
		# Authentification
    my $clientSecret = "c5c5fb51276ff890c9d65f274040489420cb97e4b3b3be020a35a94f050337a4" ;
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
			print STDERR  $response->message . "\n" ;
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
			print STDERR "Wrong JSON content\n";
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

    my $id_token_payload_hash = decode_json( decode_base64($id_token_payload) );

    # Request UserInfo

		my $ui_response =
			$ua->get( $userInfoURL, "Authorization" => "Bearer $access_token" );
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
		print STDERR "FranceConnect return : ", Dumper($ui_json), "\n" ;

		# {
    #       'birthcountry' => '99100',
    #       'phone_number' => undef,
    #       'gender' => 'male',
    #       'birthplace' => '124',
    #       'address' => undef,
    #       'birthdate' => '1965-11-17',
    #       'family_name' => 'Menant',
    #       'sub' => 'a738cfd6a1e12ed8b101631029413ce00fe0022aebda372b',
    #       'given_name' => 'Thomas',
    #       'email' => '1234567891011'
		#       'preferred_username'
    #     };


		my $etatCivil = getDatas('etatcivil_cnf', $access_token) ;
		print STDERR "Etat Civil : ", Dumper($etatCivil), "\n" ;

		my $faiContact = getDatas('fai_contact', $access_token) ;
		my $fai = $faiContact->{'records'}->[0]->{'fields'} ;
		print STDERR "FAI Contact : ", Dumper($fai), "\n" ;

		print STDERR "Requesting Service National \n" ;
		my $serviceNational = getSN($access_token) ;
		print STDERR "Service National : ", Dumper($serviceNational), "\n" ;
		# {
		#     'situation_clair' => "d\\x{e9}gag\\x{e9} des obligations militaires",
		# 		'situation_sn' => bless( do{\\(my $o = 1)}, 'JSON::XS::Boolean'
		# }

		print STDERR "creating template \n" ;
		my $template = HTML::Template->new(filename => 'gestionCompte.tmpl' ,
																			 path => ['maquette/current', '/home/olivier/Development/hackathon/maquette/v0.4']
																		 ) ;
		print STDERR "Error creating template \n"
			unless $template ;

		# Etat civil
		$template->param(ID_CANDIDAT => $ui_json->{'preferred_username'} . ', ' . $ui_json->{'given_name'} ) ;
		$template->param(nom => $ui_json->{'preferred_username'} ) ;
		$template->param(nomUsag => $ui_json->{'family_name'} ) ;
		$template->param(prenom => $ui_json->{'given_name'}) ;
		if($ui_json->{'gender'} eq "male") {
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
		if ($ui_json->{'birthplace'} eq "99100") {
			$dptNaissance = "France" ;
		} else {
			my $cmd = "grep " . $ui_json->{'birthplace'} . " france2015.txt" ;
			my $line = eval { `$cmd` } ;
			if ($line) {
				print STDERR "Pays $line \n" ;
				my @infos = split(/\t/, $line) ;
				# 4\t\t\t\t11\t78\t471\t\t\t1\t91471\t1\t\tORSAY\t\tOrsay\t\t
				eval { $villeNaissance = $infos[13] ; } ;
				eval {$dptNaissance = $infos[5] ; } ;
			}
		}
		if($dptNaissance) {
			$template->param(villeNaissance => $villeNaissance) ;
			$template->param("DPT_" . $dptNaissance . "_NAI" => "selected") ;
		}
		print STDERR "template 5 \n" ;
		# villeNaissance
		# departementNaissance
		# paysNaissance
		
		# numVoieHab
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
			if($fai->{'commune'}) {
				$template->param('communeHab' => $fai->{'commune'}) ;
				if($fai->{'code_postal'} =~ /([\d]{2})\d+/) {
					my $dep = $1 ;
					if($dep > 96 or $dep == 20) {
						$fai->{'code_postal'} =~ /([\d]{3})\d+/ ;
						$dep = $1 ;
					}
					print STDERR "Détermination du département : $dep\n" ;
					eval { $template->param('DEP_' . $dep .'_SEL' => 'selected') ; } ;
					if( $@ ) {
						print STDERR "Erreur de détermination du département : $@\n" ;
					}
				}
				eval { $template->param('PAYS_' . '10' .'_SEL' => 'selected') ; } ;
			}
			$template->param('codepostalHab' => $fai->{'code_postal'})
				if $fai->{'code_postal'} ;
			$template->param('numTel' => $fai->{'tel_fixe'})
				if $fai->{'tel_fixe'} ;
			$template->param('addresseMail' => $fai->{'mail'})
				if $fai->{'mail'} ;
		}
		# addresseHab2
		# paysHab
		# departementHab

		$template->param("nationalite_francaise" => "checked") ; # On triche !


		# Service National
		if($serviceNational->{'situation_clair'}) {
			$template->param("situation_sn" => $serviceNational->{'situation_clair'}) ;
		}
		print STDERR "template DONE " . $serviceNational->{'situation_clair'} . "\n" ;

		print("Content-type: text/html\r\n\r\n");
		print $template->output ;
		print STDERR "template DONE \n" ;
	}

	$request->Finish();
}

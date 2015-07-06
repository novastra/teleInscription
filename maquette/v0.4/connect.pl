#!/usr/bin/perl

use FCGI ;

use strict ;
use LWP::UserAgent ;
use JSON ;
use HTML::HashTable ;
use Data::Dumper;
use Encode qw(encode decode) ;
use URI::Escape;
use HTML::Template ;
use Net::FranceConnect ;

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

while ($handling_request = ($request->Accept() >= 0)) {
	print STDERR Dumper(%ENV), "\n" ;
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


####################

sub do_request() {
	eval {
		my $fc = Net::FranceConnect->new ;
		$fc->setDebug(1) ;
		my $callbackURL = "http://hackathon.local/teleInscription/urlCallback.pl" ;
		for my $i ('men_diplomes', 'dgfip_rp', 'situation_service_national', 'etatcivil_cnf') {
			$fc->setUseFD($i) ;
		}
		my $template = HTML::Template->new(filename => 'connexion.tmpl' ,
																			 path => ['maquette/current',
																								'maquette/v0.4',
																								'/Users/olivier/Development/teleInscription.xcworkspace/teleInscription/maquette/v0.4'
																							]
																		 );
		print STDERR "FC URL : ", $fc->generateAuthorizeUrl($callbackURL), "\n" ;
		print STDERR "Session : ", $fc->getSessionId(), "\n" ;

		$template->param('URL_FC' => $fc->generateAuthorizeUrl($callbackURL)) ;

		print("Content-type: text/html\r\n\r\n");
		print $template->output ;
		print "\n" ;
		$request->Finish();
		$fc->enregistrer() ;
	}
		;
	if ($@) {
		print STDERR "Erreur : $@\n" ;
	}
}

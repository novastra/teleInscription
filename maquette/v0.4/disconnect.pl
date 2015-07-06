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


# label : DGFIP - Projet Télé-inscription

# URLs de redirection :

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
	print "HTTP/1.0 301" ;
	print "Content-type: text/html; charset=utf-8\r\n" ;
	eval {
		my $fc = Net::FranceConnect->new() ;
		$fc->setDebug($DEBUG) ;
		if ( $fc->initFromQueryString($ENV{'QUERY_STRING'}) ) {
			print "Status: 301 Moved Permanantly\r\n" ;
			print "Location: ", $fc->generateLogoutUrl(), "\r\n" ;
			$fc->supprimer() ;

			print STDERR "Status: 301 Moved Permanantly\r\n" ;
			print STDERR "Location: ", $fc->generateLogoutUrl("http://hackathon.local/teleInscription/connexion.pl"), "\r\n" ;
		}
	} ;
	if($@) {
		print STDERR "Erreur disconnect : ", $@, "\n" ;
	}
	print "\r\n\r\n" ;
	$request->Finish();
}


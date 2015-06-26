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

sub do_request()
{
    #my $clientID = "ad1a0a5c98728c5a837f23a1e7cbdba779bd68b599517cdb0a788604f45da323" ;
    #my $callbackURL = "http://127.0.0.1/hackathon/urlcallback.pl" ;
    my $clientID = "9641ff3252bf9b00dc852bfa359629a7d963c2d10d407c03" ;
    my $callbackURL = "http://hackathon.local/teleInscription/urlCallback.pl" ;

    my $fcURL = 'https://fcp.integ01.dev-franceconnect.fr/api/v1/authorize?' ;

    print("Content-type: text/html\r\n\r\n");
    my %opts =
      (
       response_type => 'code',
       scope => uri_escape(join(' ', ('profile', 'email', 'address', 'phone', 'openid', 'ods_etatcivil_cnf', 'ods_fai_contact', 'ods_men_diplomes'))),
       client_id => $clientID,
       redirect_uri => uri_escape($callbackURL),

       acr_values => 'eidas2',
       state => '923324b770767f8e709088bd2bf08452b8d35ecf81416e1019',
       nonce => '182b38d12e3dcdced2376ba8c25aff84a4271e06ddd9bd5445'
      ) ;
		$|=1;
		eval {
			my $template = HTML::Template->new(filename => 'connexion.tmpl' ,
																				 path => ['maquette/current',
																									'maquette/v0.4',
																									'/Users/olivier/Development/teleInscription.xcworkspace/teleInscription/maquette/v0.4'
																								]
																			 );
			print STDERR "FC URL : ", $fcURL . join('&', map {$_ . "=" . $opts{$_}} keys %opts) . "\n" ;
			$template->param('URL_FC' => $fcURL . join('&', map {$_ . "=" . $opts{$_}} keys %opts)) ;
			print $template->output ;
			print "\n" ;
		} ;
		if($@) {
			my $msg = $@ ;
			print STDERR "Error generating template for connexion.tmpl : " . $msg . "\n";
		}
    $request->Finish();
  }

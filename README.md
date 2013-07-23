leads-js
========
A script that conveniently stands alone from any javascript frameworks to side load itself into any webpage.

Designed initially to work with the Gravity Forms system, but has been updated to support generic forms as well.

##Configurable Options
LEADS_DEBUG - Will allow console logs
LEADS_PREFIX - Changes the prefix of the fields it looks for ('gf_medium') 
LEADS_COOKIE_NAME - The name of the cookie it uses (all handled by the script)
To control those options, you have to set them globally before you include in the main js file.  I have an example at the bottom of the email.

##Cookie
The cookie will keep track of all of the information persistently, with the exception of internal_url (since that is allowed to change).

The cookie is a session cookie.  It will expire as soon as the browser closes.  It will also rewrite the information if the referring URL changes (in case they come to the site by some other means).

##Search Engines
The search engines set up to activate SEO mode are:
* google
* bing
* yahoo
* ask

##Order of Logic
If the script figures out that the request is from a search engine, it will override PPC as the medium.  I believe the script will still save everything about PPC, but the medium will be altered.

Though, I don't think that it will really matter.  It has only really come up with testing and that will probably never happen in production.

##Browser Support
The script doesn't require anything to run, but I do believe it won't run in IE7 and below.

The reason for that is JSON.parse and stringify don't exist before IE8.  If that is a problem, I would recommend inserting a script above the main JS file like so:

<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.js"></script>

##Quick example:

<!--[if lte IE 7]>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/json2/20121008/json2.js"></script>
<![endif]-->
<script>LEADS_DEBUG=true;</script>
<script type="text/javascript" src="path/to/leads.js"></script>

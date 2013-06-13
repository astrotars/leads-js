(function() {
 
    /**
     * Sets cookie prefix if LEADS_COOKIE_NAME global is set. Defaults to __gfLeads.
     */
 
    var cookieName = (window.LEADS_COOKIE_NAME || '__gfLeads'),
        prefix = (window.LEADS_PREFIX || 'gf_'),
        debug = (window.LEADS_DEBUG || false);
 
    /**
     * Referring search engines
     */
    var search_engines = [
        'google', 'bing', 'ask', 'yahoo'
    ];
 
 
    /**
     * Debugging purposes
     */
 
    var log = function() {
 
        if (debug) {
 
            var args = [prefix + 'leads debug:'];
 
            for (var i = 0; i < arguments.length;  i++) {
                args.push(arguments[i]);
            }
 
            console.log(args);
 
        }
 
    };
    
 
    /**
     * Writes cookie -- We need data to persist across different page loads.
     */
 
    var writeCookie = function(name, value, expires) {
 
        var date = new Date();
        date.setDate(date.getDate() + expires); // set an expiration date
 
        var data = escape(value) + ((expires === null) ? '' : '; expires='+ date.toUTCString());
        document.cookie = name + "=" + data; // write the cookie
 
    };
 
 
    /**
     * Gets and returns a specific cookie from the browser
     */
 
    var getCookie = function(name) {
 
        var cookies = document.cookie;
        // Our regex matches the name of the cookie and then pulls out the content all the way until the semicolon
        var matches = cookies.match(new RegExp('('+ name + ')\=([^\;]+)', 'i'));
 
        // no cookie found
        if (!matches || matches.length === 0) {
            return false;
        }
 
        matches.shift(); // remove the first item from the results array (which is the pattern)
 
        return unescape(matches[1]); // cookies are escaped, so fix that
 
    };
 
    /**
     * Force Javascript to parse out the URI passed over to it by creating
     * an anchor element.
     */
 
    var parseURI = function(uri) {
 
        // Apparently, if you simply create an anchor element, the browser creates a parsed URI object based on it
        var a = document.createElement('a'); 
        a.href = uri;
 
        return a;
 
    };
 
 
    /**
     * Return a GET/Query parameter by name
     */
 
    var getParameterByName = function(name, queryString) {
 
        // Thanks to Stackoverflow for the bulk of this code.  Looks like we are adjusting the potential arrays
        // inside of our query string
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
 
        // Based on the property name grab the potential content immediately following it.
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec((queryString || window.location.search));// handle if they pass a URI directly or just use the current one
 
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " ")); // decode what we have returned
 
    };
 
 
    /**
     * Start setting up our info object to pass to the form
     */
 
    var info = {}, // we will store pretty much every piece of info in here
        inputNames = [ // the fields we will be looking for
            'external_url', 
            'internal_url', 
            'medium', 
            'ppc_source', 
            'ppc_campaign', 
            'ppc_keyword', 
            'ppc_content', 
            'seo_source', 
            'seo_query'
        ],
        seo_matches;
    
    // pre-populate fields to blank strings
    for (var i = 0; i < inputNames.length; i++) {
        info[inputNames[i]] = '';
    }
 
 
    /**
     * Compare hosts with the referring url
     */
 
    var referringURI = parseURI(document.referrer);
 
    // internal referrer
    if (referringURI.host == window.location.host) { // if the hosts are the same... internal URL
        
        info.external_referrer = false; // this will tell the script later that we are using internal URL
        info.internal_referrer = document.referrer;
 
    // external referrer
    } else {
 
        info.external_referrer = document.referrer;
        info.internal_referrer = false; // same as above, let the script later know this is internal
 
    }
 
 
    /**
     * We will assume the "medium" is other, but we will run other checks and
     * override that if necessary
     */
 
    info.medium = 'other'; // default to 'other'
    var utm_medium = getParameterByName('utm_medium'); // parsing our current URL for this query param
 
 
    /**
     * Check to see if it is a PPC referral
     */
 
    var query = window.location.search; // we just want the query string
 
    if (utm_medium == 'cpc') { // first we try to see if this is a CPC/PPC request
 
        info.medium = 'ppc'; 
        // grab all of the other fields
        info.ppc_source = getParameterByName('utm_source');
        info.ppc_campaign = getParameterByName('utm_campaign');
        info.ppc_content = getParameterByName('utm_content');
        info.ppc_keyword = getParameterByName('utm_keyword');
 
    }
 
    // seo
    // if the above didn't fire (it takes priority), then lets see if its from a search engine via the referring URL
    // I'm combining all of the search engines into this regex and then we will use the match to return the engine
    else if (seo_matches = document.referrer.match(new RegExp('('+ search_engines.join('|') + ')', 'i'))) {
 
        info.medium = 'seo';
        info.seo_source = seo_matches[1].split('.')[0];
 
        var queryMatches = document.referrer.match(/q\=([^\&]+)/); // grab the "search query" -- usually in a "q" get variable
 
        if (queryMatches && queryMatches.length === 2) {
            info.seo_query = queryMatches[1].split('+').join(' '); // spaces are turned into pluses, so switch those out
        } else {
            info.seo_query = false; // well, we didn't have a search.  the user could have been logged in.
        }
 
    }
 
    info.internal_url = (info.internal_referrer || ''); // if our internal referrer is false, just make it blank
    
    if (!getCookie(cookieName)) { // we don't have a cookie, so lets serialize our data and save it
        writeCookie(cookieName, JSON.stringify(info));
    }
    
    var internal = info.internal_referrer;
    var cookie = JSON.parse(getCookie(cookieName)); // turn our cookie into an object
 
    // if cookie is set, and user is coming in from another URL -- meaning 
    // the user strolled back over here from another application but using the same session
    if (cookie.external_referrer != info.external_referrer) {
 
        // re-write external referrer
        writeCookie(cookieName, JSON.stringify(info));
 
    }
 
    info = cookie; // rename our cookie object to 'info'
    
    // these fields were named differently above.  rename them here too
    info.external_url = info.external_referrer; 
    info.internal_url = internal;
    
    log(info); // if debugging is on, show a list of everything we are keeping track on each request
 
    // if a form exists on the page, go ahead and add our values to it (avoid empty values)
    window.onload = function() {
 
        // checking to see if we have at least one form on the page
        if (document.getElementsByTagName('form').length > 0) {
            
            for (var i = 0; i < inputNames.length; i++) {
 
                // now we are looking to find all of the fields that we defined way at the top
                var field = inputNames[i],
                    elm = document.getElementsByName(prefix + field);
                    
                if (elm.length > 0) { // we have a match
                    
                    // if the internal data isn't actually defined, just put a string... otherwise show our findings
                    elm[0].value = (typeof info[field] !== 'undefined') ? info[field] : ''; 
                }
 
            }
        }
 
    };
 
})();
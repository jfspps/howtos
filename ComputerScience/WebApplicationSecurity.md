---
title: Web Application Security
nav_order: 3
parent: Computer Science
---

# Web Application Security

This article covers the main security concerns when developing web services and clients, following on from the article, [Essential Computer Security](./ComputerSecurity.md).

## High-level threat analysis

Microsoft have devised a popular threat model (STRIDE) that identifies the main types of attacks:

+ Spoofing identity: impersonating other users
+ Tampering with data: manipulating data that the user should not have access to
+ Repudiation: untraceable user actions, particularly important when resolving matters where users lie about what they did
+ Information disclosure: revealing private information about one user to a different user
+ Denial of Service: when a service is flooded with requests, preventing others from accessing the resource
+ Elevation of Privilege: ensuring authorisation actually works, making sure users with given roles cannot perform actions with greater privileges

STRIDE helps system level architects and developers to identify security threats before release.

When building and deploying secure web applications, many of the barriers can be applied at the code level and also the deployment level. For example, an API may require authentication that identifies an individual user, but it is also beneficial to ensure that the web client is known. This is where API keys can prove useful. One can also integrate firewalls and/or public to private gateways, eventually providing a comprehensive layered system.

## Security checklists

As alluded to in the [Software Testing](../SoftwareEngineering/SoftwareTesting.md) article, the [Open Web Application Security Project (OWASP)](https://owasp.org/) and [Common Weakness Enumeration (CWE) project](https://cwe.mitre.org) provide checklists of some of the more prevalent security issues to consider. The main examples are summarised here.

### Injection attacks

This occurs when untrusted data is mixed with trusted data. A common example are SQL injection attacks which occur when the intended SQL query is partially malformed so that it compromises the database.

### Broken authentication and session management

This is where the developer has implemented a poorly designed session management system. When the user logs in, setting a cookie that all local services accept requests from is not good design. Instead, the session information should be stored on a separate location or database that only the authenticator can access. The web service would return a session hash or token that references the session, and not return the session data itself.

In extension, one can design a web service that uses a private key to sign the cookie so that it knows that only it provided the cookie.

Sessions should always expire at some point. For very sensitive transactions, the web service can provide a session that expires shortly after the request was performed. For less sensitive transactions, the web service can provide a longer-lasting session, with access controls defined, to avoid requiring the end-user to log in too frequently.

Do not place session tokens in the URL, as a query parameter, otherwise this gives rise to all sorts of impersonation vulnerabilities.

Prevent users from attempting too many login attempts too and guard against brute-force (i.e. keep guessing the password) requests.

### Cross Site Scripting XSS

Most web browsers have a _same-origin policy_, where Javascript can only access resources from the same domain. This prevents web browsers from, for example, loading reading or setting cookies for different domains (so preventing credentials from being stolen) or running code from external resources as an iframe in the current domain.

### Insecure Direct Object References

This is an error that occurs when the web resource does not check whether or not the user is allowed to access it. For example, if a user can surmise that since a PDF from ```hostname/path/xyz.pdf``` is accessible, then perhaps other PDFs are available, simply by modifying the filename e.g. ```hostname/path/abc.pdf```.

A workaround to this is to employ random or time-limited URLs or identifiers for the web resource requested. Really, one should apply the same rigorous authentication and authorisation flows for all web resources.

### Security Misconfiguration

Security systems often come with default settings, including administrator passwords, that must be changed before going live. Not configuring the firewall correctly is another issue. Administrators that overlook these concerns will leave the system open to attack.

From a development perspective, most systems remain in DEBUG mode, printing valuable information to an adversary that reveals the configuration of the system.

### Sensitive Data Exposure

This is about how to manage sensitive data. Where would one store and then manage access to sensitive data.

Sensitive information in storage should be protected by the hosts own security access control. Databases that store cookies should only provide access to said cookies to known agents. Use encrypted storage where possible.

Sensitive information in transit should always be funneled and marked secure across networks, e.g. HTTPS instead of HTTP.

If possible, avoid saving sensitive information altogether, especially if it not needed following a given request or transaction. Credit and debit card details are one good example.

### Missing function Level Access Control

This is about assigning more fine-grained access to functions that are available under a higher-level function through authorisation. For example, a user might be able to retrieve a record, but they cannot modify or delete it. The latter two requests would appear under a general URL but use different HTTP methods (PUT and DELETE, in this case).

Frontends should generally check if a user is authorised to access a given resource (since privileges may change without the frontend knowing about it). In short, it is the backend that must ensure that access control at the code level is secured.

### Cross Site Request Forgery CSRF

This is a consequence of the same-origin restriction imposed by most web browsers. Take the following scenario:

+ The user logs in to the legitimate website and receives a session cookie that is then stored in their browser
+ The user then accesses (or is tricked into accessing) a malicious website that invites the user to interact with a form
+ The malicious site's request is forwarded to legitimate site
+ The legitimate site interprets the request as valid, since the cookie is valid and the request is performed by the legitimate site (the same-origin)

The malicious site can then go about performing other requests "on behalf" of the user. Eventually, a single malicious link to access one resource on behalf of the victim can be used to perform multiple requests on the victim's behalf without them knowing about it.

To address this, developers can add a ```Origin``` or ```Referer``` header to all requests and set the domain the request is supposed to come from. 

Additionally, sensitive requests should be performed by POST requests, not GET requests. The form can include a unique token, known to and sent by the service. When the user submits the form, the server can check the token is a match.

### Using Known Vulnerable Components

This relates to developing with libraries (dependencies) that are not maintained and/or become a vulnerability. Make sure that everything used is kept up-to-date.

### Unvalidated Redirects and Forwards

When the redirect literal is partly based on the user's input (e.g. they log in to an account, the redirect URL literal contains something about the account name), then a adversary can modify the input (an example of an injection attack) and redirect the user to a different location.

+ Suppose that a legitimate site serves ```https://hostname/login?redirectTo=https://hostname/personal-account```. This is the redirect a user would receive if they have not logged in. Furthermore, suppose that the server does not check if the redirect request to ```https://hostname/personal-account``` for authenticated users is something it is responsible for (i.e. no URL validation performed).
+ If an adversary convinced an unauthenticated user to invoke the request to ```https://hostname/login?redirectTo=https://aBadPlace/``` as part of a foreign form, then 
  - the legitimate website would accept the login, since the endpoint ```https://hostname/login``` is valid
  - the adversary would be able to steal the login credentials (an example of _phishing_)
  - the user would be sent to the bad place, since the legitimate server does not check if it serves ```https://aBadPlace/```

The key solution to this is to validate the redirect. If the URL ```https://aBadPlace/``` is not known to the server, then do not proceed with the login.

## Passwords

At some point, secrets such as passwords need to be stored in a database. These should be stored as a hash so that if the database is compromised then it will not be possible to get access to the raw password.

Hashed passwords realistically cannot be decrypted. However, many hashing algorithms use the same flow and do not always introduce any form of randomness to the hash. If an adversary can discover what algorithm was used then they can build a dictionary of hashed password and back-correlate the user's password. Using a slow algorithm can hinder the adversary as they build a list of possibilities.

To mitigate the above problem, password hashes can be _salted_, i.e. by introducing a random element to the end of the hash, and then rehashing the salted hash. Another approach is to _pepper_ the hash, with a known (and potentially constant) element, typically a secret defined at random on startup (and therefore not stored in a database), to all hashed passwords. Some security measures apply salt and pepper.

Making passwords long and difficult to guess provides some hindrance to a hacker, but places more demand on the user.

With multiple secured systems in use by any one user, many users will end up using the same password for different accounts. Clearly, independent systems do not collaborate to ensure passwords are different. This in part led to the conception of single-sign on (SSO).

One approach is to email users with a time-limited token or password. However, this solution presents a single point of failure. If the email provider or receiver device is compromised, then all of the user's accounts will be vulnerable to attack.

Passwords can be forgotten and so users will often want to reset their password pre-login. This is fine as long as the password scheme (what the raw password format is) is sufficiently strong. Passwords which are only based on lowercase alphabetical characters is not a strong scheme. 

The server can contact the user to confirm that they requested a password reset. However, if the adversary can read the password reset request confirmation from, for example, an email inbox, then the problem is not resolved. From a front-end perspective, it is important to never indicate if the username was valid on a password reset request, since this will inform the adversary which accounts they can target.

To protect a user's account from brute-force methods that attempt to guess the password, one can limit the number of login attempts over a given period. Blacklisting IP addresses temporarily or until an administrator unlocks the account, is one approach.

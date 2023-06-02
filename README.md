# officer-filing-web
Web front end for Officer Filing service 

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

### Getting started

To checkout and build the service:
1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README. 
2. Run ./bin/chs-dev modules enable officer-filing-api
3. Run ./bin/chs-dev development enable officer-filing-web (this will allow you to make changes).
4. Run docker using "tilt up" in the docker-chs-development directory.
5. Use spacebar in the command line to open tilt window - wait for officer-filing-web to become green.
6. Open your browser and go to page http://chs.local/officer-filing-web

These instructions are for a local docker environment.

### Running Tests
In order to run tests locally you will need to do the following:
1. Navigate to /officer-filing-web/
2. Run 'git submodule init', followed by 'git submodule update'.
3. Run 'npm test'

### Config variables

Key             | Example Value   | Description
----------------|---------------- |------------------------------------
CACHE_SERVER | redis               | Required for storing values in memory
CDN_HOST     | http://cdn.chs.local | Used when navigating to the webpage
COOKIE_DOMAIN| chs.local |
COOKIE_NAME  |__SID |
COOKIE_SECRET | 
SHOW_SERVICE_OFFLINE_PAGE | false | Feature Flag

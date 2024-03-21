# officer-filing-web

CHS Web front end for officer filings:

1. TM01 Remove a director
2. AP01 Appoint a director
3. CH01 Update a director

This Node / Express / Typescript Web app sits in from of officer-filing-api and uses Nunjucks and the GOV.UK design toolkit to implement these three Web journeys.

## DISCLAIMER ***********************************************************************
Due to a problem with where GOV-UK Frontened looks for it's fonts, we have had to add an override
in styles.html.
The problem was that we are using the newer version of GOVUK-Frontend. Version 4.6.0.

This newer version looks for the fonts in a different place to the older versions, it looks for them 
in {cdnHost}/assets/fonts/{font name}

older versions look for it in {cdnHost}/fonts/{font name}. So because the older versions looked for it there,  
the cdn builder builds it and puts the fonts in that location, so when using the new GOV-UK Frontend,  
it doesn’t find the fonts.

We have added an override to tell it to look in the /fonts location instead, this will fix the symptom, 
but not cure the problem, as any changes to the fonts urls in future GOV-UK Frontend releases, 
will mean it will stop working.

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
6. Open your browser and go to page http://chs.local/appoint-update-remove-company-officer/

These instructions are for a local docker environment.

### Running Tests
In order to run tests locally you will need to do the following:
1. Navigate to /officer-filing-web/
2. Run 'git submodule init', followed by 'git submodule update'.
3. Run 'npm test'

### Config variables

Please see the configuration in the terraform folder.

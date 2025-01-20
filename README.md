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

### Endpoints
BASE_URL=/appoint-update-remove-company-officer
COMPANY_URL=BASE_URL/company/<company_number>
TRANSACTION_URL=COMPANY_URL/transaction/<transaction_number>
SUBMISSION_URL=TRANSACTION_UR/submission/<submission>

Path                                                                   | Method   | Description
---------------------------------------------------------------------- | -------- | --------------------------------------------------------------------
*` BASE_URL `*                                                         | GET      | Starting page for appoint, update and remove officer
*` BASE_URL/service-error `*                                           | GET      | Service error
*` BASE_URL/signout `*                                                 | GET      | Signout
*` BASE_URL/signout `*                                                 | POST     | Signout
*` BASE_URL/company-number `*                                          | GET      | 'Start now' link. Redirect to company lookup
*` BASE_URL/accessibility-statement `*                                 | GET      | Accessibility statement
*` BASE_URL/confirm-company `*                                         | GET      | Confirm correct company
*` BASE_URL/confirm-company `*                                         | POST     | Confirm correct company and continue. Redirect to company authentication
*` COMPANY_URL/cannot-use `*                                           | GET      |
*` TRANSACTION_URL `*                                                  | GET      | Create a transaction and redirect to current directors
*` TRANSACTION_URL/current-directors `*                                | GET      | Show current directors
*` TRANSACTION_URL/current-directors `*                                | POST     | Redirect to director appointment / name
*` SUBMISSION_URL/cannot-use `*                                        | GET      |
*` SUBMISSION_URL/director-name `*                                     | GET      | Enter new director's name
*` SUBMISSION_URL/director-name `*                                     | POST     | Save name, redirect to director date details
*` SUBMISSION_URL/director-date-details `*                             | GET      | Enter new director's date details
*` SUBMISSION_URL/director-date-details `*                             | POST     | Save date details, redirect to director nationality
*` SUBMISSION_URL/director-nationality `*                              | GET      | Enter new director's nationality
*` SUBMISSION_URL/director-nationality `*                              | POST     | Save nationality, redirect to director occupation
*` SUBMISSION_URL/director-occupation `*                               | GET      | Enter new director's occupation
*` SUBMISSION_URL/director-occupation `*                               | POST     | Save occupation, redirect to director correspondence address
*` SUBMISSION_URL/director-correspondence-address `*                   | GET      | Enter new director's correspondence address
*` SUBMISSION_URL/director-correspondence-address `*                   | POST     | Save correspondence address, redirect to director home address
*` SUBMISSION_URL/director-correspondence-address-search `*            | GET      | Enter postcode and name or number
*` SUBMISSION_URL/director-correspondence-address-search `*            | POST     | Lookup address
*` SUBMISSION_URL/director-correspondence-address-manual `*            | GET      | Enter new director's correspondence address manually
*` SUBMISSION_URL/director-correspondence-address-manual `*            | POST     | Save correspondence address, redirect to confirm correspondence address
*` SUBMISSION_URL/confirm-director-correspondence-address `*           | GET      | Confirm correspondence address
*` SUBMISSION_URL/confirm-director-correspondence-address `*           | POST     | Save correspondence address, redirect to home address
*` SUBMISSION_URL/director-home-address `*                             | GET      | Choose same as correspondence address or different
*` SUBMISSION_URL/director-home-address `*                             | POST     | Redirect to home address search if different
*` SUBMISSION_URL/link-home-address `*                                 | GET      | Link residential address
*` SUBMISSION_URL/link-home-address `*                                 | POST     | Save residential address link
*` SUBMISSION_URL/director-home-address-search `*                      | GET      | Enter residential address postcode and name or number
*` SUBMISSION_URL/director-home-address-search `*                      | POST     | Save
*` SUBMISSION_URL/director-home-address-manual `*                      | GET      | Enter residential address
*` SUBMISSION_URL/director-home-address-manual `*                      | POST     | Save address and redirect to confirmation screen
*` SUBMISSION_URL/choose-home-address `*                               | GET      | Choose residential address
*` SUBMISSION_URL/choose-home-address `*                               | POST     | Save residential address choice
*` SUBMISSION_URL/confirm-director-home-address `*                     | GET      | Confirm home address details
*` SUBMISSION_URL/confirm-director-home-address `*                     | POST     | Redirect to director personal details protected
*` SUBMISSION_URL/director-personal-information-protected `*           | GET      | Confirm whether personal information protected
*` SUBMISSION_URL/director-personal-information-protected `*           | POST     | Save choice and redirect to confirmation screen
*` SUBMISSION_URL/appoint-director-check-answers `*                    | GET      | Confirm director details
*` SUBMISSION_URL/appoint-director-check-answers `*                    | POST     | Submit appointment and redirect to submitted screen
*` SUBMISSION_URL/appoint-director-submitted `*                        | GET      | Submission details
*` SUBMISSION_URL/link-correspondence-address `*                       | GET      | Update linked address
*` SUBMISSION_URL/link-correspondence-address `*                       | POST     | Save link and redirect to home address
*` SUBMISSION_URL/link-correspondence-address-enter-manually `*        | GET      | Update linked address
*` SUBMISSION_URL/link-correspondence-address-enter-manually `*        | POST     | Save link and redirect to home address
*` SUBMISSION_URL/choose-correspondence-address `*                     | GET      |
*` SUBMISSION_URL/choose-correspondence-address `*                     | POST     |
*` SUBMISSION_URL/update-director-details `*                           | GET      | View director details with links to update name, nationality, address
*` SUBMISSION_URL/update-director-details `*                           | POST     | Update director details
*` SUBMISSION_URL/update-director-name `*                              | GET      | Update director name
*` SUBMISSION_URL/update-director-name `*                              | POST     | Save director name and redirect back to director details
*` SUBMISSION_URL/update-director-nationality `*                       | GET      | Update director nationality
*` SUBMISSION_URL/update-director-nationality `*                       | POST     | Save director nationality and redirect back to director details
*` SUBMISSION_URL/update-director-occupation `*                        | GET      | Update director occupation
*` SUBMISSION_URL/update-director-occupation `*                        | POST     | Save director occupation and redirect back to director details
*` SUBMISSION_URL/update-director-correspondence-address `*            | GET      | Update correspondence address choices - same or different
*` SUBMISSION_URL/update-director-correspondence-address `*            | POST     | Save choice and redirect to find the address
*` SUBMISSION_URL/update-enter-director-correspondence-address `*      | GET      | Update correspondence address details manually
*` SUBMISSION_URL/update-enter-director-correspondence-address `*      | POST     | Save address and redirect to confirmation screen
*` SUBMISSION_URL/update-confirm-director-correspondence-address `*    | GET      | Confirm correspondence address details
*` SUBMISSION_URL/update-confirm-director-correspondence-address `*    | POST     | Redirect to director home address choices
*` SUBMISSION_URL/update-director-home-address `*                      | GET      | Update home address choices - same or different
*` SUBMISSION_URL/update-director-home-address `*                      | POST     | Save choice and redirect to find the address
*` SUBMISSION_URL/update-enter-director-home-address `*                | GET      | Update home address details manually
*` SUBMISSION_URL/update-enter-director-home-address `*                | POST     | Save address and redirect to confirmation screen
*` SUBMISSION_URL/update-confirm-director-home-address `*              | GET      | Confirm home address details
*` SUBMISSION_URL/update-confirm-director-home-address `*              | POST     | Redirect to director details
*` SUBMISSION_URL/update-date `*                                       | GET      | Update director details change date
*` SUBMISSION_URL/update-date `*                                       | POST     | Save date and redirect to confirmation screen
*` SUBMISSION_URL/update-director-check-answers `*                     | GET      | Update director details change date
*` SUBMISSION_URL/update-director-check-answers `*                     | POST     | Submit details of change
*` SUBMISSION_URL/link-correspondence-address-update `*                | GET      | Update linked address
*` SUBMISSION_URL/link-correspondence-address-update `*                | POST     | Save updated linked address
*` SUBMISSION_URL/update-link-correspondence-address-enter-manually `* | GET      | Update linked address
*` SUBMISSION_URL/update-link-correspondence-address-enter-manually `* | POST     | Save link and redirect to home address
*` SUBMISSION_URL/update-find-director-correspondence-address `*       | GET      | Correspondence address search
*` SUBMISSION_URL/update-find-director-correspondence-address `*       | POST     | Save updated linked address
*` SUBMISSION_URL/update-choose-a-correspondence-address `*            | GET      | Choose a correspondence address
*` SUBMISSION_URL/update-choose-a-correspondence-address `*            | POST     | Save correspondence address choice
*` SUBMISSION_URL/link-home-update `*                                  | GET      | Update residential address link
*` SUBMISSION_URL/link-home-update `*                                  | POST     | Save updated residential address link
*` SUBMISSION_URL/find-director-home-address `*                        | GET      | Search residential address
*` SUBMISSION_URL/find-director-home-address `*                        | POST     | Search residential address
*` SUBMISSION_URL/choose-a-home-address `*                             | GET      | Choose residential address
*` SUBMISSION_URL/choose-a-home-address `*                             | POST     | Choose residential address
*` SUBMISSION_URL/update-director-submitted `*                         | GET      | Submission details
*` SUBMISSION_URL/date-director-removed `*                             | GET      | Enter director removal date
*` SUBMISSION_URL/date-director-removed `*                             | POST     | Redirect to confirmation screen
*` SUBMISSION_URL/remove-director-check-answers `*                     | GET      | Confirm director removal details
*` SUBMISSION_URL/remove-director-check-answers `*                     | POST     | Submit details of change and redirect to sbmission details
*` SUBMISSION_URL/remove-director-submitted `*                         | GET      | Submission details

*` SUBMISSION_URL/trading-status `*                                    | -
*` SUBMISSION_URL/active-officers `*                                   | -
*` SUBMISSION_URL/active-officers-details `*                           | -
*` SUBMISSION_URL/active-directors-details `*                          | -
*` SUBMISSION_URL/registered-office-address `*                         | -
*` SUBMISSION_URL/review `*                                            | -
*` SUBMISSION_URL/confirmation `*                                      | -
*` SUBMISSION_URL/payment-callback `*                                  | -

*` BASE_URL/invalid-company-status `*                                  | -
*` BASE_URL/paper-filing `*                                            | -
*` BASE_URL/use-webfiling `*                                           | -
*` BASE_URL/no-filing-required `*                                      | -
*` SUBMISSION_URL/link-correspondence-address `*                       | -

### Config variables

Please see the configuration in the terraform folder.

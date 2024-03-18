jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { dissolvedCompanyProfile, dissolvedMissingNameCompanyProfile, overseaCompanyCompanyProfile, overseaCompanyMissingNameCompanyProfile, validCompanyProfile } from "../mocks/company.profile.mock";
import { BASIC_STOP_PAGE_PATH } from "../../src/types/page.urls";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";
const SHOW_STOP_PAGE_PATH_URL = "/appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=";
const SHOW_STOP_PAGE_PATH_URL_DISSOLVED = SHOW_STOP_PAGE_PATH_URL + "dissolved";
const SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED = SHOW_STOP_PAGE_PATH_URL + "limited-unlimited";
const SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009 = SHOW_STOP_PAGE_PATH_URL + "pre-october-2009";
const SHOW_STOP_PAGE_PATH_URL_ETAG = SHOW_STOP_PAGE_PATH_URL + "etag";
const SHOW_STOP_PAGE_PATH_URL_SOMETHING_WENT_WRONG = SHOW_STOP_PAGE_PATH_URL + "something-went-wrong";
const SHOW_STOP_PAGE_PATH_URL_SECURE_OFFICER = SHOW_STOP_PAGE_PATH_URL + "secure-officer";
const THIS_COMPANY = "This company";
const THIS_COMPANY_LOWERCASE = "this company";
const THIS_COMPANY_WELSH = "y cwmni hwn";
const DISSOLVED_PAGE_HEADING = "Company is dissolved or in the process of being dissolved";
const DISSOLVED_PAGE_HEADING_WELSH = "Mae&#39;r cwmni wedi&#39;i ddiddymu neu yn y broses o gael ei ddiddymu";
const DISSOLVED_PAGE_BODY_TEXT = "cannot use this service because it has been dissolved, or it's in the process of being dissolved.";
const DISSOLVED_PAGE_BODY_TEXT_WELSH = "ddefnyddio'r gwasanaeth hwn oherwydd ei fod wedi ei ddiddymu, neu ei fod yn y broses o gael ei ddiddymu";
const NON_LIMITED_UNLIMITED_PAGE_HEADING = "Only limited and unlimited companies can use this service";
const NON_LIMITED_UNLIMITED_PAGE_BODY_TEXT = "You can only file director updates for TEST COMPANY using this service if it's a:";
const PRE_OCTOBER_2009_PAGE_HEADING = "Directors removed before 1 October 2009 must file on paper instead";
const PRE_OCTOBER_2009_PAGE_HEADING_WELSH = "Rhaid i gyfarwyddwyr a chafodd ei ddileu cyn 1 Hydref 2009 ffeilio ar bapur yn lle hynny";
const PRE_OCTOBER_2009_PAGE_BODY_TEXT = "The date the director was removed is before 1 October 2009.";
const PRE_OCTOBER_2009_PAGE_BODY_TEXT_WELSH = "Mae'r dyddiad y cafodd y cyfarwyddwr ei ddileu cyn 1 Hydref 2009.";
const ETAG_PAGE_HEADING = "Someone has already made updates for this director";
const ETAG_PAGE_HEADING_WELSH = "Mae rhywun eisoes wedi gwneud diweddariadau i'r cyfarwyddwr hwn";
const ETAG_PAGE_BODY_TEXT = "Since you started using this service, someone else has submitted an update to this director's details.";
const SOMETHING_WENT_WRONG_HEADING = "Something went wrong";
const SOMETHING_WENT_WRONG_BODY_TEXT = "<p>You need to <a href=/appoint-update-remove-company-officer?lang=en data-event-id=\"start-the-service-again-link\">start the service again</a>.</p>";
const SOMETHING_WENT_WRONG_BODY_TEXT_WELSH = "<p>Bydd angen i chi <a href=/appoint-update-remove-company-officer?lang=cy data-event-id=\"start-the-service-again-link\">ddechrau'r gwasanaeth eto</a>.</p>";
const SECURE_OFFICER_HEADING = "Update this director's details using WebFiling or a paper form";
const SECURE_OFFICER_HEADING_WELSH = "Diweddaru manylion y cyfarwyddwr hwn gan ddefnyddio WebFiling neu ffurflen bapur";
const START_SERVICE_AGAIN_URL = "appoint-update-remove-company-officer";

describe("Stop screen controller tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompanyProfile.mockClear();
  });

  it("Should navigate to dissolved stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);
    
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);
    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(response.text).toContain(dissolvedCompanyProfile.companyName.toUpperCase())
    expect(response.text).toContain(START_SERVICE_AGAIN_URL+"?lang=en");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should navigate to dissolved stop screen in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED + "&lang=cy");
    expect(response.text).toContain(DISSOLVED_PAGE_HEADING_WELSH);
    expect(response.text).toContain(DISSOLVED_PAGE_BODY_TEXT_WELSH);
    expect(response.text).toContain(START_SERVICE_AGAIN_URL+"?lang=cy");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should navigate to dissolved stop screen and replace company name with This company if not provided", async () => {
    dissolvedCompanyProfile.companyName = "";
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);
    expect(response.text).toContain(THIS_COMPANY + " " + DISSOLVED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should navigate to dissolved stop screen and replace company name with This company if not provided in welsh", async () => {
    dissolvedCompanyProfile.companyName = "";
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED + "&lang=cy");
    expect(response.text).toContain(THIS_COMPANY_WELSH + " " + DISSOLVED_PAGE_BODY_TEXT_WELSH);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });


  it("Should set the content to dissolved company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);

    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(response.text).toContain(dissolvedCompanyProfile.companyName);
    expect(response.text).toContain(DISSOLVED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to non limited-unlimited stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);

    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_HEADING);
    expect(response.text).toContain(overseaCompanyCompanyProfile.companyName.toUpperCase())
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should set the content to non limited-unlimited company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);

    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_HEADING);
    expect(response.text).toContain(overseaCompanyCompanyProfile.companyName.toUpperCase());
    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });


  it("Should navigate to non limited-unlimited stop screen in english with empty company", async () => {
    overseaCompanyCompanyProfile.companyName = "";
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);

    expect(response.text).toContain(THIS_COMPANY_LOWERCASE);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should navigate to non limited-unlimited stop screen in welsh company", async () => {
    overseaCompanyCompanyProfile.companyName = "";
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED + "&lang=cy");

    expect(response.text).toContain(THIS_COMPANY_WELSH);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should navigate to pre-october-2009 stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009);

    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_HEADING);
    expect(response.text).toContain(overseaCompanyCompanyProfile.companyName)
    expect(response.text).not.toContain("date-director-removed?lang=cy")
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should navigate to pre-october-2009 stop screen in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009 + "&lang=cy");

    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_HEADING_WELSH);
    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_BODY_TEXT_WELSH);
    expect(response.text).toContain("date-director-removed?lang=cy")
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should set the content to pre-october-2009 company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009);

    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_HEADING);
    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should substitute company name for 'This company' for dissolved company missing company name", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedMissingNameCompanyProfile);
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);
    expect(response.text).toContain("This company " + DISSOLVED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should substitute company name for 'this company' for non limited-unlimited company missing company name", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyMissingNameCompanyProfile);
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);
    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_BODY_TEXT.replace("TEST COMPANY", "this company"));
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should return error page if error is thrown when getting Company Profile", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const response = await request(app)
      .get(BASIC_STOP_PAGE_PATH);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("Should return error page if an unknown stop type is provided", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL + "undefined");

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to etag stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_ETAG);

    expect(response.text).toContain(ETAG_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should set the content to etag company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_ETAG);

    expect(response.text).toContain(ETAG_PAGE_HEADING);
    expect(response.text).toContain(ETAG_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to etag stop screen in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_ETAG + "&lang=cy");

    expect(response.text).toContain(ETAG_PAGE_HEADING_WELSH);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("Should display something-went-wrong stop-screen heading and content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_SOMETHING_WENT_WRONG + "&lang=en");

    expect(response.text).toContain(SOMETHING_WENT_WRONG_HEADING);
    expect(response.text).toContain(SOMETHING_WENT_WRONG_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should display something-went-wrong stop-screen heading and content in Welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    console.log(SHOW_STOP_PAGE_PATH_URL_SOMETHING_WENT_WRONG + "&lang=cy")

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_SOMETHING_WENT_WRONG + "&lang=cy");

    expect(response.text).toContain("Aeth rhywbeth o'i le");
    expect(response.text).toContain(SOMETHING_WENT_WRONG_BODY_TEXT_WELSH);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to secure officer stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_SECURE_OFFICER);

    expect(response.text).toContain(SECURE_OFFICER_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to secure officer stop screen in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_SECURE_OFFICER +"&lang=cy");

    expect(response.text).toContain(SECURE_OFFICER_HEADING_WELSH);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to prohibited company type stop screen in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED + "&lang=cy");

    expect(response.text).toContain("Dim ond Cwmnïau cyfyngedig ac anghyfyngedig gall ddefnyddio'r gwasanaeth hwn");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });
});

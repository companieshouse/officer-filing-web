jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { STOP_TYPE } from "../../../src/utils/constants";
import { UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, UPDATE_DIRECTOR_DETAILS_PATH, UPDATE_DIRECTOR_NATIONALITY_PATH, urlParams } from "../../../src/types/page.urls";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director's nationality?";
const PAGE_HEADING_WELSH = "Beth yw cenedligrwydd y cyfarwyddwr?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const UPDATE_DIRECTOR_NATIONALITY_URL = UPDATE_DIRECTOR_NATIONALITY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_DIRECTOR_DETAILS_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_BACK_LINK_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const ETAG_STOP_PAGE_URL = `/appoint-update-remove-company-officer/company/${COMPANY_NUMBER}/cannot-use?stopType=${STOP_TYPE.ETAG}`;

describe("Update director nationality controller tests", () => {
  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetOfficerFiling.mockReset();
    jest.clearAllMocks();
  });

  describe("Get tests", () => {
    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it("Should navigate to update nationality page", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
      });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality2: "nationality2",
        nationality3: "nationality3",
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL + "?lang=en");

      expect(response.text).toContain(PAGE_HEADING);
    });

    it.each([[UPDATE_DIRECTOR_DETAILS_URL, "?lang=en", ""],
             [UPDATE_DIRECTOR_DETAILS_URL, "?lang=cy", ""],
             [UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL, "?lang=en", UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL],
             [UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL, "?lang=cy", UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL],
            ])
    ("Should navigate to page with backlinkUrl containing lang param", async (backLinkUrl, langParam, cyaLink) => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
      });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        checkYourAnswersLink: cyaLink,
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL + langParam);

      expect(response.text).toContain(backLinkUrl + langParam);
    });

    it("Should populate filing data on the page", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        forename: "John",
        otherForenames: "mid",
        surname: "Smith"
         });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality2: "nationality2",
        nationality3: "nationality3",
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("John Mid Smith");
      expect(response.text).toContain("nationality1");
      expect(response.text).toContain("nationality2");
      expect(response.text).toContain("nationality3");
    });

    it("Should render the page title in welsh", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
      });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality2: "nationality2",
        nationality3: "nationality3",
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL + "?lang=cy");
      expect(response.text).toContain(PAGE_HEADING_WELSH);
    });

    it("should catch error", async () => {
      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);
      mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it ("should show nationality2 if director has nationality2", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality2: "nationality2",
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);
      expect(response.text).not.toContain('"{{nationality2_hidden}}" === "true"');
    });

    it ("should not show nationality2 if director has no nationality2 and nationality2 link is false", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
      });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality2Link: "SHOW-ADD-SECOND-NATIONALITY"
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);
      expect(response.text).toContain('\"SHOW-ADD-SECOND-NATIONALITY\" === \"true\"');
    });

    it ("should not show nationality3 if director appointment has no nationality3 and nationality3 link is false", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
      });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality3Link: "SHOW-ADD-THIRD-NATIONALITY"
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);
      expect(response.text).toContain('\"SHOW-ADD-THIRD-NATIONALITY\" === \"true\"');
    });

    it ("should show nationality3 if director has nationality3", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
      });

      mockGetOfficerFiling.mockResolvedValueOnce({
        nationality1: "nationality1",
        nationality2Link: "nationality2Link",
        nationality3: "nationality3",
      });

      const response = await request(app).get(UPDATE_DIRECTOR_NATIONALITY_URL);
      expect(response.text).toContain('\"nationality2Link\" === \"true\"');
      expect(response.text).not.toContain('"{{nationality3_hidden}}" === "true"');
    });
  });

  describe("POST tests", () => {

    it("Should redirect to update director details page after update with nationalityHasBeenUpdated true", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "Nation1"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "new Nation",
        nationality2: undefined,
        nationality3: undefined
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British"})
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
        nationalityHasBeenUpdated: true
      }))
    });

    it("Should redirect to update director details page after update with nationalityHasBeenUpdated true when a new nationality is added.", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "British"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "British",
        nationality2: undefined,
        nationality3: undefined
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British", typeahead_input_1: "Irish"})
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
        nationalityHasBeenUpdated: true
      }))
    });


    it("Should redirect to update director details page after removing one nationality with nationalityHasBeenUpdated true", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "British,Irish"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "British",
        nationality2: "Irish",
        nationality3: undefined
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British", typeahead_input_1: ""})
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
        nationalityHasBeenUpdated: true
      }))
    });

    it("Should redirect to update director details page after update with nationalityHasBeenUpdated false if same nationality1", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "British"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "Nation1",
        nationality2: undefined,
        nationality3: undefined
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British"});
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
        nationalityHasBeenUpdated: false
      }))
    });

    it("Should redirect to update director details page after update with nationalityHasBeenUpdated false if same nationality1 and nationality 2", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "British,Irish"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "British",
        nationality2: "Irish",
        nationality3: undefined
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British", typeahead_input_1:"Irish"});
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
        nationalityHasBeenUpdated: false
      }))
    });

    it("Should redirect to update director details page after update with nationalityHasBeenUpdated false if same nationality1, nationality 2 and nationality 3", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "British,Irish,Congolese (Congo)"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "British",
        nationality2: "Irish",
        nationality3: "Congolese (Congo)"
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British", typeahead_input_1:"Irish", typeahead_input_2:"Congolese (Congo)"});
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
        nationalityHasBeenUpdated: false
      }))
    });

    it("should redirect to update check your answers page if from CYA ", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        nationality: "British"
      });
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag",
        nationality1: "Nation1",
        nationality2: undefined,
        nationality3: undefined
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        checkYourAnswersLink: UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL
      }});
      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British"});
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_CHECK_YOUR_ANSWER_URL);
    })

    it("Should redirect to stop page if the etag fails validation", async () => {
      mockGetOfficerFiling.mockResolvedValue({
        referenceEtag: "etag"
      });
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "differentEtag"
      });

      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British"});
      expect(response.text).toContain("Found. Redirecting to " + ETAG_STOP_PAGE_URL);
    });

    it("should catch errors on submission if errors", async () => {
      mockPatchOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
      const response = await request(app)
        .post(UPDATE_DIRECTOR_NATIONALITY_URL)
        .send({typeahead_input_0:"British"});
      expect(response.text).toContain(ERROR_PAGE_HEADING);
      expect(response.text).not.toContain("Found. Redirecting to " + UPDATE_DIRECTOR_NATIONALITY_URL);
    });

    it("should set back link correctly if there are errors", async () => {
      mockGetOfficerFiling.mockResolvedValue({
        firstName: "John",
        lastName: "Smith"
      })
      const response = await request(app)
      .post(UPDATE_DIRECTOR_NATIONALITY_URL)
      .send({"nationality1": "~"});

      expect(response.text).toContain(UPDATE_BACK_LINK_URL);
    });

  });
})
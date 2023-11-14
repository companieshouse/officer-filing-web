jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import { Request } from 'express';
import { getOfficerFiling } from '../../src/services/officer.filing.service';
import { APPOINT_DIRECTOR_CHECK_ANSWERS, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END, DIRECTOR_APPOINTED_DATE, 
        DIRECTOR_APPOINTED_DATE_PATH_END, 
        DIRECTOR_NATIONALITY, 
      } from '../../src/types/page.urls';
import { getNationalityBackLink } from '../../src/utils/navigation';
import { describe, expect, jest, test } from '@jest/globals';

const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const req = {  
} as Request;


const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";

describe("Navigation utils",  () => {
  
  test(`get nationality back link returns ${DIRECTOR_APPOINTED_DATE} when ${DIRECTOR_NATIONALITY} page loads`, async () => {
    mockGetOfficerFiling.mockResolvedValueOnce({
      checkYourAnswersLink: undefined
      });  
      req.params = {
        PARAM_COMPANY_NUMBER: COMPANY_NUMBER,
        PARAM_TRANSACTION_ID: TRANSACTION_ID,
        PARAM_SUBMISSION_ID: SUBMISSION_ID
      }
    const getBackLinks = await getNationalityBackLink(req);
      
    expect(getBackLinks).toContain(DIRECTOR_APPOINTED_DATE_PATH_END);
  });

  test(`get nationality back link returns ${APPOINT_DIRECTOR_CHECK_ANSWERS} when ${DIRECTOR_NATIONALITY} page loads with check your answers link`, async () => {
    mockGetOfficerFiling.mockResolvedValueOnce({
      checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
      });
      
      req.params = {
        PARAM_COMPANY_NUMBER: COMPANY_NUMBER,
        PARAM_TRANSACTION_ID: TRANSACTION_ID,
        PARAM_SUBMISSION_ID: SUBMISSION_ID
      }
    const getBackLinks = await getNationalityBackLink(req);
    expect(getBackLinks).toContain(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END);
  });
})



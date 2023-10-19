jest.mock("../../src/middleware/check.your.answers.middleware");

import { NextFunction, Request, Response } from "express";
import { checkYourAnswersMiddleware } from "../../src/middleware/check.your.answers.middleware";

// get handle on mocked function
const mockcheckYourAnswersMiddleware = checkYourAnswersMiddleware as jest.Mock;

// tell the mock what to return
mockcheckYourAnswersMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockcheckYourAnswersMiddleware;
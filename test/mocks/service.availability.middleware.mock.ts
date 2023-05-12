jest.mock("../../src/middleware/service.availability.middleware");

import { NextFunction, Request, Response } from "express";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";

// get handle on mocked function
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;

// tell the mock what to return
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockServiceAvailabilityMiddleware;

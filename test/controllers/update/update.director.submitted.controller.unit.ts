import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing/types"
import { getUpdateSubmittedType } from "../../../src/controllers/update/update.director.submitted.controller"

let officerFiling: OfficerFiling = {
    
}

describe("Update Director Submitted Controller", () => {


    describe("Get tests", () => {

    })

    // describe("getUpdateSubmittedType test", () => {

    //     it("should return a string of update type", () => {
    //         const officerFiling: OfficerFiling = {
    //             nameHasBeenUpdated: true
    //         }
    //         const updateSubmittedType = getUpdateSubmittedType(officerFiling);

    //         expect(updateSubmittedType).toEqual("Name");
    //     });

    //     it("should return a string of update types with comma seperated values", () => {
    //         const officerFiling: OfficerFiling = {
    //             nameHasBeenUpdated: true,
    //             nationalityHasBeenUpdated: true,
    //             occupationHasBeenUpdated: true,
    //             residentialAddressHasBeenUpdated: true,
    //             correspondenceAddressHasBeenUpdated: true
    //         }

    //         const updateSubmittedType = getUpdateSubmittedType(officerFiling);
    //         const expectedString = "Name, Nationality, Occupation, Residential Address, Correspondence Address"

    //         expect(updateSubmittedType).toEqual(expectedString)
    //     });
        
    // })
})
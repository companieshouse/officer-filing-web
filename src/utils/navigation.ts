import { Navigation } from "model/navigation.model";
import * as urls from "../types/page.urls";
import { Templates } from "../types/template.paths";

export const NAVIGATION: Navigation =  {
  [urls.DIRECTOR_NATIONALITY]: {
    currentPage: Templates.DIRECTOR_NATIONALITY,
    previousPage: () => urls.DIRECTOR_APPOINTED_DATE_PATH,
    nextPage: [urls.DIRECTOR_OCCUPATION]
  }
}
import { Navigation } from "model/navigation.model";
import * as urls from "../types/page.urls";
import { urlUtils } from "./url";

export const NAVIGATION: Navigation = {
  [urls.DIRECTOR_NATIONALITY]: {
    currentPage: urls.DIRECTOR_NATIONALITY,
    previousPage: () => "",
    nextPage: [urls.DIRECTOR_OCCUPATION]
  }
}
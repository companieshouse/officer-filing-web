import { PageItem, PaginationData } from '../types';

/**
 * Build a Pagination Data object that is used in concjunction with the gov pagination element to render navigation on a page. 
 * This includes a list of clickable numbers representing pages that can be navigated to from the current page.
 * Previous and Next links are added if applicable. Ellipses are used to represent a gap of 2 or more numbers.
 * The list of items is shortened depending on page availability. There is a maximum of 7 items that can be displayed at any one time (excluding previous and next).
 * These items are split into the following zones when calculating: 
 *    Prev --- first, second --- mid-L, mid, mid-R --- second-to-last, last --- Next.
 * @param currentPageNumber The current number that the user is clicked on
 * @param numOfPages The total number of pages available
 * @param urlPrefix The prefix to prepend to links
 * @returns An object containing the contents for pagination navigation on a page
 */
export const buildPaginationElement = (currentPageNumber: number, numOfPages: number, urlPrefix: string): PaginationData =>  {    
  const pagination: PaginationData = {items: []}; 
  const pageItems: PageItem[] = [];
  if (numOfPages <= 1 || currentPageNumber < 1) return pagination;

  // Add Previous and Next
  if (currentPageNumber !== 1) pagination.previous = {href: `${urlPrefix}?page=${currentPageNumber-1}`}
  if (currentPageNumber !== numOfPages) pagination.next = {href: `${urlPrefix}?page=${currentPageNumber+1}`}

  // Add first element by default
  pageItems.push(createPageItem(1, currentPageNumber, false, urlPrefix));

  // Add second element if applicable - possible ellipsis
  if (numOfPages >= 3) {
    let isEllipsis = numOfPages >= 5 && currentPageNumber >= 5;
    pageItems.push(createPageItem(2, currentPageNumber, isEllipsis, urlPrefix));
  }

  // Add element at middle left position if applicable
  if (numOfPages >= 5 && currentPageNumber >= 4 && numOfPages - currentPageNumber >= 1) {
    pageItems.push(createPageItem(currentPageNumber-1, currentPageNumber, false, urlPrefix));
  }

  // Add element at middle position if applicable
  if (numOfPages >= 5 && currentPageNumber >= 3 && numOfPages - currentPageNumber >= 2) {
    pageItems.push(createPageItem(currentPageNumber, currentPageNumber, false, urlPrefix));
  }

  // Add element at middle right position if applicable
  if (numOfPages >= 5 && currentPageNumber >= 2 && numOfPages - currentPageNumber >= 3) {
    pageItems.push(createPageItem(currentPageNumber+1, currentPageNumber, false, urlPrefix));
  }

  // Add second-to-last element if applicable - possible ellipsis
  if (numOfPages >= 4) {
    let isEllipsis = numOfPages >= 5 && numOfPages - currentPageNumber >= 4;
    pageItems.push(createPageItem(numOfPages-1, currentPageNumber, isEllipsis, urlPrefix));
  }

  // Add last element if applicable
  if (numOfPages > 1) {
    pageItems.push(createPageItem(numOfPages, currentPageNumber, false, urlPrefix));
  }

  pagination.items = pageItems
  return pagination;
}

/**
 * Create a pageItem that is either a number representing a page that can be accessed or an ellipsis that represents skipped numbers.
 * @param pageNumber The number that this pageItem represents
 * @param currentPageNumber The current page number that the user is clicked on
 * @param isEllipsis If true then an ellipsis will be shown instead of a clickable number
 * @param prefix The url prefix to prepend to links
 * @returns A PageItem to add to a PaginationData object - either a clickable number or an ellipsis
 */
const createPageItem = (pageNumber: number, currentPageNumber: number, isEllipsis: boolean, prefix: string): PageItem => {
  if (isEllipsis) {
    return {
      ellipsis: true,
    };
  }
  return {
    current: currentPageNumber == pageNumber,
    number: pageNumber,
    href: `${prefix}?page=${pageNumber}`,
  }
}
import { PageItem, PaginationData } from '../types/index';
import { ADD_TO_FRONT, ADD_TO_END } from '../config/index';
import { logger } from "./logger";

const addPageItem = (items: PageItem[], pageNumber: number, operation: string, current: boolean, prefix: string) => {
  let page: PageItem;
  page = {
    number: pageNumber,
    href: `${prefix}?page=${pageNumber}`, 
  }
  if (current) page.current = true;
  switch (operation) {
    case ADD_TO_FRONT: items.unshift(page); break;
    case ADD_TO_END: items.push(page); break;
    default: logger.info("Pagination: Unidentified operation during addPageItem: " + operation);
  }
}

const buildLeftSide = (pageItems: PageItem[], currentPage: number, prefix: string) => {
  let pagesAdded = 0;
  let pageInLoop = currentPage - 1;
  while (pagesAdded < 2 && pageInLoop >= 1) {
    addPageItem(pageItems, pageInLoop, ADD_TO_FRONT, false, prefix);
    pageInLoop--;
    pagesAdded++;
  }
  if (pageItems[0].number !== 1) {
    pageItems.unshift({
      ellipsis: true
    })
    addPageItem(pageItems, 1, ADD_TO_FRONT, false, prefix);
  }
}

const buildRightSide = (pageItems: PageItem[], currentPage: number, numOfPages: number, prefix: string) => {
  let pagesAdded = 0;
  let pageInLoop = currentPage + 1;
  while (pagesAdded < 2 && pageInLoop <= numOfPages) {
    addPageItem(pageItems, pageInLoop, ADD_TO_END, false, prefix);
    pageInLoop++;
    pagesAdded++;
  }
  if (pageItems[pageItems.length-1].number !== numOfPages) {
    pageItems.push({
      ellipsis: true
    })
    addPageItem(pageItems, numOfPages, ADD_TO_END, false, prefix);
  }
}

/**
 * Generates an object required by the GOV.UK Pagination component to display pagination data.
 * The returned object can be directly passed to the Pagination Nunjucks macro.
 * Always includes a link to the first and last page.
 * Adds ellipses to replace any skipped pages.
 * 
 * @param currentPage the page number that the user on, this will be highlighted in the component. Starts from 1. 
 * @param numOfPages the total number of pages to be included in the pagination component.
 * @param prefix the prefix for the link (href) that will be added to the page numbers. 
 * A query parameter "page" will be appended to the link e.g. if prefix is "/my-service" and page number is 5, the link will be "/my-service?page=5".
 */
export const buildPaginationData = (currentPage: number, numOfPages: number, prefix: string): PaginationData =>  {    
  const pagination: PaginationData = {items: []}; 
  const pageItems: PageItem[] = [];
  if (numOfPages < 1 || currentPage < 1) return pagination;

  if (currentPage !== 1) pagination.previous = {href: `${prefix}?page=${currentPage-1}`}
  if (currentPage !== numOfPages) pagination.next = {href: `${prefix}?page=${currentPage+1}`}

  // If there are less than 10 pages, just display all the links
  if (numOfPages < 10) {
    for (let i = 0; i<numOfPages; i++) {
      const pageNumber: number = i + 1;
      const current = pageNumber === currentPage;
      addPageItem(pageItems, pageNumber, ADD_TO_END, current, prefix);
    }
  } else if (currentPage <= 5) {
    for (let i = 0; i<=7; i++) {
      const pageNumber: number = i + 1;
      const current = pageNumber === currentPage;
      addPageItem(pageItems, pageNumber, ADD_TO_END, current, prefix);
    }
    pageItems.push({ellipsis: true})
    addPageItem(pageItems, numOfPages, ADD_TO_END, false, prefix);
  } else if (numOfPages - currentPage <= 4) {
    addPageItem(pageItems, 1, ADD_TO_FRONT, false, prefix);
    pageItems.push({ellipsis: true})
    for (let i = numOfPages - 6; i<= numOfPages; i++) {
      const current = i === currentPage;
      addPageItem(pageItems, i, ADD_TO_END, current, prefix);
    }
  } else {
    addPageItem(pageItems, currentPage, ADD_TO_END, true, prefix);
    buildLeftSide(pageItems, currentPage, prefix);
    buildRightSide(pageItems, currentPage, numOfPages, prefix);
  }
  pagination.items = pageItems;
  return pagination;
}
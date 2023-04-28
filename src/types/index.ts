import { SESSION_FILTER } from "../config";

export interface Address {
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  town?: string
  county?: string
  postcode?: string
}
export interface BankruptOfficer extends Address {
  ephemeralKey: string
  forename1?: string
  forename2?: string
  alias?: string
  surname?: string
  dateOfBirth?: string
  debtorDischargeDate?: string
  caseType?: string
}
export interface FullBankruptOfficer extends BankruptOfficer {
  caseReference?: string
  bankruptcyType?: string
  startDate?: string
  trusteeDischargeDate?: string
}
export interface BankruptOfficerSearchQuery {
  startIndex: number
  itemsPerPage: number
  filters: BankruptOfficerSearchFilters
}

export interface BankruptOfficerSearchFilters {
  "to-dob-dd"?: string
  "to-dob-mm"?: string
  "to-dob-yyyy"?: string
  "from-dob-dd"?: string
  "from-dob-mm"?: string
  "from-dob-yyyy"?: string
  forename1?: string
  surname?: string
  alias?: string
  fromDateOfBirth?: string
  toDateOfBirth?: string
  postcode?: string
}

export interface BankruptOfficerSearchResults {
  itemsPerPage: number
  startIndex: number
  totalResults: number
  items: BankruptOfficer[]
}

export interface PaginationData {
  previous?: PaginationPreviousNext,
  next?: PaginationPreviousNext,
  items: PageItem[]
}

export interface PaginationPreviousNext {
  href: string
}

export interface PageItem {
  number?: number,
  href?: string,
  current?: boolean,
  ellipsis?: boolean
}

export interface BankruptOfficerSearchSessionExtraData {
  [SESSION_FILTER]?: BankruptOfficerSearchFilters
}
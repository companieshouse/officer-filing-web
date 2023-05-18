export const isValidUrl = (nextPageUrl: string ) => { 
    if (nextPageUrl.startsWith("/officer-filing-web")) {
      return true;
    }
    else {
      return false;
    }
  };

  //Will be used to validate URL inputs in future
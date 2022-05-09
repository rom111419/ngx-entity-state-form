/**
 * Entity data to create
 * @param {string} id Unique identifier of entity. Ex.: f6f92b9a-e255-43b9-aaff-11a9dd890cc7
 * */
export interface Entity {
  id: string;
}


export interface EntityNameAndIdListInString {
  entityName: string;
  rowId: string,
  colName: string
}

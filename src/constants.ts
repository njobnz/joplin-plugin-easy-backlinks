export const MARKDOWNIT_SCRIPT_ID: string = 'tuibyte.EasyBacklinks.MarkdownIt';

export const SETTINGS_SECTION_NAME: string = 'tuibyte-easy-backlinks';

export const BACKLINKS_PANEL_EL: string = 'easy-backlinks-panel';
export const BACKLINKS_PANEL_ID: string = 'easy_backlinks_panel';

export const GET_BACKLINKS_CMD: string = 'getBacklinks';
export const GET_GLOBAL_VALUE_CMD: string = 'getGlobalValue';
export const GET_SETTINGS_CMD: string = 'getSettings';
export const GET_SETTING_CMD: string = 'getSetting';
export const SET_SETTING_CMD: string = 'setSetting';
export const OPEN_NOTE_CMD: string = 'openNote';
export const GET_DATA_CMD: string = 'getData';

export enum BacklinksListPosition {
  Footer,
  Header,
  None,
}

export enum BacklinksListType {
  Ordered,
  Unordered,
  Delimited,
}

export enum BacklinksListSort {
  Default = '',
  Title = 'title',
  Created = 'created_time',
  Updated = 'updated_time',
  UserCreated = 'user_created_time',
  UserUpdated = 'user_updated_time',
  TodoDue = 'todo_due',
  TodoCompleted = 'todo_completed',
  Order = 'order',
}

export enum BacklinksListOrder {
  Ascending,
  Descending,
}

export enum BacklinksListParent {
  Full,
  Direct,
  None,
}

export enum MarkupLanguage {
  Markdown = 1,
  Html = 2,
  Any = 3,
}

import { BacklinksListPosition } from './constants';

export interface PluginSettings {
  listHeader: string;
  listPosition: number;
  listType: number;
  listSort: string;
  listOrder: number;
  showParent: number;
  hideEmpty: boolean;
  showHint: boolean;
  showPanel: boolean;
  showIcon: boolean;
  customCss: string;
  manualHeader: string;
  listDelimiter: string;
  disableText: string;
  ignoreText: string;
  ignorePanel: boolean;
  ignoreList: string[];
}

export interface JoplinNote {
  id: string;
  parent_id: string;
  title: string;
  body: string;
  created_time: number;
  updated_time: number;
  user_created_time: number;
  user_updated_time: number;
  todo_due: number;
  todo_completed: number;
  order: number;
}

export interface BacklinksContent {
  position: BacklinksListPosition;
  hide: boolean;
  head: string;
  body: string;
}

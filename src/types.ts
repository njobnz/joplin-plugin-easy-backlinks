import { BacklinksListPosition } from './constants';

export interface PluginSettings {
  listHeader: string;
  listPosition: number;
  listType: number;
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
  ignoreList: string[];
}

export interface JoplinNote {
  id: string;
  parent_id: string;
  title: string;
  body: string;
}

export interface BacklinksContent {
  position: BacklinksListPosition;
  hide: boolean;
  head: string;
  body: string;
}

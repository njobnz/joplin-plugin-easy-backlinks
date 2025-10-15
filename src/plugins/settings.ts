import joplin from 'api';
import { SettingItem, SettingItemSubType, SettingItemType, SettingStorage } from 'api/types';
import { PluginSettings } from '../types';
import {
  BacklinksListOrder,
  BacklinksListParent,
  BacklinksListPosition,
  BacklinksListSort,
  BacklinksListType,
  SETTINGS_SECTION_NAME,
} from '../constants';
import localization from '../localization';
import setSetting from '../utils/setSetting';
import getSetting from '../utils/getSetting';
import App from '.';

/**
 * Plugin settings.
 */
export default class AppSettings {
  app: App = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
  }

  specification: Record<keyof PluginSettings, SettingItem> = null;

  /**
   * Get a setting from Joplin API.
   *
   * @returns {Promise<T>} The setting value.
   */
  get: <T>(name: string, fallback?: T, isGlobal?: boolean) => Promise<T> = getSetting;

  /**
   * Set a setting using Joplin API.
   */
  set: (name: string, value?: any) => Promise<void> = setSetting;

  init = async () => {
    this.specification = {
      listHeader: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listHeader,
        description: localization.setting__listHeader__description,
        type: SettingItemType.String,
        value: 'Backlinks',
      },

      listPosition: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listPosition,
        description: localization.setting__listPosition__description,
        type: SettingItemType.Int,
        value: BacklinksListPosition.Footer,
        isEnum: true,
        options: {
          [BacklinksListPosition.Footer]: 'Note Footer',
          [BacklinksListPosition.Header]: 'Note Header',
          [BacklinksListPosition.None]: 'None',
        },
      },

      listType: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listType,
        description: localization.setting__listType__description,
        type: SettingItemType.Int,
        value: BacklinksListType.Ordered,
        isEnum: true,
        options: {
          [BacklinksListType.Ordered]: 'Ordered List',
          [BacklinksListType.Unordered]: 'Unordered List',
          [BacklinksListType.Delimited]: 'New Lines',
        },
      },

      listSort: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listSort,
        description: localization.setting__listSort__description,
        type: SettingItemType.String,
        value: BacklinksListSort.Default,
        isEnum: true,
        options: {
          [BacklinksListSort.Default]: 'Default',
          [BacklinksListSort.Title]: 'Title',
          [BacklinksListSort.Created]: 'Created',
          [BacklinksListSort.Updated]: 'Updated',
          [BacklinksListSort.UserCreated]: 'User Created',
          [BacklinksListSort.UserUpdated]: 'User Updated',
          [BacklinksListSort.TodoDue]: 'Todo Due',
          [BacklinksListSort.TodoCompleted]: 'Todo Completed',
          [BacklinksListSort.Order]: 'Custom Order',
        },
      },

      listOrder: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listOrder,
        description: localization.setting__listOrder__description,
        type: SettingItemType.Int,
        value: BacklinksListOrder.Ascending,
        isEnum: true,
        options: {
          [BacklinksListOrder.Ascending]: 'Ascending',
          [BacklinksListOrder.Descending]: 'Descending',
        },
      },

      showParent: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__showParents,
        description: localization.setting__showParents__description,
        type: SettingItemType.Int,
        value: BacklinksListParent.None,
        isEnum: true,
        options: {
          [BacklinksListParent.None]: 'None',
          [BacklinksListParent.Direct]: 'Direct Parent',
          [BacklinksListParent.Full]: 'Full Path',
        },
      },

      hideEmpty: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__hideEmpty,
        description: localization.setting__hideEmpty__description,
        type: SettingItemType.Bool,
        value: true,
      },

      showHint: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__showHint,
        description: localization.setting__showHint__description,
        type: SettingItemType.Bool,
        value: true,
      },

      showPanel: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__showPanel,
        description: localization.setting__showPanel__description,
        type: SettingItemType.Bool,
        value: false,
      },

      showIcon: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__showIcon,
        description: localization.setting__showIcon__description,
        type: SettingItemType.Bool,
        value: true,
      },

      customCss: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        type: SettingItemType.String,
        label: localization.setting__customCss,
        description: localization.setting__customCss__description,
        subType: SettingItemSubType.FilePath,
        value: `${await this.get('profileDir', undefined, true)}/easy-backlinks.css`,
        advanced: true,
      },

      manualHeader: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__manualHeader,
        description: localization.setting__manualHeader__description,
        type: SettingItemType.String,
        value: '',
        advanced: true,
      },

      listDelimiter: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__listDelimiter,
        description: localization.setting__listDelimiter__description,
        type: SettingItemType.String,
        value: '\\n',
        advanced: true,
      },

      disableText: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__disableText,
        description: localization.setting__disableText__description,
        type: SettingItemType.String,
        value: '<!-- backlinks-disable -->',
        advanced: true,
      },

      ignoreText: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__ignoreText,
        description: localization.setting__ignoreText__description,
        type: SettingItemType.String,
        value: '<!-- backlinks-ignore -->',
        advanced: true,
      },

      ignorePanel: {
        public: true,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__ignorePanel,
        description: localization.setting__ignorePanel__description,
        type: SettingItemType.Bool,
        value: false,
        advanced: true,
      },

      ignoreList: {
        public: false,
        section: SETTINGS_SECTION_NAME,
        storage: SettingStorage.File,
        label: localization.setting__ignoreList,
        description: localization.setting__ignoreList__description,
        type: SettingItemType.Array,
        value: [],
      },
    };

    await joplin.settings.registerSection(SETTINGS_SECTION_NAME, {
      label: localization.settings__appName,
      description: localization.settings__description,
      iconName: 'fas fa-hand-point-left',
    });
    await joplin.settings.registerSettings(this.specification);
  };
}

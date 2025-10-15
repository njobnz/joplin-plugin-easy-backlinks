interface AppLocalization {
  settings__appName: string;
  settings__description: string;

  setting__listHeader: string;
  setting__listHeader__description: string;
  setting__listPosition: string;
  setting__listPosition__description: string;
  setting__listType: string;
  setting__listType__description: string;
  setting__listSort: string;
  setting__listSort__description: string;
  setting__listOrder: string;
  setting__listOrder__description: string;
  setting__showParents: string;
  setting__showParents__description: string;
  setting__hideEmpty: string;
  setting__hideEmpty__description: string;
  setting__showHint: string;
  setting__showHint__description: string;
  setting__showPanel: string;
  setting__showPanel__description: string;
  setting__showIcon: string;
  setting__showIcon__description: string;
  setting__customCss: string;
  setting__customCss__description: string;
  setting__manualHeader: string;
  setting__manualHeader__description: string;
  setting__listDelimiter: string;
  setting__listDelimiter__description: string;
  setting__disableText: string;
  setting__disableText__description: string;
  setting__ignoreText: string;
  setting__ignoreText__description: string;
  setting__ignorePanel: string;
  setting__ignorePanel__description: string;
  setting__ignoreList: string;
  setting__ignoreList__description: string;

  command_importBacklinksIgnoreList: string;
  command_insertBacklinksHeader: string;
  command_insertBacklinksList: string;
  command_addNoteBacklinksIgnoreList: string;
  command_delNoteBacklinksIgnoreList: string;
  command_toggleNoteBacklinksIgnoreList: string;
  command_openBacklinksIgnoreList: string;
  command_clearBacklinksIgnoreList: string;
  command_pruneBacklinksIgnoreList: string;
  command_toggleBacklinksPanel: string;

  message__noteIgnoreListAdded: string;
  message__noteIgnoreListRemoved: string;
  message__ignoreListNotesPruned: string;
  message__ignoreListNoNotesPruned: string;
  message__ignoreListNoSelectedNote: string;
  message__clearIgnoreList: string;
  message__importIgnoreListSuccess: string;
  message__importIgnoreListFailure: string;
  message__importIgnoreListNotFound: string;
  message__removeFromIgnoreList: string;
  message__noteRemovedFromIgnoreList: any;
  message__noteAddedToIgnoreList: any;
  message__pruneIgnoreList: string;
  message__noBacklinksHint: string;
  message__reloadPanel: string;

  view_ignoreList_title: string;
  view_ignoreList_description: string;
  view_ignoreList_placeholder: string;
  view_ignoreList_empty: string;
  view_ignoreList_add: string;
  view_ignoreList_remove: string;
  view_ignoreList_prune: string;
  view_ignoreList_clear: string;

  menu_easyBacklinks: string;
}

const defaultStrings: AppLocalization = {
  settings__appName: 'Easy Backlinks',
  settings__description: '',

  setting__listHeader: 'Backlinks header',
  setting__listHeader__description: 'Header text for the backlinks block. (Default: Backlinks)',
  setting__listPosition: 'Backlinks location',
  setting__listPosition__description: 'Position of the backlinks block.',
  setting__listType: 'List style',
  setting__listType__description: 'Display backlinks as new lines, ordered, or unordered list.',
  setting__listSort: 'List sort',
  setting__listSort__description: 'Property to sort backlinks by.',
  setting__listOrder: 'List order',
  setting__listOrder__description: 'Sort backlinks in ascending or descending order.',
  setting__showParents: 'Show notebooks',
  setting__showParents__description: 'Include notebook paths in backlink titles.',
  setting__hideEmpty: 'Hide empty',
  setting__hideEmpty__description: 'Hide backlinks section when there are no backlinks.',
  setting__showHint: 'Display hint',
  setting__showHint__description: 'Show a hint when the backlinks list is empty.',
  setting__showPanel: 'Display panel',
  setting__showPanel__description: 'Display backlinks in a separate panel.',
  setting__showIcon: 'Joplin icon',
  setting__showIcon__description: 'Display Joplin link icon next to backlinks.',
  setting__customCss: 'Panel stylesheet',
  setting__customCss__description: 'Path to custom CSS for styling the backlinks panel.',
  setting__manualHeader: 'Manual header',
  setting__manualHeader__description:
    'Custom HTML text for the manual backlinks header. The element must have an ID of "backlinks-header".',
  setting__listDelimiter: 'List delimiter',
  setting__listDelimiter__description:
    'Define a custom delimiter to seperate backlinks when the "New Line" list style is selected. (Default: \\n)',
  setting__disableText: 'Disable text',
  setting__disableText__description:
    'Text to disable automatic backlinks in notes. (Default: <!-- backlinks-disable -->)',
  setting__ignoreText: 'Ignore text',
  setting__ignoreText__description: 'Text to exclude notes from backlinks. (Default: <!-- backlinks-ignore -->)',
  setting__ignorePanel: 'Ignore panel',
  setting__ignorePanel__description: 'Show backlinks ignore list panel.',
  setting__ignoreList: 'Ignore list',
  setting__ignoreList__description: 'List of notes to exclude from backlinks.',

  command_importBacklinksIgnoreList: 'Import existing backlinks ignore list into Easy Backlinks',
  command_insertBacklinksHeader: 'Insert backlinks header',
  command_insertBacklinksList: 'Insert backlinks list',
  command_addNoteBacklinksIgnoreList: 'Add note to backlinks ignore list',
  command_delNoteBacklinksIgnoreList: 'Remove note from backlinks ignore list',
  command_toggleNoteBacklinksIgnoreList: 'Toggle note in backlinks ignore list',
  command_openBacklinksIgnoreList: 'Open backlinks ignore list',
  command_clearBacklinksIgnoreList: 'Clear backlinks ignore list',
  command_pruneBacklinksIgnoreList: 'Prune backlinks ignore list',
  command_toggleBacklinksPanel: 'Show/hide backlinks panel',

  message__noteIgnoreListAdded: 'Note added to backlinks ignore list',
  message__noteIgnoreListRemoved: 'Note removed from backlinks ignore list',
  message__ignoreListNotesPruned: 'note(s) pruned from backlinks ignore list',
  message__ignoreListNoNotesPruned: 'No notes to prune from backlinks ignore list',
  message__ignoreListNoSelectedNote: 'No note is currently selected',
  message__clearIgnoreList: 'Warning: This will remove all notes from the ignore list. Are you sure?',
  message__importIgnoreListSuccess: 'Backlinks ignore list imported successfully',
  message__importIgnoreListFailure: 'Failed to import backlinks ignore list',
  message__importIgnoreListNotFound: 'Existing backlinks ignore list was not found',
  message__removeFromIgnoreList: 'Remove this note from the backlinks ignore list?',
  message__noteRemovedFromIgnoreList: 'Note removed from backlinks ignore list',
  message__noteAddedToIgnoreList: 'Note added to backlinks ignore list',
  message__pruneIgnoreList: 'Prune deleted notes from ignore list?',
  message__noBacklinksHint: '*No entries found.*',
  message__reloadPanel: '# Easy Backlinks\n\nSelect a note to load this panel.',

  view_ignoreList_title: 'Backlinks Ignore List',
  view_ignoreList_description: 'Notes in this list are excluded from backlinks',
  view_ignoreList_placeholder: 'Enter note ID',
  view_ignoreList_empty: 'Backlinks ignore list is empty',
  view_ignoreList_add: 'Add note',
  view_ignoreList_remove: 'Remove note',
  view_ignoreList_prune: 'Prune deleted notes from the ignore list',
  view_ignoreList_clear: 'Remove all notes from the ignore list',

  menu_easyBacklinks: 'Easy backlinks',
};

const localizations: Record<string, AppLocalization> = {
  en: defaultStrings,

  es: {
    ...defaultStrings,
  },
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
  const localeSep = language.indexOf('-');

  if (localeSep !== -1) {
    languages.push(language.substring(0, localeSep));
  }
}

for (const locale of languages) {
  if (locale in localizations) {
    localization = localizations[locale];
    break;
  }
}

if (!localization) {
  console.log('No supported localization found. Falling back to default.');
  localization = defaultStrings;
}

export default localization!;

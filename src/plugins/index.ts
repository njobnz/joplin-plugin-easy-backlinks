import joplin from 'api';
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';
import { BacklinksContent, JoplinNote } from '../types';
import localization from '../localization';
import {
  BacklinksListType,
  BacklinksListParent,
  BacklinksListPosition,
  OPEN_NOTE_CMD,
  GET_BACKLINKS_CMD,
  GET_DATA_CMD,
  GET_SETTING_CMD,
  SET_SETTING_CMD,
  GET_SETTINGS_CMD,
  GET_GLOBAL_VALUE_CMD,
  ADD_IGNORED_CMD,
  DEL_IGNORED_CMD,
  CLEAR_IGNORE_CMD,
  PRUNE_IGNORE_CMD,
  BacklinksListSort,
  BacklinksListOrder,
} from '../constants';
import fetchNoteParentTitles from '../utils/fetchNoteParentTitles';
import findNoteBacklinks from '../utils/findNoteBacklinks';
import escapeMarkdown from '../utils/escapeMarkdown';
import replaceEscape from '../utils/replaceEscape';
import AppSettings from './settings';
import Renderer from './renderer';
import MarkdownView from './markdownIt';
import BacklinksView from './backlinks';
import IgnoreList from './ignore';

export default class App {
  settings: AppSettings;
  renderer: Renderer;
  viewer: MarkdownView;
  panel: BacklinksView;
  ignore: IgnoreList;

  constructor() {
    this.settings = new AppSettings(this);
    this.renderer = new Renderer(this);
    this.viewer = new MarkdownView(this);
    this.panel = new BacklinksView(this);
    this.ignore = new IgnoreList(this);
  }

  setting = async <T>(name: string, value?: T, isGlobal?: boolean): Promise<T> => {
    if (!this.settings) throw Error('Settings not initialized.');
    if (value !== undefined) {
      await this.settings.set(name, value);
      return value;
    }
    return await this.settings.get<T>(name, undefined, isGlobal);
  };

  onMessageHandler = async (message: any): Promise<any> => {
    switch (message?.command) {
      case GET_BACKLINKS_CMD:
        return await this.getBacklinks(message?.isFound ? true : false);
      case GET_GLOBAL_VALUE_CMD:
        return (await this.setting(message?.name, undefined, true)) ?? null;
      case GET_SETTINGS_CMD:
        const values = message?.values;
        if (!Array.isArray(values)) return {};
        const settings = await Promise.all(values.map(async name => await this.setting(name)));
        return values.reduce((obj, key, index) => ({ ...obj, [key]: settings[index] }), {});
      case GET_SETTING_CMD:
        return await this.setting(message?.name);
      case SET_SETTING_CMD:
        return await this.setting(message?.name, message?.value);
      case GET_DATA_CMD:
        try {
          return await joplin.data.get(message?.path, message?.query);
        } catch (exception) {
          return null;
        }
      case OPEN_NOTE_CMD:
        try {
          if (!message?.noteId) throw Error('Note ID is missing.');
          return await joplin.commands.execute('openNote', message.noteId);
        } catch (exception) {
          console.error('Cannot open note:', exception, message);
          return { error: 'Cannot open note:', exception, message };
        }
      case ADD_IGNORED_CMD:
        try {
          if (!message?.noteId) throw Error('Note ID is missing.');
          return await joplin.commands.execute('addNoteBacklinksIgnoreList', message.noteId);
        } catch (exception) {
          console.error('Cannot add note:', exception, message);
          return { error: 'Cannot add note:', exception, message };
        }
      case DEL_IGNORED_CMD:
        try {
          if (!message?.noteId) throw Error('Note ID is missing.');
          return await joplin.commands.execute('delNoteBacklinksIgnoreList', message.noteId);
        } catch (exception) {
          console.error('Cannot remove note:', exception, message);
          return { error: 'Cannot remove note:', exception, message };
        }
      case CLEAR_IGNORE_CMD:
        return await joplin.commands.execute('clearBacklinksIgnoreList');
      case PRUNE_IGNORE_CMD:
        return await joplin.commands.execute('pruneBacklinksIgnoreList');
      default:
        console.error('Unknown command:', message);
        return { error: 'Unknown command:', message };
    }
  };

  getBacklinks = async (
    isFound: boolean = false,
    isPanel: boolean = false,
    isMarkdown: boolean = false
  ): Promise<BacklinksContent> => {
    const result = {
      position: BacklinksListPosition.Footer,
      hide: true,
      head: '',
      body: '',
    };

    result.position = await this.setting<BacklinksListPosition>('listPosition');
    if (!isFound && result.position === BacklinksListPosition.None) return result;

    const note = (await joplin.workspace.selectedNote()) as JoplinNote;
    if (!note || (!isPanel && note.body.includes(await this.setting<string>('disableText')))) return result;

    const notes = await findNoteBacklinks(
      note.id,
      await this.setting<string[]>('ignoreList'),
      await this.setting<string>('ignoreText'),
      await this.setting<BacklinksListSort>('listSort'),
      await this.setting<BacklinksListOrder>('listOrder')
    );
    result.hide = notes.length === 0 && (await this.setting<boolean>('hideEmpty'));

    if (isPanel || !result.hide) {
      result.head = this.generateHeader(note, await this.setting<string>('listHeader'));
      result.body = await this.generateBacklinks(
        notes,
        await this.setting<BacklinksListType>('listType'),
        await this.setting<boolean>('showHint')
      );

      if (!isMarkdown) {
        result.head = await this.renderer.render(result.head);
        result.body = await this.renderer.render(result.body);
      }
    }

    return result;
  };

  generateHeader = (note: JoplinNote, header: string): string => {
    if (!header || /^#{1,6}(?=\s)/.test(header)) return header;
    const headers = note.body.match(/^#{1,6}(?=\s)/gm) || [];
    const largest = headers.length ? '#'.repeat(Math.min(...headers.map(h => h.length))) : '#';
    return `${largest} ${header}`;
  };

  generateBacklinks = async (
    notes: JoplinNote[],
    type: BacklinksListType = BacklinksListType.Delimited,
    hint: boolean = false
  ): Promise<string> => {
    if (!notes.length && hint) return localization.message__noBacklinksHint;

    const result = await Promise.all(
      notes.map(async (note, index) => {
        let prefix = '';

        if (type == BacklinksListType.Ordered) prefix = `${index + 1}. `;
        else if (type == BacklinksListType.Unordered) prefix = `- `;

        const depth = await this.setting<BacklinksListParent>('showParent');
        const title =
          depth !== BacklinksListParent.None
            ? `${(await fetchNoteParentTitles(note, depth)).join('/')}/${note.title}`
            : note.title;

        return `${prefix}[${escapeMarkdown(title)}](:/${note.id})`;
      })
    );

    const delimiter =
      type == BacklinksListType.Delimited ? replaceEscape(await this.setting<string>('listDelimiter')) : '\n';
    return result.join(delimiter);
  };

  registerInsertHeader = async () => {
    await joplin.commands.register({
      name: 'insertBacklinksHeader',
      label: localization.command_insertBacklinksHeader,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const head =
          replaceEscape(await this.setting<string>('manualHeader')) ||
          this.generateHeader(note, await this.setting<string>('listHeader'));
        const html =
          (await this.setting<BacklinksListPosition>('listPosition')) === BacklinksListPosition.Header
            ? `${head}\n\n${note.body}`
            : `${note.body}\n${head}\n`;

        await joplin.commands.execute('editor.setText', html);
      },
    });

    await joplin.views.menuItems.create('insertBacklinksHeaderMenu', 'insertBacklinksHeader', MenuItemLocation.Note, {
      accelerator: 'Ctrl+Alt+H',
    });
  };

  registerInsertBacklinks = async () => {
    await joplin.commands.register({
      name: 'insertBacklinksList',
      label: localization.command_insertBacklinksList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const result = await this.getBacklinks(true, true, true);
        const disable = await this.setting<string>('disableText');
        const text = !note.body.includes(disable) ? `${disable}` : '';
        const head = replaceEscape(await this.setting<string>('manualHeader')) || result.head;
        const body = `${text}\n${head}\n\n${result.body}`;
        const html =
          result.position === BacklinksListPosition.Header ? `${body}\n\n${note.body}` : `${note.body}\n${body}\n`;

        await joplin.commands.execute('editor.setText', html);
      },
    });

    await joplin.views.menuItems.create('insertBacklinksListMenu', 'insertBacklinksList', MenuItemLocation.Note, {
      accelerator: 'Ctrl+Alt+B',
    });

    await joplin.views.toolbarButtons.create(
      'insertBacklinksListToolbar',
      'insertBacklinksList',
      ToolbarButtonLocation.EditorToolbar
    );
  };

  registerTogglePanel = async () => {
    await joplin.commands.register({
      name: 'toggleBacklinksPanel',
      label: localization.command_toggleBacklinksPanel,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        if (!this.panel) return;
        await this.setting<boolean>('showPanel', !(await this.setting<boolean>('showPanel')));
        this.panel.refresh();
      },
    });

    await joplin.views.toolbarButtons.create(
      'toggleBacklinksPanelToolbar',
      'toggleBacklinksPanel',
      ToolbarButtonLocation.NoteToolbar
    );
  };

  init = async (): Promise<void> => {
    await this.settings.init();
    await this.renderer.init();
    await this.viewer.init();
    await this.panel.init();
    await this.ignore.init();

    await this.registerInsertHeader();
    await this.registerInsertBacklinks();
    await this.registerTogglePanel();
  };
}

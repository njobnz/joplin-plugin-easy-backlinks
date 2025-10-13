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
  BacklinksListSort,
  BacklinksListOrder,
} from '../constants';
import fetchNoteById from '../utils/fetchNoteById';
import fetchNoteParentTitles from '../utils/fetchNoteParentTitles';
import findNoteBacklinks from '../utils/findNoteBacklinks';
import escapeMarkdown from '../utils/escapeMarkdown';
import replaceEscape from '../utils/replaceEscape';
import AppSettings from './settings';
import Renderer from './renderer';
import MarkdownView from './markdownIt';
import BacklinksView from './backlinks';

export default class App {
  settings: AppSettings;
  renderer: Renderer;
  viewer: MarkdownView;
  panel: BacklinksView;
  dialogs: {
    ignoreList: any;
  };

  constructor() {
    this.settings = new AppSettings(this);
    this.renderer = new Renderer(this);
    this.viewer = new MarkdownView(this);
    this.panel = new BacklinksView(this);
  }

  setting = async <T>(name: string, value?: T): Promise<T> => {
    if (!this.settings) throw Error('Settings not initialized.');
    if (value !== undefined) {
      await this.settings.set(name, value);
      return value;
    }
    return await this.settings.get<T>(name);
  };

  onMessageHandler = async (message: any): Promise<any> => {
    switch (message?.command) {
      case GET_BACKLINKS_CMD:
        return await this.getBacklinksList(message?.isFound ? true : false);
      case GET_GLOBAL_VALUE_CMD:
        return (await joplin.settings.globalValues([message?.name]))[0] || null;
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
      default:
        console.error('Unknown command:', message);
        return { error: 'Unknown command:', message };
    }
  };

  getBacklinksList = async (isFound: boolean = false, isPanel: boolean = false): Promise<BacklinksContent> => {
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
      result.head = await this.renderer.render(
        this.generateBacklinksHead(note, await this.setting<string>('listHeader'))
      );
      result.body = await this.renderer.render(
        await this.generateBacklinksList(
          notes,
          await this.setting<BacklinksListType>('listType'),
          await this.setting<boolean>('showHint')
        )
      );
    }

    return result;
  };

  generateBacklinksHead = (note: JoplinNote, header: string): string => {
    if (!header || /^#{1,6}(?=\s)/.test(header)) return header;
    const headers = note.body.match(/^#{1,6}(?=\s)/gm) || [];
    const largest = headers.length ? '#'.repeat(Math.min(...headers.map(h => h.length))) : '#';
    return `${largest} ${header}`;
  };

  generateBacklinksList = async (
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

  pruneBacklinksIgnoreList = async (): Promise<number> => {
    let result = 0;

    const list = await this.setting<string[]>('ignoreList');
    for (let i = list.length - 1; i >= 0; i--) {
      const id = list[i];
      const note = await fetchNoteById(id);
      if (!note) {
        let index = list.indexOf(id);
        if (index > -1) list.splice(index, 1);
        result++;
      }
    }
    await this.setting<string[]>('ignoreList', list);

    return result;
  };

  createBacklinksDialogs = async () => {
    this.dialogs = {
      ignoreList: await joplin.views.dialogs.create('easyBacklinksIgnoreListDialog'),
    };
  };

  registerImportBacklinksIgnoreListCmd = async () => {
    await joplin.commands.register({
      name: 'importBacklinksIgnoreList',
      label: localization.command_importBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        try {
          const settingKey = 'plugin-joplin.plugin.ambrt.backlinksToNote.myBacklinksCustomSettingIgnoreList';
          const importList = (await joplin.settings.globalValues([settingKey]))[0] || [];
          const ignoreList = await this.setting<string[]>('ignoreList');
          await this.setting<string[]>('ignoreList', [...new Set([...ignoreList, ...importList])]);
          alert(localization.message__importIgnoreListSuccess);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          if (message.startsWith('Unknown key')) {
            alert(localization.message__importIgnoreListNotFound);
          } else {
            alert(`${localization.message__importIgnoreListFailure}:\n\n${message}`);
          }
        }
      },
    });
  };

  registerInsertBacklinksHeadCmd = async () => {
    await joplin.commands.register({
      name: 'insertBacklinksHeader',
      label: localization.command_insertBacklinksHeader,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const header = replaceEscape(await this.setting<string>('manualHeader'));
        const head = header ? header : this.generateBacklinksHead(note, await this.setting<string>('listHeader'));
        const body =
          (await this.setting<BacklinksListPosition>('listPosition')) === BacklinksListPosition.Header
            ? `${head}\n\n${note.body}`
            : `${note.body}\n${head}\n`;

        await joplin.commands.execute('editor.setText', body);
      },
    });
  };

  registerInsertBacklinksListCmd = async () => {
    await joplin.commands.register({
      name: 'insertBacklinksList',
      label: localization.command_insertBacklinksList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const notes = await findNoteBacklinks(
          note.id,
          await this.setting<string[]>('ignoreList'),
          await this.setting<string>('ignoreTag')
        );
        if (!notes) return;

        const disable = await this.setting<string>('disableText');
        const header = replaceEscape(await this.setting<string>('manualHeader'));
        const text = !note.body.includes(disable) ? `${disable}\n` : '';
        const head = header ? header : this.generateBacklinksHead(note, await this.setting<string>('listHeader'));
        const list = await this.generateBacklinksList(
          notes,
          await this.setting<BacklinksListType>('listType'),
          await this.setting<boolean>('showHint')
        );
        const html = `${text}${head}\n\n${list}`;
        const body =
          (await this.setting<BacklinksListPosition>('listPosition')) === BacklinksListPosition.Header
            ? `${html}\n\n${note.body}`
            : `${note.body}\n${html}\n`;

        await joplin.commands.execute('editor.setText', body);
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

  registerToggleIgnoreListCmd = async () => {
    await joplin.commands.register({
      name: 'toggleNoteBacklinksIgnoreList',
      label: localization.command_toggleNoteBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const note = (await joplin.workspace.selectedNote()) as JoplinNote;
        if (!note) return;

        const list = await this.setting<string[]>('ignoreList');
        if (list.includes(note.id)) {
          let index = list.indexOf(note.id);
          if (index > -1) list.splice(index, 1);
          alert(localization.message__noteIgnoreListRemoved);
        } else {
          list.push(note.id);
          alert(localization.message__noteIgnoreListAdded);
        }

        await this.setting<string[]>('ignoreList', list);
      },
    });
  };

  registerOpenIgnoreListCmd = async () => {
    await joplin.commands.register({
      name: 'openBacklinksIgnoreList',
      label: localization.command_openBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const options = [];
        const list = await this.setting<string[]>('ignoreList');

        for (const id of list) {
          const note = await fetchNoteById(id, ['title']);
          if (note) options.push(`<option value="${id}">${note.title.trim() !== '' ? note.title : id}</option>`);
          else options.push(`<option value="${id}">NOTE DELETED (${id})</option>`);
        }

        if (!options.length)
          options.push(`<option selected="selected">${localization.dialog_ignoreList_empty}</option>`);

        const html = options.join('\n');
        const body = `
          <h3>${localization.dialog_ignoreList_title}</h3>
          <form name="notes">
            <select style="width: 100%" name="noteId" size="12">
              ${html}
            </select>
          </form>
        `;

        await joplin.views.dialogs.setHtml(this.dialogs.ignoreList, body);
        await joplin.views.dialogs.setButtons(this.dialogs.ignoreList, [
          {
            id: 'ok',
            title: localization.dialog_ignoreList_open,
          },
          {
            id: 'cancel',
            title: localization.dialog_ignoreList_close,
          },
        ]);

        const response = await joplin.views.dialogs.open(this.dialogs.ignoreList);
        if (response.id == 'ok') {
          try {
            await joplin.commands.execute('openNote', response.formData.notes.noteId);
          } catch (e) {}
        }
      },
    });
  };

  registerPruneIgnoreListCmd = async () => {
    await joplin.commands.register({
      name: 'pruneBacklinksIgnoreList',
      label: localization.command_pruneBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const confirm = await joplin.views.dialogs.showMessageBox(localization.message__pruneIgnoreList);
        if (confirm !== 0) return;

        const result = await this.pruneBacklinksIgnoreList();
        const message =
          result > 0
            ? `${result} ${localization.message__ignoreListNotesPruned}`
            : localization.message__ignoreListNoNotesPruned;

        alert(message);
      },
    });
  };

  registerToggleBacklinksPanelCmd = async () => {
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

  createBacklinksMenus = async () => {
    await joplin.views.menus.create('easyBacklinksMenu', 'Easy backlinks', [
      {
        commandName: 'toggleNoteBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+I',
      },
      {
        commandName: 'openBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+L',
      },
      {
        commandName: 'pruneBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+P',
      },
    ]);
  };

  init = async (): Promise<void> => {
    await this.settings.init();
    await this.renderer.init();
    await this.viewer.init();
    await this.panel.init();

    await this.createBacklinksDialogs();
    await this.registerImportBacklinksIgnoreListCmd();
    await this.registerInsertBacklinksHeadCmd();
    await this.registerInsertBacklinksListCmd();
    await this.registerToggleBacklinksPanelCmd();
    await this.registerOpenIgnoreListCmd();
    await this.registerPruneIgnoreListCmd();
    await this.registerToggleIgnoreListCmd();
    await this.createBacklinksMenus();
  };
}

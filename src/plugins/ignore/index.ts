import joplin from 'api';
import { JoplinNote } from '../../types';
import localization from '../../localization';
import fetchNoteById from '../../utils/fetchNoteById';
import IgnoreView from './view';
import App from '..';

export default class IgnoreList {
  app: App = null;
  view: IgnoreView = null;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
    this.view = new IgnoreView(this);
  }

  get = async (): Promise<string[]> => {
    return (await this.app.setting<string[]>('ignoreList')) || [];
  };

  set = async (list: string[]): Promise<void> => {
    await this.app.setting<string[]>('ignoreList', list);
  };

  add = async (note: JoplinNote): Promise<void> => {
    const list = await this.get();
    if (!list.includes(note.id)) {
      list.push(note.id);
      await this.set(list);
    }
  };

  del = async (id: string): Promise<void> => {
    const list = await this.get();
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
      await this.set(list);
    }
  };

  toggle = async (note: JoplinNote): Promise<boolean> => {
    let result = false;
    const list = await this.get();
    if (list.includes(note.id)) {
      const index = list.indexOf(note.id);
      if (index > -1) list.splice(index, 1);
    } else {
      list.push(note.id);
      result = true;
    }
    await this.set(list);
    return result;
  };

  prune = async (): Promise<number> => {
    let result = 0;

    const list = await this.get();
    for (let i = list.length - 1; i >= 0; i--) {
      const id = list[i];
      const note = await fetchNoteById(id);
      if (!note) {
        let index = list.indexOf(id);
        if (index > -1) list.splice(index, 1);
        result++;
      }
    }
    await this.set(list);

    return result;
  };

  registerPanel = async () => {
    await joplin.commands.register({
      name: 'toggleBacklinksIgnoreList',
      label: localization.command_openBacklinksIgnoreList,
      iconName: 'fas fa-filter',
      execute: async () => {
        if (!this.view) return;
        await this.app.setting<boolean>('ignorePanel', !(await this.app.setting<boolean>('ignorePanel')));
        await this.view.refresh();
      },
    });
  };

  registerAdd = async () => {
    await joplin.commands.register({
      name: 'addNoteBacklinksIgnoreList',
      label: localization.command_addNoteBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async (noteId: string = null) => {
        const note = noteId ? await fetchNoteById(noteId) : ((await joplin.workspace.selectedNote()) as JoplinNote);
        if (!note) {
          alert(localization.message__ignoreListNoSelectedNote);
          return;
        }
        await this.add(note);
      },
    });
  };

  registerDel = async () => {
    await joplin.commands.register({
      name: 'delNoteBacklinksIgnoreList',
      label: localization.command_delNoteBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async (noteId: string = null) => {
        const confirm = await joplin.views.dialogs.showMessageBox(localization.message__removeFromIgnoreList);
        if (confirm !== 0) return;
        await this.del(noteId);
      },
    });
  };

  registerToggle = async () => {
    await joplin.commands.register({
      name: 'toggleNoteBacklinksIgnoreList',
      label: localization.command_toggleNoteBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async (noteId: string = null) => {
        const note = noteId ? await fetchNoteById(noteId) : ((await joplin.workspace.selectedNote()) as JoplinNote);

        if (!note) {
          alert(localization.message__ignoreListNoSelectedNote);
          return;
        }

        if (await this.toggle(note)) {
          alert(localization.message__noteAddedToIgnoreList);
        } else {
          alert(localization.message__noteRemovedFromIgnoreList);
        }
      },
    });
  };

  registerClear = async () => {
    await joplin.commands.register({
      name: 'clearBacklinksIgnoreList',
      label: localization.command_clearBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const confirm = await joplin.views.dialogs.showMessageBox(localization.message__clearIgnoreList);
        if (confirm !== 0) return;
        await this.set([]);
      },
    });
  };

  registerPrune = async () => {
    await joplin.commands.register({
      name: 'pruneBacklinksIgnoreList',
      label: localization.command_pruneBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        const confirm = await joplin.views.dialogs.showMessageBox(localization.message__pruneIgnoreList);
        if (confirm !== 0) return;

        const result = await this.prune();
        const message =
          result > 0
            ? `${result} ${localization.message__ignoreListNotesPruned}`
            : localization.message__ignoreListNoNotesPruned;

        alert(message);
      },
    });
  };

  registerImport = async () => {
    await joplin.commands.register({
      name: 'importBacklinksIgnoreList',
      label: localization.command_importBacklinksIgnoreList,
      iconName: 'fas fa-hand-point-left',
      execute: async () => {
        try {
          const settingKey = 'plugin-joplin.plugin.ambrt.backlinksToNote.myBacklinksCustomSettingIgnoreList';
          const importList = (await this.app.setting<string[]>(settingKey, undefined, true)) || [];
          const ignoreList = await this.app.setting<string[]>('ignoreList');
          await this.app.setting<string[]>('ignoreList', [...new Set([...ignoreList, ...importList])]);
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

  createMenus = async () => {
    await joplin.views.menus.create('easyBacklinksMenu', 'Easy backlinks', [
      {
        commandName: 'toggleNoteBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+I',
      },
      {
        commandName: 'toggleBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+L',
      },
      {
        commandName: 'pruneBacklinksIgnoreList',
        accelerator: 'Ctrl+Alt+P',
      },
    ]);
  };

  init = async (): Promise<void> => {
    await this.view.init();

    await this.registerPanel();
    await this.registerAdd();
    await this.registerDel();
    await this.registerToggle();
    await this.registerClear();
    await this.registerPrune();
    await this.registerImport();
    await this.createMenus();
  };
}

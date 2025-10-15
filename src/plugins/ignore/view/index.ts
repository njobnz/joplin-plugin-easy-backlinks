import joplin from 'api';
import { ViewHandle } from 'api/types';
import { IGNORE_PANEL_EL, IGNORE_PANEL_ID } from '../../../constants';
import { JoplinNote } from '../../../types';
import localization from '../../../localization';
import fetchNoteById from '../../../utils/fetchNoteById';
import escapeHtml from '../../../utils/escapeHtml';
import IgnoreList from '..';
import App from '../..';

let fs: any = null;

export default class IgnoreView {
  app: App = null;
  module: IgnoreList = null;
  panel: ViewHandle = null;
  setting: Function = null;

  constructor(module: IgnoreList) {
    if (!module) throw Error('module cannot be null');
    this.app = module.app;
    this.module = module;
  }

  html = async (): Promise<string> => {
    const items = [];
    const list = await this.setting('ignoreList');
    const note = (await joplin.workspace.selectedNote()) as JoplinNote;

    for (const id of list) {
      const item = await fetchNoteById(id, ['title']);
      const selected = note && note.id === id ? ' selected' : '';
      const deleted = item ? '' : ' deleted';
      const title = item ? (item.title.trim() !== '' ? item.title : id) : `NOTE DELETED`;
      items.push(`
        <div id="note-${id}" class="row${selected}${deleted}" data-id="${id}">
          <div class="cell actions">
            <a class="remove" title="${localization.view_ignoreList_remove}">🗑️</a>
          </div>
          <div class="cell title" title="${id}"><a href="#">${escapeHtml(title)}</a></div>
        </div>
      `);
    }

    if (!items.length) items.push(`<span class="empty">${localization.view_ignoreList_empty}</span>`);

    const input = note ? ` value="${note.id}"` : '';

    return `
      <h1 id="title">${localization.view_ignoreList_title}</h1>
      <p id="description">${localization.view_ignoreList_description}</p>
      <form id="notes" name="notes">
        <div id="entry">
          <input type="text" id="note" name="note" class="input" placeholder="${
            localization.view_ignoreList_placeholder
          }"${input}>
          <button type="button" id="add" class="button">${localization.view_ignoreList_add}</button>
        </div>
        <div id="list" class="table">
          ${items.join('\n')}
        </div>
      </form>
      <div id="actions">
        <div id="prune"><a href="#">${localization.view_ignoreList_prune}</a></div>
        <div id="clear"><a href="#">${localization.view_ignoreList_clear}</a></div>
      </div>
    `;
  };

  content = async (html: string = ''): Promise<string> => {
    const path = await this.setting('customCss');
    const style = fs && fs.existsSync(path) ? `<style>${fs.readFileSync(path, 'utf-8')}</style>` : '';
    return `${style}<div id="${IGNORE_PANEL_EL}">${html}</div>`;
  };

  build = async (): Promise<void> => {
    if (this.panel) return;
    this.panel = await joplin.views.panels.create(IGNORE_PANEL_ID);
    await joplin.views.panels.addScript(this.panel, './plugins/ignore/view/assets/panel.css');
    await joplin.views.panels.addScript(this.panel, './plugins/ignore/view/assets/panel.js');
    await joplin.views.panels.onMessage(this.panel, this.app.onMessageHandler);
  };

  refresh = async (): Promise<void> => {
    if ((await this.setting('ignorePanel')) as boolean) {
      if (!this.panel) await this.build();
      await joplin.views.panels.setHtml(this.panel, await this.content(await this.html()));
      await joplin.views.panels.show(this.panel);
    } else if (this.panel) {
      await joplin.views.panels.hide(this.panel);
    }
  };

  init = async (): Promise<void> => {
    this.setting = this.app.setting;

    try {
      fs = await import('fs');
      if (fs && fs.existsSync === undefined) fs = null;
    } catch (e) {}

    await joplin.settings.onChange(this.refresh);
    await joplin.workspace.onNoteSelectionChange(this.refresh);
    await this.refresh();
  };
}

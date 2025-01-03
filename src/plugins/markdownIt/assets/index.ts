import { BacklinksContent } from '../../../types';
import { BacklinksListPosition, GET_BACKLINKS_CMD, GET_SETTING_CMD, MARKDOWNIT_SCRIPT_ID } from '../../../constants';

declare const webviewApi: any;

export class EasyBacklinks {
  readonly contentId = 'rendered-md';
  readonly headerId = 'backlinks-header';

  findHeaderByName(name: string, el: Element): Element | null {
    if (!el || !name?.trim()) return null;
    return (
      Array.from(el.children).find(child => child.tagName.startsWith('H') && child.textContent?.trim() === name) || null
    );
  }

  async fetchSetting<T>(name: string): Promise<T> {
    return webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_SETTING_CMD,
      name,
    });
  }

  async fetchBacklinks(isFound: boolean): Promise<BacklinksContent> {
    return webviewApi.postMessage(MARKDOWNIT_SCRIPT_ID, {
      command: GET_BACKLINKS_CMD,
      isFound,
    });
  }

  insertBacklinks(content: Element, heading: Element | null, backlinks: BacklinksContent): void {
    const { head = '', body = '', position = BacklinksListPosition.None } = backlinks;

    if (heading) {
      heading.insertAdjacentHTML('afterend', body);
      return;
    }

    if (position === BacklinksListPosition.None) return;

    const insert = position === BacklinksListPosition.Header ? 'afterbegin' : 'beforeend';
    content.insertAdjacentHTML(insert, head + body);
  }

  async writeBacklinks(): Promise<void> {
    const content = document.getElementById(this.contentId);
    if (!content) return;

    const name = (await this.fetchSetting<string>('listHeader')).replace(/^#{1,6}\s+/gm, '');
    const heading = document.getElementById(this.headerId) ?? this.findHeaderByName(name, content);

    const backlinks = await this.fetchBacklinks(Boolean(heading));
    if (backlinks.hide) return;

    this.insertBacklinks(content, heading, backlinks);
  }

  init(): void {
    this.writeBacklinks();
    document.addEventListener('joplin-noteDidUpdate', () => this.writeBacklinks());
  }
}

new EasyBacklinks().init();

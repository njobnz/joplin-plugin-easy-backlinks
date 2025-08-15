import joplin from 'api';
import MarkdownIt from 'markdown-it';
import App from '.';

export default class Renderer {
  app: App = null;
  markdown: MarkdownIt = null;
  options: any = {};
  canRender: boolean = false;
  showIcon: boolean = false;

  constructor(app: App) {
    if (!app) throw Error('app cannot be null');
    this.app = app;
    this.markdown = new MarkdownIt({ breaks: true });
  }

  render = async (text: string) => {
    this.showIcon = await this.app.setting<boolean>('showIcon');
    return this.markdown.render(text);
  };

  async init() {
    const version = (await joplin.versionInfo()).version.match(/^([0-9]+\.[0-9]+\.[0-9]+)*$/)[1];
    this.canRender = version.localeCompare('3.2.2', undefined, { numeric: true, sensitivity: 'base' }) >= 0;
    this.showIcon = await this.app.setting<boolean>('showIcon');

    this.markdown.renderer.rules.link_open = (tokens, idx, _options, _env, _self) => {
      const href = tokens[idx].attrGet('href');
      const match = /^\:\/([0-9A-Fa-f]{32})$/.test(href);
      const icon = this.showIcon && match ? '<span class="resource-icon fa-joplin"></span>' : '';
      return `<a href="${href}">${icon}`;
    };
  }
}

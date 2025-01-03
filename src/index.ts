import joplin from 'api';
import App from './plugins';

let easyBacklinksApp: App = null;

joplin.plugins.register({
  onStart: async () => {
    easyBacklinksApp = new App();
    await easyBacklinksApp.init();
  },
});

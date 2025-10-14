import joplin from 'api';

export default async (name: string, fallback: any = null, isGlobal: boolean = false): Promise<any> => {
  try {
    if (isGlobal) {
      return joplin.settings.globalValues === undefined
        ? (await joplin.settings.globalValues([name]))[0]
        : await joplin.settings.globalValue(name);
    }
    return (await joplin.settings.values(name))[name];
  } catch (e) {
    return fallback;
  }
};

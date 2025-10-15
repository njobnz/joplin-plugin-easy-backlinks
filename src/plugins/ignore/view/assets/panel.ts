import {
  OPEN_NOTE_CMD,
  ADD_IGNORED_CMD,
  DEL_IGNORED_CMD,
  CLEAR_IGNORE_CMD,
  PRUNE_IGNORE_CMD,
} from '../../../../constants';
import delegate from 'delegate';

declare const webviewApi: any;

type Handler = (target: HTMLElement | null) => void;
type Action = { selector: string; handler: Handler };

function getNoteIdFromElement(el: HTMLElement): string | null {
  if (el.dataset.id) return el.dataset.id;
  const parent = el.closest('div.row') as HTMLElement;
  if (parent && parent.dataset.id) return parent.dataset.id;
  return null;
}

const actions: Action[] = [
  {
    selector: 'button#add',
    handler: () => {
      const noteId = (document.getElementById('note') as HTMLInputElement)?.value?.trim();
      if (noteId) webviewApi.postMessage({ command: ADD_IGNORED_CMD, noteId });
    },
  },
  {
    selector: '#list .actions > a.remove',
    handler: target => {
      const noteId = target ? getNoteIdFromElement(target) : null;
      if (noteId) webviewApi.postMessage({ command: DEL_IGNORED_CMD, noteId });
    },
  },
  {
    selector: '#list .title > a',
    handler: target => {
      const noteId = target ? getNoteIdFromElement(target) : null;
      if (noteId) webviewApi.postMessage({ command: OPEN_NOTE_CMD, noteId });
    },
  },
  {
    selector: '#clear > a',
    handler: () => webviewApi.postMessage({ command: CLEAR_IGNORE_CMD }),
  },
  {
    selector: '#prune > a',
    handler: () => webviewApi.postMessage({ command: PRUNE_IGNORE_CMD }),
  },
];

actions.forEach(({ selector, handler }) =>
  delegate(
    selector,
    'click',
    (e: PointerEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      handler(target);
    },
    false
  )
);

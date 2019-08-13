import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Toolbar } from './toolbar/toolbar';
import { Editor } from './editor/editor';
import { EditorOptions } from './help';
import { Paths } from './paths/paths';


export class Core {
  readonly host = document.createElement('div');
  readonly editor = new Editor();
  readonly paths = new Paths();
  readonly toolbar = new Toolbar(this.editor);
  readonly onReady: Observable<this>;
  private container: HTMLElement;
  private readyEvent = new Subject<this>();

  constructor(selector: string | HTMLElement, private options: EditorOptions = {}) {
    if (typeof selector === 'string') {
      this.container = document.querySelector(selector);
    } else {
      this.container = selector;
    }
    if (Array.isArray(options.handlers)) {
      options.handlers.forEach(handler => {
        if (Array.isArray(handler)) {
          this.toolbar.addGroup(handler);
        } else {
          this.toolbar.addHandler(handler);
        }
      });
    }

    this.onReady = this.readyEvent.asObservable();

    this.host.appendChild(this.toolbar.host);
    this.host.appendChild(this.editor.host);
    this.host.appendChild(this.paths.host);

    this.host.classList.add('tanbo-editor-container');
    this.container.appendChild(this.host);

    this.paths.onCheck.subscribe(node => {
      this.editor.updateSelectionByElement(node);
    });

    this.editor.onSelectionChange.pipe(map(selector => selector.focusNode), distinctUntilChanged()).subscribe(node => {
      this.paths.update(node as Element);
    });
    this.editor.onLoad.subscribe(() => {
      this.readyEvent.next(this);
    });
  }

}
import { ButtonHandler } from '../toolbar/help';
import { Editor } from '../editor/editor';

export const blockquoteHandler: ButtonHandler = {
  type: 'button',
  classes: ['tanbo-editor-icon-quotes-right'],
  tooltip: '引用',
  match: {
    tags: ['BLOCKQUOTE']
  },
  execCommand(editor: Editor): void {
    editor.format({
      useTagName: 'blockquote'
    });
  }
};
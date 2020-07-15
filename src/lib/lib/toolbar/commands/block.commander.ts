import {
  Commander,
  FormatAbstractData,
  FormatEffect,
  Fragment,
  Renderer, DivisionComponent,
  TBSelection, BranchComponent, BackboneComponent
} from '../../core/_api';
import { BlockComponent } from '../../components/block.component';
import { boldFormatter } from '../../formatter/bold.formatter';
import { BrComponent } from '../../components/br.component';

export class BlockCommander implements Commander<string> {
  recordHistory = true;

  constructor(private tagName: string) {
  }

  updateValue(value: string): void {
    this.tagName = value;
  }

  command(selection: TBSelection, overlap: boolean, renderer: Renderer): void {
    selection.ranges.forEach(range => {

      range.getSuccessiveContents().forEach(scope => {
        const blockComponent = new BlockComponent(this.tagName);

        const parentComponent = renderer.getParentComponent(scope.fragment);

        if (scope.startIndex === 0 && scope.endIndex === scope.fragment.contentLength) {
          if (parentComponent instanceof DivisionComponent) {
            const parentFragment = renderer.getParentFragment(parentComponent);
            blockComponent.slot.from(scope.fragment);
            parentFragment.insertBefore(blockComponent, parentComponent);
            parentFragment.cut(parentFragment.indexOf(parentComponent), 1);
            this.effect(blockComponent.slot, parentComponent.tagName);
          } else if (parentComponent instanceof BranchComponent) {
            const index = parentComponent.slots.indexOf(scope.fragment);
            blockComponent.slot.from(scope.fragment);
            this.effect(blockComponent.slot, parentComponent.tagName);
            const fragment = new Fragment();
            fragment.append(blockComponent);
            parentComponent.slots.splice(index, 1, fragment);
          } else if (parentComponent instanceof BackboneComponent) {
            const parentFragment = renderer.getParentFragment(parentComponent);
            blockComponent.slot.from(scope.fragment);
            scope.fragment.clean();
            scope.fragment.append(new BrComponent());
            parentFragment.insertBefore(blockComponent, parentComponent);
            parentFragment.cut(parentFragment.indexOf(parentComponent), 1);
            this.effect(blockComponent.slot, parentComponent.tagName);
          }
        } else {
          blockComponent.slot.from(new Fragment());
          const c = scope.fragment.cut(scope.startIndex, scope.endIndex - scope.startIndex);
          c.contents.forEach(cc => blockComponent.slot.append(cc));
          c.formatRanges.forEach(ff => blockComponent.slot.apply(ff));
          scope.fragment.insert(blockComponent, scope.startIndex);
          this.effect(blockComponent.slot, '');
        }
      })
    })
  }

  private effect(fragment: Fragment, oldTagName: string) {
    if (/h[1-6]/.test(this.tagName)) {
      fragment.apply({
        state: FormatEffect.Inherit,
        startIndex: 0,
        endIndex: fragment.contentLength,
        abstractData: new FormatAbstractData({
          tag: 'strong'
        }),
        renderer: boldFormatter
      })
    } else if (this.tagName === 'p') {
      const flag = /h[1-6]/.test(oldTagName);
      if (flag) {
        fragment.apply({
          state: FormatEffect.Invalid,
          startIndex: 0,
          endIndex: fragment.contentLength,
          abstractData: new FormatAbstractData({
            tag: 'strong'
          }),
          renderer: boldFormatter
        })
      }
    }
  }
}

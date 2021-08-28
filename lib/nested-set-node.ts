import {NestedSetProperties} from './nested-set-properties';

export class NestedSetNode implements NestedSetProperties {
  public uuid: string | null;
  public org_uuid: string | null;
  public title: string;
  public tag: string;
  public node_left: number;
  public node_right: number;
  public node_depth: number;
  public type: string;
  public created_by: string | null;
  public updated_by: string | null;
  public created_at: string | null;
  public updated_at: string | null;
  public deleted_by: string | null;
  public deleted_at: string | null;

  public children: NestedSetNode[];
  public parent: NestedSetNode | null;

  constructor(title: string = '', left: number = 0, right: number = 1, depth: number = 0, parent?: NestedSetNode) {
    this.title = title;
    this.node_depth = depth;
    this.node_left = left;
    this.node_right = right;
    this.children = [];

    if (parent) {
      parent.append(this);
    } else {
      this.parent = null;
    }
  }

  public isLeaf(): boolean {
    return (this.node_depth > 0 && this.children.length === 0);
  }

  public isRoot(): boolean {
    return !(this.parent);
  }

  public prevSibling(): NestedSetNode | null {
    if (this.parent) {
      let idx = this.parent.children.indexOf(this);

      return (typeof this.parent.children[idx - 1] !== 'undefined') ? this.parent.children[idx - 1] : null;
    } else {
      return null;
    }
  }

  public nextSibling(): NestedSetNode | null {
    if (this.parent) {
      let idx = this.parent.children.indexOf(this);

      return (typeof this.parent.children[idx + 1] !== 'undefined') ? this.parent.children[idx + 1] : null;
    } else {
      return null;
    }
  }

  public countNextSiblings(): number {
    if (this.parent) {
      return this.parent.children.length - (this.parent.children.indexOf(this) + 1);
    } else {
      return 0;
    }
  }

  public getSize(): number {
    if (this.isLeaf()) {
      return 2;
    } else {
      let childrenSize = 0;

      this.children.forEach((child: NestedSetNode) => {
        childrenSize = childrenSize + child.getSize();
      });
      return 2 + childrenSize;
    }
  }

  public append(node: NestedSetNode) {
    node.parent = this;
    node.node_depth = this.node_depth + 1;
    this.children.push(node);
    this.rebuild();
  }

  public prepend(node: NestedSetNode) {
    node.parent = this;
    node.node_depth = this.node_depth + 1;
    this.children.unshift(node);
    this.rebuild();
  }

  public rebuild(list: NestedSetNode[] = []): NestedSetNode[] {
    if (list.indexOf(this) === -1) {

      if (this.parent) {
        let myIdx = this.parent.children.indexOf(this);

        if (myIdx === 0) {
          this.node_left = this.parent.node_left + 1;
        } else if (myIdx > 0) {
          this.node_left = this.parent.children[myIdx - 1].node_right + 1;
        }
      } else {
        this.node_left = 0;
      }

      list.push(this);
    }

    if (!this.isLeaf()) {
      let tmp: NestedSetNode[] = [];

      tmp = this.children.reduce((accumulator, child) => {
        if (accumulator.length === 0 && list.indexOf(child) === -1) {
          accumulator.push(child);
        }

        return accumulator;
      }, tmp);

      if (tmp.length === 1) {
        this.node_right = this.node_left + this.getSize() - 1;

        return tmp[0].rebuild(list);
      }
    }

    if (this.isRoot()) {
      this.node_right = this.node_left + this.getSize() - 1;

      return list;
    } else {
      let sibling = this.nextSibling();

      this.node_right = this.node_left + this.getSize() - 1;

      return (sibling) ? sibling.rebuild(list) : (this.parent as NestedSetNode).rebuild(list);
    }
  }

  public toNestedSetProperties(): NestedSetProperties {
    return {
      uuid:this.uuid,
      org_uuid:this.org_uuid,
      title:this.title,
      tag:this.tag,
      node_left:this.node_left,
      node_right:this.node_right,
      node_depth:this.node_depth,
      type:this.type,
      created_by:this.created_by,
      updated_by:this.updated_by,
      created_at:this.created_at,
      updated_at:this.updated_at,
      deleted_by:this.deleted_by,
      deleted_at:this.deleted_at,
    };
  }

  public flat(): NestedSetProperties[] {
    return (this.rebuild()).map((node) => node.toNestedSetProperties());
  }

  public removeChild(child: NestedSetNode) {
    let idx = this.children.indexOf(child);

    if (idx > -1) {
      this.children.splice(idx, 1);
      child.parent = null;
      this.rebuild();
    }
  }

  public validate(): void {
    if (this.node_depth !== 0 && this.parent === null) {
      throw new Error('Required parent when depth is not zero.');
    }

    if (this.parent !== null) {
      if (this.parent.node_left >= this.node_left) {
        throw new Error('Node left property cannot be lower than or equals to its parent left property.');
      }
      if (this.parent.node_right <= this.node_right) {
        throw new Error('Node right property cannot be greater than or equals to its parent right property.');
      }
      if (this.parent.node_depth + 1 !== this.node_depth) {
        throw new Error('Node depth property must be exactly plus-one of its parent depth property.');
      }
    }
  }
}

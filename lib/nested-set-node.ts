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

  /**
   * Constructor
   * @param {string} title
   * @param {string} type
   * @param {string | null} uuid;
   * @param {string | null} org_uuid;
   * @param {string | null} created_by;
   * @param {string | null} updated_by;
   * @param {string | null} created_at;
   * @param {string | null} updated_at;
   * @param {string | null} deleted_by;
   * @param {string | null} deleted_at;
   * @param {number} left
   * @param {number} right
   * @param {number} depth
   * @param {NestedSetNode} parent
   */
  constructor(title: string, type: string, uuid: string | null = null, org_uuid: string | null = null, created_by: string | null = null,
    updated_by: string | null = null, created_at: string | null = null, updated_at: string | null = null, deleted_by: string | null = null,
    deleted_at: string | null = null, left: number = 0, right: number = 1, depth: number = 0, parent?: NestedSetNode) {
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

  /**
   * Is Leaf
   * @return {boolean}
   */
  public isLeaf(): boolean {
    return (this.node_depth > 0 && this.children.length === 0);
  }

  /**
   * Is Root
   * @return {boolean}
   */
  public isRoot(): boolean {
    return !(this.parent);
  }

  /**
   * Previous Sibling
   * @return {NestedSetNode | null}
   */
  public prevSibling(): NestedSetNode | null {
    if (this.parent) {
      let idx = this.parent.children.indexOf(this);

      return (typeof this.parent.children[idx - 1] !== 'undefined') ? this.parent.children[idx - 1] : null;
    } else {
      return null;
    }
  }

  /**
   * Next Sibling
   * @return {NestedSetNode | null}
   */
  public nextSibling(): NestedSetNode | null {
    if (this.parent) {
      let idx = this.parent.children.indexOf(this);

      return (typeof this.parent.children[idx + 1] !== 'undefined') ? this.parent.children[idx + 1] : null;
    } else {
      return null;
    }
  }

  /**
   * Count Next Siblings
   * @return {number}
   */
  public countNextSiblings(): number {
    if (this.parent) {
      return this.parent.children.length - (this.parent.children.indexOf(this) + 1);
    } else {
      return 0;
    }
  }

  /**
   * Get Size
   * @return {number}
   */
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

  /**
   * Append
   * @param {NestedSetNode} node
   * @return {void}
   */
  public append(node: NestedSetNode) {
    node.parent = this;
    node.node_depth = this.node_depth + 1;
    this.children.push(node);
    this.rebuild();
  }

  /**
   * Prepend
   * @param {NestedSetNode} node
   * @return {void}
   */
  public prepend(node: NestedSetNode) {
    node.parent = this;
    node.node_depth = this.node_depth + 1;
    this.children.unshift(node);
    this.rebuild();
  }

  /**
   * Rebuild
   * @param {NestedSetNode} list
   * @return {NestedSetNode[]}
   */
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

  /**
   * To Nested Set Properties
   * @return {NestedSetProperties}
   */
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

  /**
   * Flat
   * @return {NestedSetProperties[]}
   */
  public flat(): NestedSetProperties[] {
    return (this.rebuild()).map((node) => node.toNestedSetProperties());
  }

  /**
   * Array to Nested
   * @param {NestedSetProperties[]} documents
   * @return {NestedSetNode[]}
  */
  public static async toNested(documents:NestedSetProperties[]): Promise<NestedSetNode[]> {
    const nestedObjects:NestedSetNode[] = [];
    documents.map((doc) => {
      // Create node
      const docArrayKey = doc.tag;
      nestedObjects[docArrayKey] = new NestedSetNode(doc.title, doc.type, doc.uuid, doc.org_uuid, doc.created_by,
          doc.updated_by, doc.created_at, doc.updated_at, doc.deleted_by, doc.deleted_at);
      // Check parent
      const parent = documents.find(( {node_left, node_right, node_depth} ) => {
        return doc.node_left > node_left && doc.node_right < node_right && node_depth == doc.node_depth-1;
      });
      // Append
      let parentArrayKey = 'root';
      if (parent) {
        parentArrayKey = parent.tag;
      }
      if (docArrayKey != 'root') {
        nestedObjects[parentArrayKey].append(nestedObjects[docArrayKey]);
      }
    });

    return nestedObjects;
  }

  /**
   * Remove Child
   * @param {NestedSetNode} child
   */
  public removeChild(child: NestedSetNode) {
    let idx = this.children.indexOf(child);

    if (idx > -1) {
      this.children.splice(idx, 1);
      child.parent = null;
      this.rebuild();
    }
  }

  /**
   * Validate
   */
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

import { EventEmitter } from 'events';

/**
 * 
 */
export interface NodeOpts {
    parent?: Node;
    children?: Node[];
}

export type fn<T> = (r: T) => void;

/**
 * Events:
 * 
 * remove: Removed from parent
 * @param parent Old parent
 * 
 * reparent: Parent changed
 * @param oldParent Old parent
 * @param parent New parent
 * 
 * adopt: Parent added
 * @param parent New parent
 * 
 * move: Node index changed
 * @param index New index
 * 
 * node: Node added
 * @param node The added node
 * 
 * childRemoved: Node removed
 * @param node The removed node
 */

/**
 * The base node, which is extended by Element and Screen.
 * @abstract
 */
export default abstract class Node extends EventEmitter {
    get parent() {
        return this._parent;
    }
    set parent(parent: typeof this['_parent'] | undefined) {
        if (!(parent instanceof Node)) parent = undefined;
        const p = this._parent;
        this._parent = parent;
        if (!parent && p) this.emit('remove', p);
        else if (parent && p) this.emit('reparent', parent, p);
        else if (parent) this.emit('adopt', parent);
    }
    _parent?: Node;
    children: Node[];
    _data?: Record<string | symbol, any>;
    $?: Record<string | symbol, any>;
    type: string;
    constructor(opts?: NodeOpts) {
        super();
        opts = typeof opts === 'object' ? opts : {};
        this._data = {};
        this.$ = {};
        this.type = 'node';
        if (!Array.isArray(opts.children)) opts.children = undefined;
        if (!(opts.parent instanceof Node)) opts.parent = undefined;
        this.children = opts.children ?? [];
        if (opts.parent) this.parent = opts.parent;
    }
    setParent(parent?: Node) {
        this.parent = parent;
    }
    removeParent() {
        this.setParent();
    }
    /**
     * Prepend node to the beginning of children
     * @param node The node to prepend
     * @param move Move the node (if node is already added)
     */
    prepend(node: Node, move = false) {
        if (!(node instanceof Node)) return;
        if (move) {
            const i = this.children.indexOf(node);
            if (i < 0) move = false;
            else this.children.splice(i, 1);
        }
        this.children.unshift(node);
        if (move) node.emit('move', 0);
        else {
            this.emit('node', node);
            node.parent = this;
        }
    }
    prep = this.prepend;
    unshift = this.prepend;
    /**
     * Append node to the end of children
     * @param node The node to append
     * @param move Move the node (if node is already added)
     */
    append(node: Node, move = false) {
        if (!(node instanceof Node)) return;
        if (move) {
            const i = this.children.indexOf(node);
            if (i < 0) move = false;
            else this.children.splice(i, 1);
        }
        this.children.push(node);
        if (move) node.emit('move', this.children.length - 1);
        else {
            this.emit('node', node);
            node.parent = this;
        }
    }
    push = this.append;
    /**
     * Remove node from children
     * @param node The node to remove
     */
    remove(node: Node) {
        if (!(node instanceof Node)) return;
        const i = this.children.indexOf(node);
        if (i < 0) {
            return;
        }
        this.children.splice(i, 1);
        node.removeParent();
        this.emit('childRemoved', node);
    }
    delete = this.remove;
    /**
     * Insert node into children at a specific index
     * @remarks If index is less than zero, it will be treated as zero. If index is >= children.length, it will be treated as children.length
     * @param node The node to insert
     * @param i The index to insert into
     * @param move Move the node (if node is already added)
     */
    insert(node: Node, i: number, move = false): void {
        if (!(node instanceof Node)) return;
        if (move) {
            const i = this.children.indexOf(node);
            if (i < 0) move = false;
            else this.children.splice(i, 1);
        }
        if (i >= this.children.length) this.append(node);
        else if (i < 0) this.prepend(node);
        else this.children.splice(i, 0, node);
        if (move) node.emit('move', i);
        else {
            this.emit('node', node);
            node.parent = this;
        }
    }
    /**
     * Insert node into children before a certain node
     * @param node The node to insert
     * @param ref The node to insert before
     * @param move Move the node (if node is already added)
     */
    insertBefore(node: Node, ref: Node, move = false): void {
        const idx = this.children.indexOf(ref);
        if (idx < 0) throw new Error('Could not find reference node (inserting child)');
        this.insert(node, idx, move);
    }
    insertBef = this.insertBefore;
    /**
     * Insert node into children after a certain node
     * @param node The node to insert
     * @param ref The node to insert after
     * @param move Move the node (if node is already added)
     */
    insertAfter(node: Node, ref: Node, move = false): void {
        const idx = this.children.indexOf(ref);
        if (idx < 0) throw new Error('Could not find reference node (inserting child)');
        this.insert(node, idx + 1, move);
    }
    insertAft = this.insertAfter;
    /**
     * Remove node from parent, if it exists
     */
    detach() {
        this.parent?.remove(this);
    }
    /**
     * Emit event for self, and recursively emit same event for all descendants
     * @param ev The event to emit
     * @param args The args to pass to the event
     */
    emitDescendants(ev: string, ...args: any[]) {
        this.emit(ev, ...args);
        for (const c of this.children) c.emitDescendants(ev, ...args);
    }
    /**
     * Recursively emit event for all descendants, excluding self
     * @param ev The event to emit
     * @param args The args to pass to the event
     */
    emitDescendantsExSelf(ev: string, ...args: any[]) {
        for (const c of this.children) c.emitDescendants(ev, ...args);
    }
    /**
     * Check if listener for event exists on this node
     * @param ev Event name
     * @param fn Event listener
     */
    hasListener(ev: string | symbol, fn: (...args: any[]) => void) {
        return this.listeners(ev).includes(fn);
    }
}

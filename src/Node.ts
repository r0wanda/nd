import type Screen from './Screen.js';
import Element from './Element.js';
import { EventEmitter } from 'node:events';

/**
 * Miscellaneous data to be stored with a Node
 */
export interface NodeData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

/**
 * The base node, which is extended by Element and Screen. Very little functionality, mainly parent, children, and screen.
 * @abstract
 */
export default class Node extends EventEmitter {
    screen?: Screen;
    parent?: Node;
    children: Array<Node>;
    _data?: NodeData;
    $?: NodeData;
    type: string;
    constructor() {
        super();
        this.type = 'node';
        this.children = [];
    }
    pruneNodes(arr: Array<Node> = this.children): Array<Element> {
        const a = <Array<Element>>arr;
        return a.filter(ch => ch instanceof Element);
    }
    /**
     * Add node to screen
     * @param scr The screen to 
     * @returns 
     */
    setScreen(scr?: Screen, nodeAdded = false): number {
        // screen cant have a screen duhrrr
        if (this.type === 'screen') return -1;
        this.screen = scr;
        if (!nodeAdded) this.screen?.append(this);
        if (scr) this.emit('attach', scr);
        else this.emit('detach', scr);
        return scr ? scr.children.length : -1;
    }
    removeScreen() {
        // screen is undefined now :)
        this.setScreen();
    }
    setParent(parent?: Node) {
        const p = this.parent;
        this.parent = parent;
        if (!parent && p) this.emit('remove', parent);
        else if (parent && p) this.emit('reparent', parent, p);
        else if (parent) this.emit('adopt', parent);
    }
    /**
     * Prepend node to the beginning of children
     * @param node The node to prepend
     * @param throwOnInvalid Whether or not to throw on invalid type
     */
    prepend(node: Node, throwOnInvalid = false) {
        if (!(node instanceof Node)) {
            if (throwOnInvalid) throw new Error('Node is invalid (editing children)');
            else return;
        }
        this.children.unshift(node);
        this.emit('_node', node);
    }
    /**
     * Append node to the end of children
     * @param node The node to append
     * @param throwOnInvalid Whether or not to throw on invalid type
     */
    append(node: Node, throwOnInvalid = false) {
        if (!(node instanceof Node)) {
            if (throwOnInvalid) throw new Error('Node is invalid (editing children)');
            else return;
        }
        this.children.push(node);
        this.emit('_node', node);
    }
    /**
     * Alias of append
     * @param node The node to append
     * @param throwOnInvalid Whether or not to throw on invalid type
     */
    push(node: Node, throwOnInvalid = false) {
        this.append(node, throwOnInvalid);
    }
    /**
     * Remove node from children
     * @param node The node to remove
     * @param throwOnInvalid Whether or not to throw on invalid node or type
     * @param throwOnInvalidNode Whether or not to throw on invalid node (specifically)
     * @param throwOnInvalidType Whether or not to throw on invalid type (specifically)
     */
    remove(node: Node, throwOnInvalid = false, throwOnInvalidNode = false, throwOnInvalidType = false) {
        if (!(node instanceof Node)) {
            if (throwOnInvalid || throwOnInvalidType) throw new Error('Node is invalid (editing children)');
            else return;
        }
        const i = this.children.indexOf(node);
        if (i < 0) {
            if (throwOnInvalidNode || throwOnInvalid) throw new Error('Invalid node (removinf child)');
            else return;
        }
        this.children.splice(i, 1);
        this.emit('_node', node);
    }
    /**
     * Insert node into children at a specific index
     * @param node The node to insert
     * @param i The index to insert into
     * @param throwOnInvalid Whether or not to throw an error if the index or type is invalid
     * @param acceptInvalidIndexes Whether or not to accept indexes greater than the length of children
     * @param throwOnInvaidIndexes Whether or not to throw an error if the index (specifically) is invalid
     */
    insert(node: Node, i: number, throwOnInvalid = false, acceptInvalidIndexes = true, throwOnInvaidIndexes = false, throwOnInvalidType = false): void {
        if (!(node instanceof Node)) {
            if (throwOnInvalid || throwOnInvalidType) throw new Error('Node is invalid (editing children)');
            else return;
        }
        if (i > this.children.length - 1 && acceptInvalidIndexes) this.append(node);
        else if (i < 0 && acceptInvalidIndexes) this.prepend(node);
        else if (!acceptInvalidIndexes && (i < 0 || i > this.children.length - 1)) {
            if (throwOnInvalid || throwOnInvaidIndexes) throw new Error('Invalid index (inserting child)');
            else return;
        } else this.children.splice(i, 0, node);
        this.emit('_node', node);
    }
    /**
     * Insert node into children before a certain node
     * @param node The node to insert
     * @param ref The node to insert before
     * @param throwOnInvalid Whether or not to throw an error if the index or type is invalid
     * @param acceptInvalidIndexes Whether or not to accept indexes greater than the length of children
     * @param throwOnInvaidIndexes Whether or not to throw an error if the index (specifically) is invalid
     */
    insertBefore(node: Node, ref: Node, throwOnInvalid = false, acceptInvalidIndexes = true, throwOnInvaidIndexes = false, throwOnInvalidType = false): void {
        this.insert(node, this.children.indexOf(ref), throwOnInvalid, acceptInvalidIndexes, throwOnInvaidIndexes, throwOnInvalidType);
    }
    /**
     * Insert node into children after a certain node
     * @param node The node to insert
     * @param ref The node to insert after
     * @param throwOnInvalid Whether or not to throw an error if the index or type is invalid
     * @param acceptInvalidIndexes Whether or not to accept indexes greater than the length of children
     * @param throwOnInvaidIndexes Whether or not to throw an error if the index (specifically) is invalid
     */
    insertAfter(node: Node, ref: Node, throwOnInvalid = false, acceptInvalidIndexes = true, throwOnInvaidIndexes = false, throwOnInvalidType = false): void {
        this.insert(node, this.children.indexOf(ref) + 1, throwOnInvalid, acceptInvalidIndexes, throwOnInvaidIndexes, throwOnInvalidType);
    }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emitDescendants(ev: string, ...args: Array<any>) {
        this.emit(ev, ...args);
        for (const c of this.children) c.emitDescendants(ev, ...args);
    }
    /**
     * Recursively emit event for all descendants, excluding self
     * @param ev The event to emit
     * @param args The args to pass to the event
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emitDescendantsExSelf(ev: string, ...args: Array<any>) {
        for (const c of this.children) c.emitDescendants(ev, ...args);
    }
}

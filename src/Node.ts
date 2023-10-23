import type Screen from './Screen.js';
import { EventEmitter } from 'node:events';

export interface NodeData {
    [key: string]: any;
}
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
    }
}

import { randomInt } from 'node:crypto';
import _Node from '../src/Node.js';
import { jest, describe, expect, test } from '@jest/globals';

class Node extends _Node {};

describe('node tests', () => {
    describe('node options', () => {
        // generate children/parent
        const children: Node[] = [];
        for (let i = randomInt(10) + 1; i >= 0; i--) {
            children.push(new Node());
        }
        expect(children.length).toBeGreaterThan(0);
        const parent = new Node();

        // generate node
        const node = new Node({
            parent,
            children
        });

        // check equality
        test('node parent option', () => {
            expect(Object.is(node.parent, parent)).toBeTruthy();
        });
        test('node children options', () => {
            expect(node.children).toHaveLength(children.length);
            for (let i = 0; i < node.children.length; i++) {
                expect(Object.is(node.children[i], children[i])).toBeTruthy();
            }
        });
    });
    describe('node events', () => {
        test('node adopt event', () => {
            const node = new Node();
            const parent = new Node();
            const f = jest.fn();
            node.on('adopt', f);
            node.parent = parent;
            expect(f).toHaveBeenCalledTimes(1);
            expect(f).toHaveBeenCalledWith(parent);
            node.removeAllListeners('adopt');
        });
        test('node remove event', () => {
            const parent = new Node();
            const node = new Node({ parent });
            const f = jest.fn();
            node.on('remove', f);
            node.removeParent();
            expect(f).toHaveBeenCalledTimes(1);
            expect(f).toHaveBeenCalledWith(parent);
            node.removeAllListeners('remove');
        });
        test('node reparent event', () => {
            const parent = new Node();
            const node = new Node({ parent });
            const stepParent = new Node();
            const f = jest.fn();
            node.on('reparent', f);
            node.parent = stepParent;
            expect(f).toHaveBeenCalledTimes(1);
            expect(f).toHaveBeenCalledWith(stepParent, parent);
            node.removeAllListeners('reparent');
        });
        test('node move event', () => {
            const children: Node[] = [];
            for (let i = 0; i < 10; i++) {
                children.push(new Node());
            }
            const node = new Node({ children });
            for (let i = 0; i < node.children.length; i++) {
                const n = randomInt(10);
                const f = jest.fn();
                node.children[i].on('move', f);
                node.insert(node.children[i], n, true);
                expect(f).toHaveBeenCalledTimes(1);
                expect(f).toHaveBeenCalledWith(n);
                node.removeListener('move', f);
            }
            const notChild = new Node();
            const mf = jest.fn();
            const af = jest.fn();
            notChild.on('move', mf);
            notChild.on('adopt', af);
            node.append(notChild, true);
            expect(mf).toBeCalledTimes(0);
            expect(af).toBeCalledTimes(1);
        });
    });
});
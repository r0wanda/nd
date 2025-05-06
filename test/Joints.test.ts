import { describe, expect, test } from '@jest/globals';
import Joints/*, { _classifyJoint }*/ from '../src/Joints.js';
import { flatten } from 'flat';

describe('joint', () => {
    test('valid joint lengths', () => {
        for (const joint of Object.values(<object>flatten(Joints))) {
            expect(joint).toHaveLength(1);
        }
    });
    //console.log(_classifyJoint('╬'))
    test.todo('_classifyJoint');
});
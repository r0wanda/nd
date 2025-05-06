import { type BorderWants, type Shd } from "./Screen.js";

export const boxRe = /[\u2500-\u257F]/giu;
export 

/**
 * Joint collection
 * ch: character
 * t/b/l/r: should look familiar if you've seen the Element code (tblr)
 * s/h/d: single/heavy/double
 * @internal
 * @remarks This contains all current unicode box connections, which is not a complete list (eg. heavy and double will never connect)
 * @see {@link https://en.wikipedia.org/wiki/Box-drawing_character}
 */
const Joints = {
    //sorted by number of connections
    triple: {
        // format: directions, clockwise starting at top
        trb: {
            // format: clockwise again
            sss: '├',
            shs: '┝',
            hss: '┞',
            ssh: '┟',
            hsh: '┠',
            hhs: '┡',
            shh: '┢',
            hhh: '┣',
            sds: '╞',
            dsd: '╟',
            ddd: '╠'
        },
        tbl: {
            sss: '┤',
            ssh: '┥',
            hss: '┦',
            shs: '┧',
            hhs: '┨',
            hsh: '┩',
            shh: '┪',
            hhh: '┫',
            ssd: '╡',
            dds: '╢',
            ddd: '╣'
        },
        rbl: {
            sss: '┬',
            ssh: '┭',
            hss: '┮',
            hsh: '┯',
            shs: '┰',
            shh: '┱',
            hhs: '┲',
            hhh: '┳',
            dsd: '╤',
            sds: '╥',
            ddd: '╦'
        },
        trl: {
            sss: '┴',
            ssh: '┵',
            shs: '┶',
            shh: '┷',
            hss: '┸',
            hsh: '┹',
            hhs: '┺',
            hhh: '┻',
            sdd: '╧',
            dss: '╨',
            ddd: '╩'
        }
    },
    quad: {
        //clockwise from the top
        ssss: '┼',
        sssh: '┽',
        shss: '┾',
        shsh: '┿',
        hsss: '╀',
        sshs: '╁',
        hshs: '╂',
        hssh: '╃',
        hhss: '╄',
        sshh: '╅',
        shhs: '╆',
        hhsh: '╇',
        shhh: '╈',
        hshh: '╉',
        hhhs: '╊',
        hhhh: '╋',
        sdsd: '╪',
        dsds: '╫',
        dddd: '╬'
    }
}

Object.freeze(Joints);

export function _classifyJoint(ch: string): BorderWants | undefined {
    if (ch.length > 1) return;
    const quad = Object.entries(Joints.quad).find(j => j[1] === ch);
    if (quad) {
        const wants: BorderWants = {
            ch: quad[1]
        }
        const j = <Shd[]>quad[0].split('');
        wants.t = j[0];
        wants.r = j[1];
        wants.b = j[2];
        wants.l = j[3];
        return wants;
    } else {
        let joint: [string, string];
        let dir!: keyof typeof Joints['triple'];
        for (dir in Joints.triple) {
            const joints = Joints.triple[<keyof typeof Joints['triple']>dir];
            joint = <typeof joint>Object.entries(joints).find(j => j[1] === ch);
            if (joint) break;
        }
        if (!joint!) return;
        const wants: BorderWants = {
            ch: joint[1]
        }
        const dirs = <('t' | 'b' | 'l' | 'r')[]>dir.split('');
        for (let i = 0; i < dirs.length; i++) {
            wants[dirs[i]] = <Shd>joint[0].charAt(i);                    
        }
        return wants;
    }
}

export default Joints;

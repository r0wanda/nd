export const boxRe = /[\u2500-\u257F]/giu;

/**
 * Joint collection
 * ch: character
 * t/b/l/r: should look familiar if you've seen the Element code (tblr)
 * s/h/d: single/heavy/double
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

export default Joints;

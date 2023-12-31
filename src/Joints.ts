export const boxRe = /[\u2500-\u257F]/giu;
//export const heavyRe = /[\u2501\u2503\u2505\u2507\u2509\u250b\u254d\u254f]/giu
export const heavyB = /[\u2501\u2503\u2505\u2507\u2509\u250b\u254d\u254f]|[\u250e\u250f\u2512\u2513\u251f\u2520\u2522\u2523\u2527\u2528\u252a\u252b\u2530\u2531\u2532\u2533\u2541\u2542\u2545\u2546\u2548\u2549\u254a\u254b\u257b\u257d]/giu

/**
 * Joint collection
 * ch: character
 * t/b/l/r: should look familiar if you've seen the Element code (tblr)
 * s/h/d: single/heavy/double
 * @remarks Heavy and double will never connect
 */
const Joints = {
    //sorted by number of connections
    /*double: {
        // sorted by direction of connections, horiz, then vertical
        rb: {
            // format: again, horiz, then vertical
            ss: '┌',
            hs: '┍',
            sh: '┎',
            hh: '┏',
            ds: '╒',
            sd: '╓',
            dd: '╔' 
        },
        lb: {
            ss: '┐',
            hs: '┑',
            sh: '┒',
            hh: '┓',
            ds: '╕',
            sd: '╖',
            dd: '╗'
        },
        rt: {
            ss: '└',
            hs: '┕',
            sh: '┖',
            hh: '┗',
            ds: '╘',
            sd: '╙',
            dd: '╚' 
        },
        lt: {
            ss: '┘',
            hs: '┙',
            sh: '┚',
            hh: '┛',
            ds: '╛',
            sd: '╜',
            dd: '╝'
        }
    },*/
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

import RandomGenerator from './AbstractRandomGenerator';

type Mash = {
    (data: {
        toString: () => any;
        length: number;
        charCodeAt: (arg0: number) => number;
    }): number;
    version: string;
};

function Alea(seedArray: any[]) {
    function MashFactory(): Mash {
        let n = 0xefc8249d;

        const mash: Mash = function (data: {
            toString: () => any;
            length: number;
            charCodeAt: (arg0: number) => number;
        }) {
            data = data.toString();
            for (let i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                let h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };

        mash.version = 'Mash 0.9';
        return mash;
    }

    return (function (args: string[]) {
        let s0 = 0;
        let s1 = 0;
        let s2 = 0;
        let c = 1;

        if (args.length == 0) {
            args = [Date.now().toString()];
        }
        let mash: Mash | null = MashFactory();
        s0 = mash(' ');
        s1 = mash(' ');
        s2 = mash(' ');

        for (var i = 0; i < args.length; i++) {
            s0 -= mash(args[i]);
            if (s0 < 0) {
                s0 += 1;
            }
            s1 -= mash(args[i]);
            if (s1 < 0) {
                s1 += 1;
            }
            s2 -= mash(args[i]);
            if (s2 < 0) {
                s2 += 1;
            }
        }
        mash = null;

        const random = function () {
            const t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
            s0 = s1;
            s1 = s2;
            return (s2 = t - (c = t | 0));
        };
        random.uint32 = function () {
            return random() * 0x100000000; // 2^32
        };
        random.fract53 = function () {
            return (
                random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16
            ); // 2^-53
        };
        random.version = 'Alea 0.9';
        random.args = args;
        return random;
    })(seedArray);
}

/**
 * Alea PRNG, which is not cryptographically strong
 * see http://baagoe.org/en/wiki/Better_random_numbers_for_javascript
 * for a full discussion and Alea implementation.
 */
export default class AleaRandomGenerator extends RandomGenerator {
    private readonly alea: () => number;
    /**
     *
     * @param seeds an array whose items will be `toString`ed and used as the seed to the Alea algorithm
     */
    constructor({ seeds = [] }: { seeds?: any[] } = {}) {
        super();
        if (!seeds) {
            throw new Error('No seeds were provided for Alea PRNG');
        }
        this.alea = Alea(seeds);
    }

    fraction(): number {
        return this.alea();
    }
}

// client sources
const height =
    (typeof window !== 'undefined' && window.innerHeight) ||
    (typeof document !== 'undefined' &&
        document.documentElement &&
        document.documentElement.clientHeight) ||
    (typeof document !== 'undefined' &&
        document.body &&
        document.body.clientHeight) ||
    1;

const width =
    (typeof window !== 'undefined' && window.innerWidth) ||
    (typeof document !== 'undefined' &&
        document.documentElement &&
        document.documentElement.clientWidth) ||
    (typeof document !== 'undefined' &&
        document.body &&
        document.body.clientWidth) ||
    1;

const agent = (typeof navigator !== 'undefined' && navigator.userAgent) || '';

/**
 * instantiate RNG.  Heuristically collect entropy from various sources when a
 * cryptographic PRNG isn't available.
 */
export function createAleaGenerator() {
    return new AleaRandomGenerator({
        seeds: [new Date(), height, width, agent, Math.random()],
    });
}

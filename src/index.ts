// We use cryptographically strong PRNGs (crypto.getRandomBytes() on the server,
// window.crypto.getRandomValues() in the browser) when available. If these
// PRNGs fail, we fall back to the Alea PRNG, which is not cryptographically
// strong, and we seed it with various sources such as the date, Math.random,
// and window size on the client.  When using crypto.getRandomValues(), our
// primitive is hexString(), from which we construct fraction(). When using
// window.crypto.getRandomValues() or alea, the primitive is fraction and we use
// that to construct hex string.

import * as nodeCrypto from 'crypto';

import BrowserRandomGenerator from './BrowserRandomGenerator';
import AleaRandomGenerator, {
    createAleaGenerator,
} from './AleaRandomGenerator';
import AbstractRandomGenerator from './AbstractRandomGenerator';
import NodeRandomGenerator from './NodeRandomGenerator';

function createRandom(
    generator: AbstractRandomGenerator,
): AbstractRandomGenerator {
    generator.createWithSeeds = (
        ...seeds: any | string
    ): AbstractRandomGenerator => {
        if (seeds.length === 0) {
            throw new Error('No seeds were provided');
        }
        return new AleaRandomGenerator({ seeds });
    };
    generator.insecure = createAleaGenerator();
    return generator;
}

let generator;
if (nodeCrypto) {
    generator = new NodeRandomGenerator();
} else if (window?.crypto?.getRandomValues !== undefined) {
    generator = new BrowserRandomGenerator();
} else {
    // On IE 10 and below, there's no browser crypto API
    // available. Fall back to Alea
    //
    // XXX looks like at the moment, we use Alea in IE 11 as well,
    // which has `window.msCrypto` instead of `window.crypto`.
    generator = createAleaGenerator();
}

const Random = createRandom(generator);
export = Random;

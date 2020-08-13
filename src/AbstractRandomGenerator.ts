const UNMISTAKABLE_CHARS =
    '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';
const BASE64_CHARS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789-_';

export default abstract class AbstractRandomGenerator {
    /**
     * @summary Used like `Random`, but much faster and not cryptographically secure
     */
    insecure: AbstractRandomGenerator | undefined;
    /**
     * @summary Create a non-cryptographically secure PRNG with a given seed (using
     * the Alea algorithm)
     */
    createWithSeeds:
        | ((...seeds: any | string) => AbstractRandomGenerator)
        | undefined;
    /**
     * @summary Return a number between 0 and 1, like `Math.random`.
     */
    abstract fraction(): number;

    /**
     * @summary Return a random string of `n` hexadecimal digits.
     * @param digits Length of the string
     */
    hexString(digits: number): string {
        return this.randomString(digits, '0123456789abcdef');
    }

    private randomString(charsCount: number, alphabet: string) {
        let result = '';
        for (let i = 0; i < charsCount; i++) {
            result += this.choice(alphabet);
        }
        return result;
    }

    /**
     * @summary Return a unique identifier, such as `"Jjwjg6gouWLXhMGKW"`, that is
     * likely to be unique in the whole world.
     * @param charsCount Optional length of the identifier in characters
     *   (defaults to 17)
     */
    id(charsCount: number = 1): string {
        return this.randomString(charsCount, UNMISTAKABLE_CHARS);
    }

    /**
     * @summary Return a random string of printable characters with 6 bits of
     * entropy per character. Use `Random.secret` for security-critical secrets
     * that are intended for machine, rather than human, consumption.
     * @param charsCount Optional length of the secret string (defaults to 43
     *   characters, or 256 bits of entropy)
     */
    secret(charsCount: number = 43): string {
        return this.randomString(charsCount, BASE64_CHARS);
    }

    /**
     * @summary Return a random element of the given array or string.
     * @param arrayOrString  arrayOrString Array or string to choose from
     */
    choice(arrayOrString: string | any[]) {
        const index = Math.floor(this.fraction() * arrayOrString.length);
        if (typeof arrayOrString === 'string') {
            return arrayOrString.substr(index, 1);
        }
        return arrayOrString[index];
    }
}

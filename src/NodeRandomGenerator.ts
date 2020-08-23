import crypto from 'crypto';
import AbstractRandomGenerator from './AbstractRandomGenerator';

/**
 *  cryptographically strong PRNGs available in node
 */
export default class NodeRandomGenerator extends AbstractRandomGenerator {
    fraction() {
        const numerator = Number.parseInt(this.hexString(8), 16);
        return numerator * 2.3283064365386963e-10; // 2^-32;
    }

    hexString(digits: number): string {
        const numBytes = Math.ceil(digits / 2);
        let bytes;
        // Try to get cryptographically strong randomness. Fall back to
        // non-cryptographically strong if not available.
        try {
            bytes = crypto.randomBytes(numBytes);
        } catch (e) {
            // XXX should re-throw any error except insufficient entropy
            bytes = crypto.pseudoRandomBytes(numBytes);
        }
        const result = bytes.toString('hex');
        // If the number of digits is odd, we'll have generated an extra 4 bits
        // of randomness, so we need to trim the last digit.
        return result.substring(0, digits);
    }
}

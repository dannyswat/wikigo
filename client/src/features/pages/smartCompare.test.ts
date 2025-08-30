import { describe, it, expect } from 'vitest';
import { smartCompare } from './smartCompare';

describe('smartCompare', () => {
    describe('Date comparison', () => {
        it('should compare valid dates correctly', () => {
            expect(smartCompare('2023-01-01', '2023-01-02')).toBeLessThan(0);
            expect(smartCompare('2023-01-02', '2023-01-01')).toBeGreaterThan(0);
            expect(smartCompare('2023-01-01', '2023-01-01')).toBe(0);
        });

        it('should handle different date formats', () => {
            expect(smartCompare('2023-12-25', '2024-01-01')).toBeLessThan(0);
            expect(smartCompare('Dec 25, 2023', 'Jan 01, 2024')).toBeLessThan(0);
            expect(smartCompare('12/25/2023', '01/01/2024')).toBeLessThan(0);
        });

        it('should handle ISO date strings', () => {
            expect(smartCompare('2023-01-01T00:00:00Z', '2023-01-01T12:00:00Z')).toBeLessThan(0);
            expect(smartCompare('2023-01-01T12:00:00Z', '2023-01-01T00:00:00Z')).toBeGreaterThan(0);
        });

        it('should handle timestamps', () => {
            expect(smartCompare('1672531200000', '1672617600000')).toBeLessThan(0); // Jan 1 vs Jan 2, 2023
        });
    });

    describe('Version comparison', () => {
        it('should compare semantic versions correctly', () => {
            expect(smartCompare('1.0.0', '1.0.1')).toBeLessThan(0);
            expect(smartCompare('1.0.1', '1.0.0')).toBeGreaterThan(0);
            expect(smartCompare('1.0.0', '1.0.0')).toBe(0);
        });

        it('should handle different version lengths', () => {
            expect(smartCompare('1.0', '1.0.1')).toBeLessThan(0);
            expect(smartCompare('1.0.1', '1.0')).toBeGreaterThan(0);
            expect(smartCompare('1.0', '1.0.0')).toBe(0);
        });

        it('should handle major version differences', () => {
            expect(smartCompare('1.9.9', '2.0.0')).toBeLessThan(0);
            expect(smartCompare('2.0.0', '1.9.9')).toBeGreaterThan(0);
        });

        it('should handle minor version differences', () => {
            expect(smartCompare('1.1.0', '1.2.0')).toBeLessThan(0);
            expect(smartCompare('1.2.0', '1.1.0')).toBeGreaterThan(0);
        });

        it('should handle patch version differences', () => {
            expect(smartCompare('1.0.1', '1.0.2')).toBeLessThan(0);
            expect(smartCompare('1.0.2', '1.0.1')).toBeGreaterThan(0);
        });

        it('should handle multi-digit version numbers', () => {
            expect(smartCompare('1.10.0', '1.9.0')).toBeGreaterThan(0);
            expect(smartCompare('10.0.0', '9.99.99')).toBeGreaterThan(0);
        });

        it('should handle version with more than 3 parts', () => {
            expect(smartCompare('1.0.0.1', '1.0.0.2')).toBeLessThan(0);
            expect(smartCompare('1.0.0.2', '1.0.0.1')).toBeGreaterThan(0);
            expect(smartCompare('1.0.0.1', '1.0.0.1')).toBe(0);
        });
    });

    describe('Text comparison (fallback)', () => {
        it('should compare strings alphabetically (case-insensitive)', () => {
            expect(smartCompare('apple', 'banana')).toBeLessThan(0);
            expect(smartCompare('banana', 'apple')).toBeGreaterThan(0);
            expect(smartCompare('apple', 'apple')).toBe(0);
        });

        it('should handle case differences', () => {
            expect(smartCompare('Apple', 'apple')).toBe(0);
            expect(smartCompare('BANANA', 'banana')).toBe(0);
            expect(smartCompare('Apple', 'Banana')).toBeLessThan(0);
        });

        it('should handle special characters', () => {
            expect(smartCompare('file-1', 'file-2')).toBeLessThan(0);
            expect(smartCompare('file_a', 'file_b')).toBeLessThan(0);
            expect(smartCompare('file.txt', 'file.xml')).toBeLessThan(0);
        });

        it('should handle numeric strings that are not versions', () => {
            expect(smartCompare('123abc', '124abc')).toBeLessThan(0);
            expect(smartCompare('abc123', 'abc124')).toBeLessThan(0);
        });

        it('should handle empty strings', () => {
            expect(smartCompare('', 'a')).toBeLessThan(0);
            expect(smartCompare('a', '')).toBeGreaterThan(0);
            expect(smartCompare('', '')).toBe(0);
        });
    });

    describe('Mixed content and edge cases', () => {
        it('should prioritize date comparison over version comparison', () => {
            // These look like versions but are valid dates
            const result = smartCompare('2023.01.01', '2023.01.02');
            expect(result).toBeLessThan(0);
        });

        it('should fall back to version comparison when dates are invalid', () => {
            // These are not valid dates but are valid versions
            const result = smartCompare('1.0.0', '2.0.0');
            expect(result).toBeLessThan(0);
        });

        it('should fall back to text comparison when neither date nor version works', () => {
            const result = smartCompare('invalid.version.string', 'another.invalid.version');
            expect(result).toBeGreaterThan(0); // 'i' > 'a'
        });

        it('should handle null and undefined gracefully by converting to string', () => {
            expect(smartCompare('null', 'undefined')).toBeLessThan(0);
            expect(smartCompare('true', 'false')).toBeGreaterThan(0);
        });

        it('should handle whitespace', () => {
            expect(smartCompare('  a  ', 'a')).toBeLessThan(0); // spaces matter in string comparison
            expect(smartCompare('a\n', 'a')).toBeGreaterThan(0);
        });

        it('should handle unicode characters', () => {
            expect(smartCompare('café', 'cafe')).toBeGreaterThan(0);
            expect(smartCompare('naïve', 'naive')).toBeGreaterThan(0);
        });
    });

    describe('Real-world scenarios', () => {
        it('should handle file names with versions', () => {
            expect(smartCompare('file_v1.0.0.txt', 'file_v1.0.1.txt')).toBeLessThan(0);
            expect(smartCompare('document_2023-01-01.pdf', 'document_2023-01-02.pdf')).toBeLessThan(0);
        });

        it('should handle software version tags', () => {
            expect(smartCompare('v1.0.0', 'v1.0.1')).toBeLessThan(0);
            expect(smartCompare('release-1.0', 'release-2.0')).toBeLessThan(0);
        });

        it('should handle backup file names with dates', () => {
            expect(smartCompare('backup-2023-01-01.sql', 'backup-2023-01-02.sql')).toBeLessThan(0);
            expect(smartCompare('data_20230101.csv', 'data_20230102.csv')).toBeLessThan(0);
        });

        it('should sort an array correctly', () => {
            const items = [
                'file_v2.0.0',
                'file_v1.0.1',
                'file_v1.0.0',
                'file_v1.0.10',
                'backup-2023-01-02',
                'backup-2023-01-01',
                'readme.txt',
                'changelog.md'
            ];

            const sorted = items.sort(smartCompare);

            // Versions should be sorted numerically
            expect(sorted.indexOf('file_v1.0.0')).toBeLessThan(sorted.indexOf('file_v1.0.1'));
            expect(sorted.indexOf('file_v1.0.1')).toBeLessThan(sorted.indexOf('file_v1.0.10'));
            expect(sorted.indexOf('file_v1.0.10')).toBeLessThan(sorted.indexOf('file_v2.0.0'));

            // Dates should be sorted chronologically
            expect(sorted.indexOf('backup-2023-01-01')).toBeLessThan(sorted.indexOf('backup-2023-01-02'));

            // Text should be sorted alphabetically
            expect(sorted.indexOf('changelog.md')).toBeLessThan(sorted.indexOf('readme.txt'));
        });
    });

    describe('Performance and consistency', () => {
        it('should be consistent with same inputs', () => {
            const a = '1.0.0';
            const b = '2.0.0';

            for (let i = 0; i < 10; i++) {
                expect(smartCompare(a, b)).toBeLessThan(0);
                expect(smartCompare(b, a)).toBeGreaterThan(0);
                expect(smartCompare(a, a)).toBe(0);
            }
        });

        it('should handle large version numbers', () => {
            expect(smartCompare('999.999.999', '1000.0.0')).toBeLessThan(0);
            expect(smartCompare('1.0.999999', '1.1.0')).toBeLessThan(0);
        });

        it('should handle very long strings', () => {
            const longString1 = 'a'.repeat(1000);
            const longString2 = 'b'.repeat(1000);

            expect(smartCompare(longString1, longString2)).toBeLessThan(0);
        });
    });
});
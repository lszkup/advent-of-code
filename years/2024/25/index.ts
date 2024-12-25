import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 25;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/25/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/25/data.txt
// problem url  : https://adventofcode.com/2024/day/25

type Schematic = string[]; // Exactly 7 lines of length 5 each

/**
 * Parse the "pin heights" from a lock schematic.
 * - We assume the lock has the top row '#...' and bottom row '.....'
 * - For each of the 5 columns, count consecutive '#' starting from the top.
 */
function parseLockHeights(lock: Schematic): number[] {
	const heights: number[] = [];
	// We have 5 columns
	for (let col = 0; col < 5; col++) {
		let h = 0;
		// Check downward from row 0
		for (let row = 1; row < 7; row++) {
			if (lock[row][col] === '#') {
				h++;
			} else {
				// Stop as soon as you hit a '.'
				break;
			}
		}
		heights.push(h);
	}
	return heights;
}

/**
 * Parse the "key cut heights" from a key schematic.
 * - We assume the key has the top row '.....' and bottom row '#....'
 * - For each of the 5 columns, count consecutive '#' starting from the bottom.
 */
function parseKeyHeights(key: Schematic): number[] {
	const heights: number[] = [];
	// We have 5 columns
	for (let col = 0; col < 5; col++) {
		let h = 0;
		// Check upward from row 6
		for (let row = 5; row >= 0; row--) {
			if (key[row][col] === '#') {
				h++;
			} else {
				// Stop as soon as you hit a '.'
				break;
			}
		}
		heights.push(h);
	}
	return heights;
}

/**
 * Given a lock's pin heights and a key's cut heights,
 * determine if they fit without overlapping in *any* column.
 *
 * Overlap occurs if lockHeight[col] + keyHeight[col] > 5 in some column.
 * Return true if all columns fit (no overlap).
 */
function canFitTogether(
	lockHeights: number[],
	keyHeights: number[]
): boolean {
	for (let col = 0; col < 5; col++) {
		if (lockHeights[col] + keyHeights[col] > 5) {
			return false;
		}
	}
	return true;
}

/**
 * Example function that takes in an array of 7-line schematics.
 * We assume each schematic is exactly 7 lines of 5 characters,
 * separated by blank lines or some other parsing convention.
 *
 * We'll do:
 *   1. Classify each schematic as lock or key by looking at the top/bottom rows.
 *   2. Parse their heights.
 *   3. Count how many (lock, key) pairs do not overlap in any column.
 */
function countFittingPairs(schematics: Schematic[]): number {
	const lockHeightsList: number[][] = [];
	const keyHeightsList: number[][] = [];

	// Separate locks and keys
	for (const schematic of schematics) {
		// We expect 7 strings of length 5 each.
		const topRow = schematic[0];
		const bottomRow = schematic[6];
		// Heuristic: If the top is '#' and bottom is '.', it's a lock
		//            If the top is '.' and bottom is '#', it's a key
		if (topRow.includes('#') && !bottomRow.includes('#')) {
			lockHeightsList.push(parseLockHeights(schematic));
		} else {
			keyHeightsList.push(parseKeyHeights(schematic));
		}
	}

	// Now match each lock with each key
	let count = 0;
	for (const lockHeights of lockHeightsList) {
		for (const keyHeights of keyHeightsList) {
			if (canFitTogether(lockHeights, keyHeights)) {
				count++;
			}
		}
	}

	return count;
}

async function p2024day25_part1(input: string, ...params: any[]) {
	const allSchematics: Schematic[] = [];
	const lines = input.split('\n').map(s => s.trim()).filter(s => s.length > 0);
	for (let i = 0; i < lines.length; i += 7) {
		const schematic: Schematic = [];
		for (let j = 0; j < 7; j++) {
			schematic.push(lines[i + j]);
		}
		allSchematics.push(schematic);
	}
	const result = countFittingPairs(allSchematics);
	return result;
}

async function p2024day25_part2(input: string, ...params: any[]) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `#####
.####
.####
.####
.#.#.
.#...
.....

#####
##.##
.#.##
...##
...#.
...#.
.....

.....
#....
#....
#...#
#.#.#
#.###
#####

.....
.....
#.#..
###..
###.#
###.#
#####

.....
.....
.....
#....
#.#..
#.#.#
#####`,
		expected: '3'
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day25_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day25_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day25_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day25_part2(input));
	const part2After = performance.now();

	logSolution(25, 2024, part1Solution, part2Solution);

	log(chalk.gray("--- Performance ---"));
	log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	log(chalk.gray(`Part 2: ${util.formatTime(part2After - part2Before)}`));
	log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});

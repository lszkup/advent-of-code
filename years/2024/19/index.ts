import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 19;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/19/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/19/data.txt
// problem url  : https://adventofcode.com/2024/day/19

function canFormDesign(design: string, patterns: string[]): boolean {
	const patternSet = new Set(patterns);
	const dp = new Array<boolean>(design.length + 1).fill(false);
	const dp2 = new Array<number>(design.length + 1).fill(0);
	dp[0] = true; // base case: empty string can always be formed

	for (let i = 0; i < design.length; i++) {
		if (!dp[i]) continue;

		// Try all patterns
		for (const pattern of patternSet) {
			if (design.startsWith(pattern, i)) {
				dp[i + pattern.length] = true;
				dp2[i + pattern.length]++;
			}
		}
	}

	return dp[design.length];
}

function canFormDesign2(design: string, patterns: string[]): number {
	const patternSet = new Set(patterns);
	const dp = new Array<boolean>(design.length + 1).fill(false);
	const dp2 = new Array<number>(design.length + 1).fill(0);
	dp[0] = true; // base case: empty string can always be formed
	dp2[0] = 1;

	for (let i = 0; i < design.length; i++) {
		if (!dp[i]) continue;

		// Try all patterns
		for (const pattern of patternSet) {
			if (design.startsWith(pattern, i)) {
				dp2[i + pattern.length] += dp2[i];
				dp[i + pattern.length] = true;
			}
		}
	}

	return dp2[design.length];
}

async function p2024day19_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").filter(x => x.length > 0);
	const patterns = lines[0].split(", ");
	const designs = lines.slice(1);

	let possibleCount = 0;
	for (const design of designs) {
		if (canFormDesign(design, patterns)) {
			possibleCount++;
		}
	}

	return possibleCount;
}

async function p2024day19_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").filter(x => x.length > 0);
	const patterns = lines[0].split(", ");
	const designs = lines.slice(1);

	let possibleCount = 0;
	for (const design of designs) {
		possibleCount += canFormDesign2(design, patterns);
	}

	return possibleCount;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb`,
		expected: `6`,
	}];
	const part2tests: TestCase[] = [{
		input: `r, wr, b, g, bwu, rb, gb, br

brwrr
bggr
gbbr
rrbgbr
ubwu
bwurrg
brgr
bbrgwb`,
		expected: `16`,
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day19_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day19_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day19_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day19_part2(input));
	const part2After = performance.now();

	logSolution(19, 2024, part1Solution, part2Solution);

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

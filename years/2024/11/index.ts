import _, { forEach } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 11;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/11/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/11/data.txt
// problem url  : https://adventofcode.com/2024/day/11

async function p2024day11_part1(input: string, ...params: any[]) {
	let stones: number[] = input.split(" ").map(x => parseInt(x));
	const numberOfStones = stones.reduce((acc, stone) => {
		const stoneNunber = analyzyeStone(stone, 0);
		return acc + stoneNunber;
	}, 0);
	return numberOfStones;
}

function analyzyeStone(stone: number, iteration: number): number {
	if (iteration >= 25) return 1;
	if (stone == 0) {
		return analyzyeStone(1, iteration + 1);
	} else if (stone.toString().length % 2 == 0) {
		const stone1 = parseInt(stone.toString().substring(0, stone.toString().length / 2));
		const stone2 = parseInt(stone.toString().substring(stone.toString().length / 2))
		return analyzyeStone(stone1, iteration + 1) + analyzyeStone(stone2, iteration + 1);
	} else {
		return analyzyeStone(stone * 2024, iteration + 1);
	}
}

async function p2024day11_part2(input: string, ...params: any[]) {
	const cachedResults: Map<string, number> = new Map();
	let stones: number[] = input.split(" ").map(x => parseInt(x));
	const numberOfStones = stones.reduce((acc, stone) => {
		const stoneNunber = analyzyeStone2(stone, 0, cachedResults);
		return acc + stoneNunber;
	}, 0);
	return numberOfStones;
}

function analyzyeStone2(stone: number, iteration: number, cachedResults: Map<string, number>): number {
	if (iteration >= 75) return 1;
	const cacheKey = `${stone},${iteration}`;
	if (cachedResults.has(cacheKey)) {
		return cachedResults.get(cacheKey)!;
	}
	if (stone == 0) {
		const result = analyzyeStone2(1, iteration + 1, cachedResults);
		cachedResults.set(cacheKey, result);
		return result;
	} else if (stone.toString().length % 2 == 0) {
		const stone1 = parseInt(stone.toString().substring(0, stone.toString().length / 2));
		const stone2 = parseInt(stone.toString().substring(stone.toString().length / 2))
		const result = analyzyeStone2(stone1, iteration + 1, cachedResults) + analyzyeStone2(stone2, iteration + 1, cachedResults);
		cachedResults.set(cacheKey, result);
		return result;
	} else {
		const result = analyzyeStone2(stone * 2024, iteration + 1, cachedResults);
		cachedResults.set(cacheKey, result);
		return result;
	}
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `125 17`, expected: `55312`
	}, {
		input: `3 386358 86195 85 1267 3752457 0 741`, expected: `183248`
	}];
	const part2tests: TestCase[] = [{
		input: `125 17`, expected: `65601038650482`
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day11_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day11_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day11_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day11_part2(input));
	const part2After = performance.now();

	logSolution(11, 2024, part1Solution, part2Solution);

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

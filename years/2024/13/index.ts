import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 13;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/13/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/13/data.txt
// problem url  : https://adventofcode.com/2024/day/13

const regexForNumber = /(\d+)/g;

interface BestValue {
	cost: number;
	x: number;
	y: number;
}

async function p2024day13_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(x => x.trim()).filter(x => x);
	let costOfWinningThePrize = 0;
	for (let i = 0; i < lines.length / 3; i++) {
		const [buttonAX, buttonAY] = lines[i * 3].match(regexForNumber)!.map(Number);
		const [buttonBX, buttonBY] = lines[i * 3 + 1].match(regexForNumber)!.map(Number);
		const [prizeX, prizeY] = lines[i * 3 + 2].match(regexForNumber)!.map(Number);

		const cost = findMinCost(buttonAX, buttonAY, buttonBX, buttonBY, prizeX, prizeY);

		costOfWinningThePrize += cost ?? 0;
	}
	return costOfWinningThePrize;
}

async function p2024day13_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(x => x.trim()).filter(x => x);
	let costOfWinningThePrize = 0;
	for (let i = 0; i < lines.length / 3; i++) {
		const [buttonAX, buttonAY] = lines[i * 3].match(regexForNumber)!.map(Number);
		const [buttonBX, buttonBY] = lines[i * 3 + 1].match(regexForNumber)!.map(Number);
		const [prizeX, prizeY] = lines[i * 3 + 2].match(regexForNumber)!.map(Number).map(x => x + 10000000000000);

		const cost = findMinCost(buttonAX, buttonAY, buttonBX, buttonBY, prizeX, prizeY);

		costOfWinningThePrize += cost ?? 0;
	}
	return costOfWinningThePrize;
}

function findMinCost(buttonAX: number, buttonAY: number, buttonBX: number, buttonBY: number, prizeX: number, prizeY: number): number {
	if (buttonBY * buttonAX - buttonAY * buttonBX == 0) {
		const A = prizeX / buttonAX;
		const B = prizeX / buttonBX;
		return Math.min(A * 3, B);
	} else {
		const B = (buttonAX * prizeY - buttonAY * prizeX) / (buttonBY * buttonAX - buttonAY * buttonBX);
		if (B == Math.floor(B)) {
			const A = (prizeX - buttonBX * B) / buttonAX;
			return A * 3 + B;
		}
	}
	return 0;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `Button A: X+94, Y+34
				Button B: X+22, Y+67
				Prize: X=8400, Y=5400

				Button A: X+26, Y+66
				Button B: X+67, Y+21
				Prize: X=12748, Y=12176

				Button A: X+17, Y+86
				Button B: X+84, Y+37
				Prize: X=7870, Y=6450

				Button A: X+69, Y+23
				Button B: X+27, Y+71
				Prize: X=18641, Y=10279`,
		expected: `480`
	}];
	const part2tests: TestCase[] = [{
		input: `Button A: X+1, Y+1
				Button B: X+2, Y+2
				Prize: X=10, Y=10`,
		expected: `5000000000005`
	},
	{
		input: `Button A: X+2, Y+2
				Button B: X+1, Y+1
				Prize: X=10, Y=10`,
		expected: `10000000000010`
	}, {
		input: `Button A: X+94, Y+34
				Button B: X+22, Y+67
				Prize: X=8400, Y=5400

				Button A: X+26, Y+66
				Button B: X+67, Y+21
				Prize: X=12748, Y=12176

				Button A: X+17, Y+86
				Button B: X+84, Y+37
				Prize: X=7870, Y=6450

				Button A: X+69, Y+23
				Button B: X+27, Y+71
				Prize: X=18641, Y=10279`,
		expected: `875318608908`
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day13_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day13_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day13_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day13_part2(input));
	const part2After = performance.now();

	logSolution(13, 2024, part1Solution, part2Solution);

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

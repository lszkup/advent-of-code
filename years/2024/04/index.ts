import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 4;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/04/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/04/data.txt
// problem url  : https://adventofcode.com/2024/day/4

async function p2024day4_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => line.trim());
	const columns = [...lines[0]].map((_, index) => lines.map(line => line[index]).join(""));
	const diagonalsDownRight1 = [...lines[0]].map((_, index) => {
		const diagonal = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line[index + i]) diagonal.push(line[index + i]);
		}
		return diagonal.join("");
	});
	const diagonalsDownRight2 = [...columns[0]].map((_, index) => {
		if (index == 0) return "";
		const diagonal = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i + index];
			if (line && line[i]) diagonal.push(line[i]);
		}
		return diagonal.join("");
	});
	const diagonalsDownLeft1 = [...lines[0]].map((_, index) => {
		const diagonal = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line[index - i]) diagonal.push(line[index - i]);
		}
		return diagonal.join("");
	});
	const diagonalsDownLeft2 = [...columns[0]].map((_, index) => {
		if (index == 0) return "";
		const diagonal = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i + index];
			if (line && line[columns[0].length - i - 1]) diagonal.push(line[columns[0].length - i - 1]);
		}
		return diagonal.join("");
	});
	const allLines = [...lines, ...columns, ...diagonalsDownRight1, ...diagonalsDownRight2, ...diagonalsDownLeft1, ...diagonalsDownLeft2];
	const numberOfTimesXmasAppears = allLines.reduce((acc, line) => {
		return acc + (line.match(/XMAS/g) || []).length + (line.split("").reverse().join("").match(/XMAS/g) || []).length;
	}, 0);
	return numberOfTimesXmasAppears;
}

async function p2024day4_part2(input: string, ...params: any[]) {
	var counter = 0;
	const lines = input.split("\n").map(line => line.trim());
	for (let row = 0; row < lines.length; row++) {
		for (let column = 0; column < lines[row].length; column++) {
			if (lines[row][column] == "A") {
				var diagonal1 = false;
				var diagonal2 = false;

				if (lines[row - 1] && lines[row - 1][column - 1] == "M" &&
					lines[row + 1] && lines[row + 1][column + 1] == "S") {
					diagonal1 = true;
				}
				if (lines[row - 1] && lines[row - 1][column - 1] == "S" &&
					lines[row + 1] && lines[row + 1][column + 1] == "M") {
					diagonal1 = true;
				}
				if (lines[row - 1] && lines[row - 1][column + 1] == "M" &&
					lines[row + 1] && lines[row + 1][column - 1] == "S") {
					diagonal2 = true;
				}
				if (lines[row - 1] && lines[row - 1][column + 1] == "S" &&
					lines[row + 1] && lines[row + 1][column - 1] == "M") {
					diagonal2 = true;
				}
				if (diagonal1 && diagonal2) {
					counter++;
				}
			}
		}
	}
	return counter;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `MMMSXXMASM
				MSAMXMSMSA
				AMXSXMAAMM
				MSAMASMSMX
				XMASAMXAMM
				XXAMMXXAMA
				SMSMSASXSS
				SAXAMASAAA
				MAMMMXMMMM
				MXMXAXMASX`,
		expected: `18`
	}];
	const part2tests: TestCase[] = [
		{
			input: `MMMSXXMASM
					MSAMXMSMSA
					AMXSXMAAMM
					MSAMASMSMX
					XMASAMXAMM
					XXAMMXXAMA
					SMSMSASXSS
					SAXAMASAAA
					MAMMMXMMMM
					MXMXAXMASX`,
			expected: `9`
		}
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day4_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day4_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day4_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day4_part2(input));
	const part2After = performance.now();

	logSolution(4, 2024, part1Solution, part2Solution);

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

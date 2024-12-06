import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 6;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/06/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/06/data.txt
// problem url  : https://adventofcode.com/2024/day/6

async function p2024day6_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => [...line.trim()]);
	var startingPositionX = 0;
	var startingPositionY = 0;
	for (let row = 0; row < lines.length; row++) {
		for (let column = 0; column < lines[row].length; column++) {
			if (lines[row][column] === "^") {
				startingPositionX = column;
				startingPositionY = row;
				break;
			}
		}
	}
	return getNumberOfVisitedCells(lines, startingPositionX, startingPositionY, lines.length * lines[0].length * 1000);
}

function getNumberOfVisitedCells(lines: string[][], startingPositionX: number, startingPositionY: number, maxNumberOfSteps: number) {
	var direction = "up";
	var numberOfVisitedCells = 0;
	var numberOfSteps = 0;
	var spinningInPlace = 0;
	while (startingPositionX >= 0 && startingPositionX < lines[0].length && startingPositionY >= 0 && startingPositionY < lines.length) {
		if (numberOfSteps >= maxNumberOfSteps || spinningInPlace >= 4) {
			numberOfSteps = -1;
			break;
		}

		numberOfSteps++;
		if (lines[startingPositionY][startingPositionX] !== "X") {
			lines[startingPositionY][startingPositionX] = "X";
			numberOfVisitedCells++;
		}

		if (direction === "up") {
			if (lines[startingPositionY - 1] && lines[startingPositionY - 1][startingPositionX] === "#") {
				direction = "right";
				spinningInPlace++;
			} else {
				startingPositionY--;
				spinningInPlace = 0;
			}
		} else if (direction === "right") {
			if (lines[startingPositionY] && lines[startingPositionY][startingPositionX + 1] === "#") {
				direction = "down";
				spinningInPlace++;
			} else {
				startingPositionX++;
				spinningInPlace = 0;
			}
		} else if (direction === "down") {
			if (lines[startingPositionY + 1] && lines[startingPositionY + 1][startingPositionX] === "#") {
				direction = "left";
				spinningInPlace++;
			} else {
				startingPositionY++;
				spinningInPlace = 0;
			}
		} else if (direction === "left") {
			if (lines[startingPositionY] && lines[startingPositionY][startingPositionX - 1] === "#") {
				direction = "up";
				spinningInPlace++;
			} else {
				startingPositionX--;
				spinningInPlace = 0;
			}
		}
	}
	return numberOfVisitedCells;
}

function getNumberOfSteps(lines: string[][], startingPositionX: number, startingPositionY: number, maxNumberOfSteps: number) {
	var direction = "up";
	var numberOfVisitedCells = 0;
	var numberOfSteps = 0;
	var spinningInPlace = 0;
	while (startingPositionX >= 0 && startingPositionX < lines[0].length && startingPositionY >= 0 && startingPositionY < lines.length) {
		if (numberOfSteps >= maxNumberOfSteps || spinningInPlace >= 4) {
			numberOfSteps = -1;
			break;
		}

		numberOfSteps++;
		if (lines[startingPositionY][startingPositionX] !== "X") {
			lines[startingPositionY][startingPositionX] = "X";
			numberOfVisitedCells++;
		}

		if (direction === "up") {
			if (lines[startingPositionY - 1] && lines[startingPositionY - 1][startingPositionX] === "#") {
				direction = "right";
				spinningInPlace++;
			} else {
				startingPositionY--;
				spinningInPlace = 0;
			}
		} else if (direction === "right") {
			if (lines[startingPositionY] && lines[startingPositionY][startingPositionX + 1] === "#") {
				direction = "down";
				spinningInPlace++;
			} else {
				startingPositionX++;
				spinningInPlace = 0;
			}
		} else if (direction === "down") {
			if (lines[startingPositionY + 1] && lines[startingPositionY + 1][startingPositionX] === "#") {
				direction = "left";
				spinningInPlace++;
			} else {
				startingPositionY++;
				spinningInPlace = 0;
			}
		} else if (direction === "left") {
			if (lines[startingPositionY] && lines[startingPositionY][startingPositionX - 1] === "#") {
				direction = "up";
				spinningInPlace++;
			} else {
				startingPositionX--;
				spinningInPlace = 0;
			}
		}
	}
	return numberOfSteps;
}

async function p2024day6_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => [...line.trim()]);
	var startingPositionX = 0;
	var startingPositionY = 0;
	for (let row = 0; row < lines.length; row++) {
		for (let column = 0; column < lines[row].length; column++) {
			if (lines[row][column] === "^") {
				startingPositionX = column;
				startingPositionY = row;
				break;
			}
		}
	}
	const minNumberOfSteps = getNumberOfSteps(lines, startingPositionX, startingPositionY, lines.length * lines[0].length * 1000);
	var obstaclesCounter = 0;
	for (let row = 0; row < lines.length; row++) {
		for (let column = 0; column < lines[row].length; column++) {
			if (column === startingPositionX && row === startingPositionY - 1) {
				continue;
			}
			const internalLines = input.split("\n").map(line => [...line.trim()]);
			if (internalLines[row][column] !== "^" && internalLines[row][column] !== "#") {
				internalLines[row][column] = "#";
				const stepsCount = getNumberOfSteps(internalLines, startingPositionX, startingPositionY, minNumberOfSteps * 3);
				if (stepsCount === -1) {
					obstaclesCounter++;
				}
			}
		}
	}
	return obstaclesCounter;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `....#.....
					.........#
					..........
					..#.......
					.......#..
					..........
					.#..^.....
					........#.
					#.........
					......#...`,
			expected: "41",
		}
	];
	const part2tests: TestCase[] = [
		{
			input: `....#.....
					.........#
					..........
					..#.......
					.......#..
					..........
					.#..^.....
					........#.
					#.........
					......#...`,
			expected: "6",
		}
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day6_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day6_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day6_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day6_part2(input));
	const part2After = performance.now();

	logSolution(6, 2024, part1Solution, part2Solution);

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

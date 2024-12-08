import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 8;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/08/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/08/data.txt
// problem url  : https://adventofcode.com/2024/day/8

interface AntennaPosition {
	row: number;
	column: number;
}

async function p2024day8_part1(input: string, ...params: any[]) {
	const map: Map<string, Array<AntennaPosition>> = new Map<string, Array<AntennaPosition>>();
	const lines = input.split("\n").map(line => [...line.trim()]);
	const antinodes = lines.map(line => line.map((_) => false));
	let totalNumberOfAntinodes = 0;
	for (let row = 0; row < lines.length; row++) {
		for (let column = 0; column < lines[row].length; column++) {
			const frequency = lines[row][column];
			if (frequency !== ".") {
				const positions = map.get(lines[row][column]) || [];
				map.set(frequency, [...positions, { row, column }]);
			}
		}
	}
	for (const [frequency, positions] of map) {
		if (positions.length > 1) {
			for (let i = 0; i < positions.length - 1; i++) {
				const position1 = positions[i];
				for (let j = i + 1; j < positions.length; j++) {
					const position2 = positions[j];
					const rowDiff = position1.row - position2.row;
					const columnDiff = position1.column - position2.column;
					const antinodePosition1 = { row: position1.row + rowDiff, column: position1.column + columnDiff };
					const antinodePosition2 = { row: position2.row - rowDiff, column: position2.column - columnDiff };
					if (antinodePosition1.row >= 0 && antinodePosition1.row < lines.length && antinodePosition1.column >= 0 && antinodePosition1.column < lines[0].length) {
						if (antinodes[antinodePosition1.row][antinodePosition1.column] === false) {
							antinodes[antinodePosition1.row][antinodePosition1.column] = true;
							totalNumberOfAntinodes++;
						}
					}
					if (antinodePosition2.row >= 0 && antinodePosition2.row < lines.length && antinodePosition2.column >= 0 && antinodePosition2.column < lines[0].length) {
						if (antinodes[antinodePosition2.row][antinodePosition2.column] === false) {
							antinodes[antinodePosition2.row][antinodePosition2.column] = true;
							totalNumberOfAntinodes++;
						}
					}
				}
			}
		}
	}
	return totalNumberOfAntinodes;
}

async function p2024day8_part2(input: string, ...params: any[]) {
	const map: Map<string, Array<AntennaPosition>> = new Map<string, Array<AntennaPosition>>();
	const lines = input.split("\n").map(line => [...line.trim()]);
	const antinodes = lines.map(line => line.map((_) => false));
	let totalNumberOfAntinodes = 0;
	for (let row = 0; row < lines.length; row++) {
		for (let column = 0; column < lines[row].length; column++) {
			const frequency = lines[row][column];
			if (frequency !== ".") {
				const positions = map.get(lines[row][column]) || [];
				map.set(frequency, [...positions, { row, column }]);
			}
		}
	}
	for (const [frequency, positions] of map) {
		if (positions.length > 1) {
			for (let i = 0; i < positions.length - 1; i++) {
				const position1 = positions[i];
				for (let j = i + 1; j < positions.length; j++) {
					const position2 = positions[j];
					const rowDiff = position1.row - position2.row;
					const columnDiff = position1.column - position2.column;
					let antinodePosition1 = { row: position1.row, column: position1.column };
					while (antinodePosition1.row >= 0 && antinodePosition1.row < lines.length && antinodePosition1.column >= 0 && antinodePosition1.column < lines[0].length) {
						if (antinodes[antinodePosition1.row][antinodePosition1.column] === false) {
							antinodes[antinodePosition1.row][antinodePosition1.column] = true;
							totalNumberOfAntinodes++;
						}
						antinodePosition1 = { row: antinodePosition1.row + rowDiff, column: antinodePosition1.column + columnDiff };
					}
					let antinodePosition2 = { row: position2.row, column: position2.column };
					while (antinodePosition2.row >= 0 && antinodePosition2.row < lines.length && antinodePosition2.column >= 0 && antinodePosition2.column < lines[0].length) {
						if (antinodes[antinodePosition2.row][antinodePosition2.column] === false) {
							antinodes[antinodePosition2.row][antinodePosition2.column] = true;
							totalNumberOfAntinodes++;
						}
						antinodePosition2 = { row: antinodePosition2.row - rowDiff, column: antinodePosition2.column - columnDiff };
					}
				}
			}
		}
	}
	return totalNumberOfAntinodes;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `............
					........0...
					.....0......
					.......0....
					....0.......
					......A.....
					............
					............
					........A...
					.........A..
					............
					............`,
			expected: "14",
		}
	];
	const part2tests: TestCase[] = [
		{
			input: `............
					........0...
					.....0......
					.......0....
					....0.......
					......A.....
					............
					............
					........A...
					.........A..
					............
					............`,
			expected: "34",
		}
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day8_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day8_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day8_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day8_part2(input));
	const part2After = performance.now();

	logSolution(8, 2024, part1Solution, part2Solution);

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

import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 10;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/10/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/10/data.txt
// problem url  : https://adventofcode.com/2024/day/10

interface Point {
	row: number;
	column: number;
}

interface Cell {
	uniqueNines: String[];
	numberOfIncomingNines: number;
}

function pointToString(point: Point) {
	return `${point.row},${point.column}`;
}

async function p2024day10_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => [...line.trim()]);

	let allStartingPoints = lines.reduce((acc, line, row) => {
		return [...acc, ...line.map<Point>((char, column) => char === "9" ? { row, column } : { row: -1, column: -1 }).filter(point => point.row !== -1)];
	}, [] as Point[]);

	let cells = lines.map((line, row) => {
		let x = line.map<Cell>((char, column) => {
			let cell = char === "9" ?
				{ uniqueNines: [pointToString({ row, column })], numberOfIncomingNines: 1 } :
				{ uniqueNines: [], numberOfIncomingNines: 0 }
			return cell;
		});
		return x;
	});

	var rounds = 0;
	while (allStartingPoints.length > 0) {
		rounds++;

		const newStartingPoints: Point[] = [];
		allStartingPoints.forEach(point => {
			const height = parseInt(lines[point.row][point.column]);
			const currentUniqueNines = cells[point.row][point.column].uniqueNines;
			if (point.row - 1 >= 0) {
				const topCellHeight = parseInt(lines[point.row - 1][point.column])
				if (topCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row - 1, column: point.column });
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row - 1][point.column].uniqueNines, (uniqueNine));
					});
				}
			}
			if (point.row + 1 < lines.length) {
				const bottomCellHeight = parseInt(lines[point.row + 1][point.column])
				if (bottomCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row + 1, column: point.column });
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row + 1][point.column].uniqueNines, (uniqueNine));
					});
				}
			}
			if (point.column - 1 >= 0) {
				const leftCellHeight = parseInt(lines[point.row][point.column - 1])
				if (leftCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row, column: point.column - 1 });
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row][point.column - 1].uniqueNines, (uniqueNine));
					});
				}
			}
			if (point.column + 1 < lines[0].length) {
				const rightCellHeight = parseInt(lines[point.row][point.column + 1])
				if (rightCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row, column: point.column + 1 });
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row][point.column + 1].uniqueNines, (uniqueNine));
					});
				}
			}
		});
		allStartingPoints = newStartingPoints;
	}
	let numberOfTrials = lines.reduce((acc, line, row) => {
		return acc + line.reduce((acc, char, column) => {
			if (char === "0") {
				return acc + cells[row][column].uniqueNines.length;
			}
			return acc;
		}, 0);
	}, 0);
	return numberOfTrials;
}

async function p2024day10_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => [...line.trim()]);

	let allStartingPoints = lines.reduce((acc, line, row) => {
		return [...acc, ...line.map<Point>((char, column) => char === "9" ? { row, column } : { row: -1, column: -1 }).filter(point => point.row !== -1)];
	}, [] as Point[]);

	let cells = lines.map((line, row) => {
		let x = line.map<Cell>((char, column) => {
			let cell = char === "9" ?
				{ uniqueNines: [pointToString({ row, column })], numberOfIncomingNines: 1 } :
				{ uniqueNines: [], numberOfIncomingNines: 0 }
			return cell;
		});
		return x;
	});

	var rounds = 0;
	while (allStartingPoints.length > 0) {
		rounds++;

		const newStartingPoints: Point[] = [];
		allStartingPoints.forEach(point => {
			const height = parseInt(lines[point.row][point.column]);
			const currentUniqueNines = cells[point.row][point.column].uniqueNines;
			if (point.row - 1 >= 0) {
				const topCellHeight = parseInt(lines[point.row - 1][point.column])
				if (topCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row - 1, column: point.column });
					cells[point.row - 1][point.column].numberOfIncomingNines++;
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row - 1][point.column].uniqueNines, (uniqueNine));
					});
				}
			}
			if (point.row + 1 < lines.length) {
				const bottomCellHeight = parseInt(lines[point.row + 1][point.column])
				if (bottomCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row + 1, column: point.column });
					cells[point.row + 1][point.column].numberOfIncomingNines++;
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row + 1][point.column].uniqueNines, (uniqueNine));
					});
				}
			}
			if (point.column - 1 >= 0) {
				const leftCellHeight = parseInt(lines[point.row][point.column - 1])
				if (leftCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row, column: point.column - 1 });
					cells[point.row][point.column - 1].numberOfIncomingNines++;
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row][point.column - 1].uniqueNines, (uniqueNine));
					});
				}
			}
			if (point.column + 1 < lines[0].length) {
				const rightCellHeight = parseInt(lines[point.row][point.column + 1])
				if (rightCellHeight == height - 1) {
					newStartingPoints.push({ row: point.row, column: point.column + 1 });
					cells[point.row][point.column + 1].numberOfIncomingNines++;
					currentUniqueNines.forEach(uniqueNine => {
						addIfNew(cells[point.row][point.column + 1].uniqueNines, (uniqueNine));
					});
				}
			}
		});
		allStartingPoints = newStartingPoints;
	}
	let numberOfTrials = lines.reduce((acc, line, row) => {
		return acc + line.reduce((acc, char, column) => {
			if (char === "0") {
				return acc + cells[row][column].numberOfIncomingNines;
			}
			return acc;
		}, 0);
	}, 0);
	return numberOfTrials;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `0123
				1234
				8765
				9876`,
		expected: `1`,
	},
	{
		input: `89010123
				78121874
				87430965
				96549874
				45678903
				32019012
				01329801
				10456732`,
		expected: `36`,
	}
	];
	const part2tests: TestCase[] = [{
		input: `89010123
				78121874
				87430965
				96549874
				45678903
				32019012
				01329801
				10456732`,
		expected: `81`,
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day10_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day10_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day10_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day10_part2(input));
	const part2After = performance.now();

	logSolution(10, 2024, part1Solution, part2Solution);

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

function addIfNew(uniqueNines: String[], arg1: String) {
	if (!uniqueNines.includes(arg1)) {
		uniqueNines.push(arg1);
	}
}

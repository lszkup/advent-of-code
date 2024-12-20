import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 20;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/20/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/20/data.txt
// problem url  : https://adventofcode.com/2024/day/20

type CellType = '#' | '.' | 'S' | 'E';

interface Point {
	x: number;
	y: number;
}

function parseMap(input: string[]): {
	grid: CellType[][];
	start: Point;
	end: Point;
} {
	const grid = input.map(line => [...line] as CellType[]);
	let start: Point = { x: 0, y: 0 };
	let end: Point = { x: 0, y: 0 };

	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
			if (grid[y][x] === 'S') {
				start = { x, y };
			} else if (grid[y][x] === 'E') {
				end = { x, y };
			}
		}
	}

	return { grid, start, end };
}

function isValidCell(grid: CellType[][], x: number, y: number): boolean {
	return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

function neighbors(x: number, y: number): Point[] {
	return [
		{ x: x + 1, y },
		{ x: x - 1, y },
		{ x, y: y + 1 },
		{ x, y: y - 1 },
	];
}

function shortestPathWithoutCheat(grid: CellType[][], start: Point, end: Point): number[][] {
	const distances: number[][] = grid.map(row => row.map(() => Infinity));
	const queue: Array<{ x: number, y: number }> = [];

	distances[start.y][start.x] = 0;
	queue.push({ x: start.x, y: start.y });

	while (queue.length > 0) {
		const { x, y } = queue.shift()!;
		if (x === end.x && y === end.y) {
			break;
		}
		const dist = distances[y][x];
		for (const n of neighbors(x, y)) {
			if (isValidCell(grid, n.x, n.y) && distances[n.y][n.x] == Infinity) {
				const cell = grid[n.y][n.x];
				if (cell !== '#') {
					distances[n.y][n.x] = dist + 1;
					queue.push({ x: n.x, y: n.y });
				}
			}
		}
	}

	return distances;
}

function chatNneighborsFor2Moves(x: number, y: number): Point[] {
	return [
		{ x: x + 2, y },
		{ x: x - 2, y },
		{ x, y: y + 2 },
		{ x, y: y - 2 },
		{ x: x + 1, y: y + 1 },
		{ x: x - 1, y: y - 1 },
		{ x: x + 1, y: y - 1 },
		{ x: x - 1, y: y + 1 },
	];
}

function numberOfCheatsWithUpTo2ChatMoves(grid: CellType[][], distances: number[][], minPicosecondsSaved: number): number {
	let numberOfCheats = 0;
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
			if (distances[y][x] != Infinity) {
				for (const n of chatNneighborsFor2Moves(x, y)) {
					if (isValidCell(grid, n.x, n.y) && distances[n.y][n.x] != Infinity) {
						const cheatedDistanceInSteps = Math.abs(n.y - y) + Math.abs(n.x - x);
						const numberOfPicosecondsSaved = distances[n.y][n.x] - distances[y][x] - cheatedDistanceInSteps;
						if (numberOfPicosecondsSaved > 0 && numberOfPicosecondsSaved >= minPicosecondsSaved) {
							numberOfCheats++;
						}
					}
				}
			}
		}
	}
	return numberOfCheats;
}

function chatNneighborsForUpTo20Moves(x: number, y: number): Point[] {
	const points: Point[] = [];
	for (let dy = -20; dy <= 20; dy++) {
		for (let dx = -20; dx <= 20; dx++) {
			if (Math.abs(dy) + Math.abs(dx) <= 20) {
				points.push({ x: x + dx, y: y + dy });
			}
		}
	}

	return points;
}

function numberOfCheatsWithUpTo20ChatMoves(grid: CellType[][], distances: number[][], minPicosecondsSaved: number): number {
	let numberOfCheats = 0;
	for (let y = 0; y < grid.length; y++) {
		for (let x = 0; x < grid[0].length; x++) {
			if (distances[y][x] != Infinity) {
				for (const n of chatNneighborsForUpTo20Moves(x, y)) {
					if (isValidCell(grid, n.x, n.y) && distances[n.y][n.x] != Infinity) {
						const cheatedDistanceInSteps = Math.abs(n.y - y) + Math.abs(n.x - x);
						const numberOfPicosecondsSaved = distances[n.y][n.x] - distances[y][x] - cheatedDistanceInSteps;
						if (numberOfPicosecondsSaved > 0 && numberOfPicosecondsSaved >= minPicosecondsSaved) {
							numberOfCheats++;
						}
					}
				}
			}
		}
	}
	return numberOfCheats;
}

async function p2024day20_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").filter(x => x.length > 0);
	const { grid, start, end } = parseMap(lines);
	const normalDist = shortestPathWithoutCheat(grid, start, end);

	return numberOfCheatsWithUpTo2ChatMoves(grid, normalDist, params[0] ?? 100);
}

async function p2024day20_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").filter(x => x.length > 0);
	const { grid, start, end } = parseMap(lines);
	const normalDist = shortestPathWithoutCheat(grid, start, end);

	return numberOfCheatsWithUpTo20ChatMoves(grid, normalDist, params[0] ?? 100);
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############`,
		expected: `8`,
		extraArgs: [12]
	}];
	const part2tests: TestCase[] = [{
		input: `###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############`,
		expected: `285`,
		extraArgs: [50]
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day20_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day20_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day20_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day20_part2(input));
	const part2After = performance.now();

	logSolution(20, 2024, part1Solution, part2Solution);

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

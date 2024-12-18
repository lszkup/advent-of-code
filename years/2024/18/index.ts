import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 18;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/18/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/18/data.txt
// problem url  : https://adventofcode.com/2024/day/18

type Coordinate = [number, number];

/**
 * Given a list of corrupted coordinates, mark the first 1024 of them on a 71x71 grid.
 * Then, find the shortest path from (0,0) to (70,70) using BFS.
 */

// The size of the grid
const GRID_SIZE = 71;

// Example corrupted coordinates (X, Y). Replace with actual input.
const corruptedCoordinates: Coordinate[] = [];

// Initialize the grid
// false means safe, true means corrupted/blocked
let grid: boolean[][] = [];


// BFS to find the shortest path from (0,0) to (70,70)
function bfsShortestPath(grid: boolean[][], start: Coordinate, end: Coordinate): number {
	const [endX, endY] = end;

	// If start or end is blocked, return immediately
	if (grid[start[1]][start[0]] || grid[endY][endX]) {
		return -1;
	}

	const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
	const queue: Array<{ x: number; y: number; dist: number }> = [];

	// Directions: up, down, left, right
	const directions: Coordinate[] = [
		[0, 1],
		[0, -1],
		[1, 0],
		[-1, 0],
	];

	// Start BFS from (0,0)
	queue.push({ x: start[0], y: start[1], dist: 0 });
	visited[start[1]][start[0]] = true;

	while (queue.length > 0) {
		const { x, y, dist } = queue.shift()!;

		// If we reached the end
		if (x === endX && y === endY) {
			return dist;
		}

		for (const [dx, dy] of directions) {
			const nx = x + dx;
			const ny = y + dy;

			if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
				continue; // Out of bounds
			}
			if (!visited[ny][nx] && !grid[ny][nx]) {
				visited[ny][nx] = true;
				queue.push({ x: nx, y: ny, dist: dist + 1 });
			}
		}
	}

	// No path found
	return -1;
}

// Compute the shortest path after corruption


async function p2024day18_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => line.trim());
	grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
	corruptedCoordinates.push(...lines.map(line => line.split(",").map(Number) as Coordinate));
	// Mark the first 1024 corrupted coordinates
	for (let i = 0; i < Math.min(1024, corruptedCoordinates.length); i++) {
		const [x, y] = corruptedCoordinates[i];
		if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
			grid[y][x] = true;
		}
	}
	//console.log(grid.map(row => row.map(cell => (cell ? "#" : ".")).join("")).join("\n"));
	const shortestSteps = bfsShortestPath(grid, [0, 0], [70, 70]);
	return shortestSteps;
}

async function p2024day18_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => line.trim());
	corruptedCoordinates.push(...lines.map(line => line.split(",").map(Number) as Coordinate));

	let minNumberOfFallenBlocks = 1024;
	while (true) {
		grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
		for (let i = 0; i < Math.min(minNumberOfFallenBlocks, corruptedCoordinates.length); i++) {
			const [x, y] = corruptedCoordinates[i];
			if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
				grid[y][x] = true;
			}
		}
		//console.log(grid.map(row => row.map(cell => (cell ? "#" : ".")).join("")).join("\n"));
		console.log(minNumberOfFallenBlocks);
		if (bfsShortestPath(grid, [0, 0], [70, 70]) < 0) {
			return corruptedCoordinates[minNumberOfFallenBlocks - 1].join(",");
		}
		minNumberOfFallenBlocks++;
	}
}

async function run() {
	const part1tests: TestCase[] = [];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day18_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day18_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day18_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day18_part2(input));
	const part2After = performance.now();

	logSolution(18, 2024, part1Solution, part2Solution);

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

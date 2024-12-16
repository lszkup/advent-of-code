import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 16;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/16/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/16/data.txt
// problem url  : https://adventofcode.com/2024/day/16

interface Cell {
	column: number;
	row: number;
	cost?: number;
}
interface CellBestResult {
	column: number;
	row: number;
	// 0 = up, 90 = right, 180 = down, 270 = left
	direction: 0 | 90 | 180 | 270;
	bestCost: number;
	incomingCells: Cell[];
}

interface CostAtDirection {
	bestCost: number;
	incomingCells: Cell[];
}

interface CellBestResult2 {
	column: number;
	row: number;
	costByDirection: Map<0 | 90 | 180 | 270, CostAtDirection>;
}

interface CellBestResultCandidates {
	column: number;
	row: number;
	// 0 = up, 90 = right, 180 = down, 270 = left
	direction: 0 | 90 | 180 | 270;
	newCost: number;
}

async function p2024day16_part1(input: string, ...params: any[]) {
	const board = input.split("\n")
		.map(line => line.trim())
		.map(line => [...line.trim()]);
	const visitedBestResults: CellBestResult[][] = board.map(
		(line, row) => line.map(
			(cell, column) => ({ row, column, direction: 0, bestCost: -1, incomingCells: [] })));
	let startX = board.filter(line => line.includes('S'))[0].indexOf('S');
	let startY = board.findIndex(line => line.includes('S'));
	let endX = board.filter(line => line.includes('E'))[0].indexOf('E');
	let endY = board.findIndex(line => line.includes('E'));
	visitedBestResults[startY][startX].bestCost = 0;
	visitedBestResults[startY][startX].direction = 90;
	visitedBestResults[endY][endX].bestCost = -99;
	let cellsToVisit: Cell[] = [{ column: startX, row: startY }];
	let interation = 0;
	while (cellsToVisit.length > 0) {
		interation++;
		let cellsToVisitNext: Cell[] = [];
		cellsToVisit.forEach(cell => {
			const neighbors: CellBestResultCandidates[] = [
				{
					row: cell.row - 1,
					column: cell.column,
					direction: 0,
					newCost: visitedBestResults[cell.row][cell.column].bestCost +
						turningCost(0, visitedBestResults[cell.row][cell.column].direction) + 1,
				},
				{
					row: cell.row + 1,
					column: cell.column,
					direction: 180,
					newCost: visitedBestResults[cell.row][cell.column].bestCost +
						turningCost(180, visitedBestResults[cell.row][cell.column].direction) + 1,
				},
				{
					row: cell.row,
					column: cell.column - 1,
					direction: 270,
					newCost: visitedBestResults[cell.row][cell.column].bestCost +
						turningCost(270, visitedBestResults[cell.row][cell.column].direction) + 1,
				},
				{
					row: cell.row,
					column: cell.column + 1,
					direction: 90,
					newCost: visitedBestResults[cell.row][cell.column].bestCost +
						turningCost(90, visitedBestResults[cell.row][cell.column].direction) + 1,
				}
			];
			// if (cell.row === 2 && cell.column === 9) {
			// 	console.log('neighbors', neighbors);
			// 	console.log('visitedBestResults[cell.row][cell.column]', visitedBestResults[cell.row][cell.column]);
			// }
			for (const neighbor of neighbors) {
				if (neighbor.row >= 0 && neighbor.row < board.length && neighbor.column >= 0 && neighbor.column < board[0].length) {
					if (board[neighbor.row][neighbor.column] === '.' || board[neighbor.row][neighbor.column] === 'E') {
						if (visitedBestResults[neighbor.row][neighbor.column].bestCost < 0 ||
							visitedBestResults[neighbor.row][neighbor.column].bestCost >= neighbor.newCost) {
							visitedBestResults[neighbor.row][neighbor.column].bestCost = neighbor.newCost;
							visitedBestResults[neighbor.row][neighbor.column].direction = neighbor.direction;
							cellsToVisitNext.push({ column: neighbor.column, row: neighbor.row });
						}
					}
				}
			}
		});
		cellsToVisit = cellsToVisitNext;
		//console.log(interation);
		//console.log(visitedBestResults.map(line => line.map(cell => cell.bestCost.toString().padStart(4, ' ')).join(' ')).join('\n'));
	}
	//console.log(visitedBestResults[endY][endX].bestCost);
	return visitedBestResults[endY][endX].bestCost;
}
function turningCost(newDirection: 0 | 90 | 180 | 270, oldDirection: 0 | 90 | 180 | 270) {
	let diff = Math.abs(newDirection - oldDirection);
	if (diff == 270) {
		diff = 90;
	}
	return (diff * 1000) / 90;
}

async function p2024day16_part2(input: string, ...params: any[]) {
	const board = input.split("\n")
		.map(line => line.trim())
		.map(line => [...line.trim()]);
	const visitedBestResults: CellBestResult2[][] = board.map(
		(line, row) => line.map(
			(cell, column) => ({
				row, column,
				costByDirection: new Map([
					[0, { direction: 0, bestCost: 0, incomingCells: [] }],
					[90, { direction: 90, bestCost: 0, incomingCells: [] }],
					[180, { direction: 180, bestCost: 0, incomingCells: [] }],
					[270, { direction: 270, bestCost: 0, incomingCells: [] }]
				])
			})));
	let startX = board.filter(line => line.includes('S'))[0].indexOf('S');
	let startY = board.findIndex(line => line.includes('S'));
	let endX = board.filter(line => line.includes('E'))[0].indexOf('E');
	let endY = board.findIndex(line => line.includes('E'));
	visitedBestResults[startY][startX].costByDirection.get(0)!.bestCost = 0;
	visitedBestResults[startY][startX].costByDirection.get(90)!.bestCost = 0;
	visitedBestResults[startY][startX].costByDirection.get(180)!.bestCost = 0;
	visitedBestResults[startY][startX].costByDirection.get(270)!.bestCost = 0;
	let cellsToVisit: Cell[] = [{ column: startX, row: startY }];
	let interation = 0;
	while (cellsToVisit.length > 0) {
		interation++;
		let cellsToVisitNext: Cell[] = [];
		cellsToVisit.forEach(cell => {
			const neighborsMovingForward: CellBestResultCandidates[] = [
				{
					row: cell.row - 1,
					column: cell.column,
					direction: 0,
					newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(0)!.bestCost + 1,
				},
				{
					row: cell.row + 1,
					column: cell.column,
					direction: 180,
					newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(180)!.bestCost + 1,
				},
				{
					row: cell.row,
					column: cell.column - 1,
					direction: 270,
					newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(270)!.bestCost + 1,
				},
				{
					row: cell.row,
					column: cell.column + 1,
					direction: 90,
					newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(90)!.bestCost + 1,
				}
			];
			const neighborsTurning: CellBestResultCandidates[] = [];
			[0, 90, 180, 270].forEach((direction) => {
				const typedDirection = direction as (0 | 90 | 180 | 270);
				if (turningCost(typedDirection, 0) > 0) {
					neighborsTurning.push({
						row: cell.row,
						column: cell.column,
						direction: typedDirection,
						newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(typedDirection)!.bestCost +
							turningCost(typedDirection, 0),
					});
				}
				if (turningCost(typedDirection, 90) > 0) {
					neighborsTurning.push({
						row: cell.row,
						column: cell.column,
						direction: typedDirection,
						newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(typedDirection)!.bestCost +
							turningCost(typedDirection, 90),
					});
				}
				if (turningCost(typedDirection, 180) > 0) {
					neighborsTurning.push({
						row: cell.row,
						column: cell.column,
						direction: typedDirection,
						newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(typedDirection)!.bestCost +
							turningCost(typedDirection, 180),
					});
				}
				if (turningCost(typedDirection, 270) > 0) {
					neighborsTurning.push({
						row: cell.row,
						column: cell.column,
						direction: typedDirection,
						newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(typedDirection)!.bestCost +
							turningCost(typedDirection, 270),
					});
				}
			});
			const neighbors = [...neighborsMovingForward, ...neighborsTurning];
			for (const neighbor of neighbors) {
				if (neighbor.row >= 0 && neighbor.row < board.length && neighbor.column >= 0 && neighbor.column < board[0].length) {
					if (board[neighbor.row][neighbor.column] === '.' ||
						board[neighbor.row][neighbor.column] === 'E' ||
						board[neighbor.row][neighbor.column] === 'S') {
						if (!visitedBestResults[neighbor.row][neighbor.column].costByDirection.has(neighbor.direction)) {
							visitedBestResults[neighbor.row][neighbor.column].costByDirection.set(neighbor.direction, { bestCost: -1, incomingCells: [] });
						}
						const bestCostAtDirection = visitedBestResults[neighbor.row][neighbor.column].costByDirection.get(neighbor.direction)!;
						if (bestCostAtDirection.bestCost == 0 ||
							bestCostAtDirection.bestCost > neighbor.newCost) {
							bestCostAtDirection.bestCost = neighbor.newCost;
							bestCostAtDirection.incomingCells.push({ column: cell.column, row: cell.row, cost: neighbor.newCost });
							bestCostAtDirection.incomingCells =
								bestCostAtDirection.incomingCells.filter(cell => cell.cost === neighbor.newCost);
							cellsToVisitNext.push({ column: neighbor.column, row: neighbor.row });
						}
					}
				}
			}
		});
		cellsToVisit = cellsToVisitNext;
		console.log(interation);
		//console.log(visitedBestResults.map(line => line.map(cell => cell.bestCost.toString().padStart(4, ' ')).join(' ')).join('\n'));
	}

	console.log('TEST UP', visitedBestResults[endY][endX].costByDirection.get(0)?.bestCost);
	console.log('TEST RIGHT', visitedBestResults[endY][endX].costByDirection.get(90)?.bestCost);
	console.log('TEST DOWN', visitedBestResults[endY][endX].costByDirection.get(180)?.bestCost);
	console.log('TEST LEFT', visitedBestResults[endY][endX].costByDirection.get(270)?.bestCost);

	// TODO: for each visitedBestResults look at costByDirection bestCost and leave only incomingCells with the bestCost
	visitedBestResults.forEach(line => line.forEach(cell => {
		const bestCost = Math.min(
			cell.costByDirection.get(0)?.bestCost ?? Number.MAX_SAFE_INTEGER,
			cell.costByDirection.get(90)?.bestCost ?? Number.MAX_SAFE_INTEGER,
			cell.costByDirection.get(180)?.bestCost ?? Number.MAX_SAFE_INTEGER,
			cell.costByDirection.get(270)?.bestCost ?? Number.MAX_SAFE_INTEGER
		);
		cell.costByDirection.forEach((costAtDirection, direction) => {
			costAtDirection.incomingCells = costAtDirection.incomingCells.filter(cell => cell.cost === bestCost);
		});
	}));

	let numberOfVisitedCellsOnTheBestPaths = 1;
	const visitedCells: boolean[][] = board.map(line => line.map(cell => false));
	let incomingCells = [
		...visitedBestResults[endY][endX].costByDirection.get(0)?.incomingCells ?? [],
		...visitedBestResults[endY][endX].costByDirection.get(90)?.incomingCells ?? [],
		...visitedBestResults[endY][endX].costByDirection.get(180)?.incomingCells ?? [],
		...visitedBestResults[endY][endX].costByDirection.get(270)?.incomingCells ?? []
	];
	while (incomingCells.length > 0) {
		const nextIncomingCells: Cell[] = [];
		incomingCells.forEach(cell => {
			if (!visitedCells[cell.row][cell.column]) {
				visitedCells[cell.row][cell.column] = true;
				numberOfVisitedCellsOnTheBestPaths++;
				nextIncomingCells.push(
					...visitedBestResults[cell.row][cell.column].costByDirection.get(0)?.incomingCells ?? [],
					...visitedBestResults[cell.row][cell.column].costByDirection.get(90)?.incomingCells ?? [],
					...visitedBestResults[cell.row][cell.column].costByDirection.get(180)?.incomingCells ?? [],
					...visitedBestResults[cell.row][cell.column].costByDirection.get(270)?.incomingCells ?? [],
				);
			}
		});
		incomingCells = nextIncomingCells;
	}
	console.log(visitedCells.map(line => line.map(cell => cell ? 'X' : '.').join('')).join('\n'));
	return numberOfVisitedCellsOnTheBestPaths;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `###############
					#.............#
					#.#.#.##E.#.#.#
					#.....#...#.#.#
					#.###.#.#.#.#.#
					#S........#...#
					###############`,
			expected: `2012`
		},
		{
			input: `###############
					#.......#....E#
					#.#.###.#.###.#
					#.....#.#...#.#
					#.###.#####.#.#
					#.#.#.......#.#
					#.#.#####.###.#
					#...........#.#
					###.#.#####.#.#
					#...#.....#.#.#
					#.#.#.###.#.#.#
					#.....#...#.#.#
					#.###.#.#.#.#.#
					#S..#.....#...#
					###############`,
			expected: `7036`
		}, {
			input: `#################
					#...#...#...#..E#
					#.#.#.#.#.#.#.#.#
					#.#.#.#...#...#.#
					#.#.#.#.###.#.#.#
					#...#.#.#.....#.#
					#.#.#.#.#.#####.#
					#.#...#.#.#.....#
					#.#.#####.#.###.#
					#.#.#.......#...#
					#.#.###.#####.###
					#.#.#...#.....#.#
					#.#.#.#####.###.#
					#.#.#.........#.#
					#.#.#.#########.#
					#S#.............#
					#################`,
			expected: `11048`
		}
	];
	const part2tests: TestCase[] = [
		{
			input: `###############
					#.......#....E#
					#.#.###.#.###.#
					#.....#.#...#.#
					#.###.#####.#.#
					#.#.#.......#.#
					#.#.#####.###.#
					#...........#.#
					###.#.#####.#.#
					#...#.....#.#.#
					#.#.#.###.#.#.#
					#.....#...#.#.#
					#.###.#.#.#.#.#
					#S..#.....#...#
					###############`,
			expected: `45`
		},
		/*{
			input: `#################
					#...#...#...#..E#
					#.#.#.#.#.#.#.#.#
					#.#.#.#...#...#.#
					#.#.#.#.###.#.#.#
					#...#.#.#.....#.#
					#.#.#.#.#.#####.#
					#.#...#.#.#.....#
					#.#.#####.#.###.#
					#.#.#.......#...#
					#.#.###.#####.###
					#.#.#...#.....#.#
					#.#.#.#####.###.#
					#.#.#.........#.#
					#.#.#.#########.#
					#S#.............#
					#################`,
			expected: `64`
		}*/
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day16_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day16_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	// const input = await util.getInput(DAY, YEAR);

	// const part1Before = performance.now();
	// const part1Solution = String(await p2024day16_part1(input));
	// const part1After = performance.now();

	// const part2Before = performance.now()
	// const part2Solution = String(await p2024day16_part2(input));
	// const part2After = performance.now();

	// logSolution(16, 2024, part1Solution, part2Solution);

	// log(chalk.gray("--- Performance ---"));
	// log(chalk.gray(`Part 1: ${util.formatTime(part1After - part1Before)}`));
	// log(chalk.gray(`Part 2: ${util.formatTime(part2After - part2Before)}`));
	// log();
}

run()
	.then(() => {
		process.exit();
	})
	.catch(error => {
		throw error;
	});

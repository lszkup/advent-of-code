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

type Direction = 0 | 90 | 180 | 270;
interface CellBestResult {
	column: number;
	row: number;
	// 0 = up, 90 = right, 180 = down, 270 = left
	direction: Direction;
	bestCost: number;
	incomingCells: Cell[];
}

interface CellID {
	column: number;
	row: number;
	direction: Direction;
}

interface CostAtDirection {
	bestCost: number;
	incomingCells: CellID[];
}

interface CellBestResult2 {
	column: number;
	row: number;
	costByDirection: Map<Direction, CostAtDirection>;
}

interface CellBestResultCandidates {
	column: number;
	row: number;
	// 0 = up, 90 = right, 180 = down, 270 = left
	direction: Direction;
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
function turningCost(newDirection: Direction, oldDirection: Direction) {
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
					[0, { direction: 0, bestCost: -1, incomingCells: [] }],
					[90, { direction: 90, bestCost: -1, incomingCells: [] }],
					[180, { direction: 180, bestCost: -1, incomingCells: [] }],
					[270, { direction: 270, bestCost: -1, incomingCells: [] }]
				])
			})));
	let startX = board.filter(line => line.includes('S'))[0].indexOf('S');
	let startY = board.findIndex(line => line.includes('S'));
	let endX = board.filter(line => line.includes('E'))[0].indexOf('E');
	let endY = board.findIndex(line => line.includes('E'));
	visitedBestResults[startY][startX].costByDirection.get(0)!.bestCost = -1;
	visitedBestResults[startY][startX].costByDirection.get(90)!.bestCost = 0;
	visitedBestResults[startY][startX].costByDirection.get(180)!.bestCost = -1;
	visitedBestResults[startY][startX].costByDirection.get(270)!.bestCost = -1;
	let cellsToVisit: CellID[] = [{ column: startX, row: startY, direction: 90 }];
	let interation = 0;
	while (cellsToVisit.length > 0) {
		interation++;
		let cellsToVisitNext: CellID[] = [];
		cellsToVisit.forEach(cell => {
			let moveForwardRow = cell.row;
			let moveForwardColumn = cell.column;
			if (cell.direction === 0) {
				moveForwardRow--;
			}
			if (cell.direction === 90) {
				moveForwardColumn++;
			}
			if (cell.direction === 180) {
				moveForwardRow++;
			}
			if (cell.direction === 270) {
				moveForwardColumn--;
			}
			const neighborsMovingForward: CellBestResultCandidates[] = [
				{
					row: moveForwardRow,
					column: moveForwardColumn,
					direction: cell.direction,
					newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(cell.direction)!.bestCost + 1,
				},
			];
			const neighborsTurning: CellBestResultCandidates[] = [];
			[0, 90, 180, 270].forEach((direction) => {
				const typedDirection = direction as Direction;
				if (typedDirection !== cell.direction) {
					neighborsTurning.push({
						row: cell.row,
						column: cell.column,
						direction: typedDirection,
						newCost: visitedBestResults[cell.row][cell.column].costByDirection.get(cell.direction)!.bestCost +
							turningCost(typedDirection, cell.direction),
					});
				}

			});
			// console.log('neighborsTurning', neighborsTurning);
			const neighbors = [...neighborsMovingForward, ...neighborsTurning];
			for (const neighbor of neighbors) {
				if (neighbor.row >= 0 && neighbor.row < board.length && neighbor.column >= 0 && neighbor.column < board[0].length) {
					if (board[neighbor.row][neighbor.column] === '.' ||
						board[neighbor.row][neighbor.column] === 'E' ||
						board[neighbor.row][neighbor.column] === 'S') {
						const bestCostAtDirection = visitedBestResults[neighbor.row][neighbor.column].costByDirection.get(neighbor.direction)!;
						if (bestCostAtDirection.bestCost < 0 ||
							bestCostAtDirection.bestCost > neighbor.newCost) {
							bestCostAtDirection.bestCost = neighbor.newCost;
							bestCostAtDirection.incomingCells = [];
							bestCostAtDirection.incomingCells.push({ column: cell.column, row: cell.row, direction: cell.direction });
							cellsToVisitNext.push({ column: neighbor.column, row: neighbor.row, direction: neighbor.direction });
						}
						else if (bestCostAtDirection.bestCost < 0 ||
							bestCostAtDirection.bestCost == neighbor.newCost) {
							bestCostAtDirection.incomingCells.push({ column: cell.column, row: cell.row, direction: cell.direction });
							cellsToVisitNext.push({ column: neighbor.column, row: neighbor.row, direction: neighbor.direction });
						}
					}
				}
			}
		});
		cellsToVisit = cellsToVisitNext;
	}

	const bestCostAtDestination = [
		visitedBestResults[endY][endX].costByDirection.get(0)!.bestCost,
		visitedBestResults[endY][endX].costByDirection.get(90)!.bestCost,
		visitedBestResults[endY][endX].costByDirection.get(180)!.bestCost,
		visitedBestResults[endY][endX].costByDirection.get(270)!.bestCost]
		.filter(cost => cost >= 0)
		.sort()[0];
	// console.log('BEST COST AT DESTINATION', bestCostAtDestination);
	// console.log('END UP', visitedBestResults[endY][endX].costByDirection.get(0)?.bestCost);
	// console.log('END RIGHT', visitedBestResults[endY][endX].costByDirection.get(90)?.bestCost);
	// console.log('END DOWN', visitedBestResults[endY][endX].costByDirection.get(180)?.bestCost);
	// console.log('END LEFT', visitedBestResults[endY][endX].costByDirection.get(270)?.bestCost);

	let numberOfVisitedCellsOnTheBestPaths = 1;
	const visitedCellAtEachDirection: boolean[][][] = board.map(line => line.map(cell => [0, 90, 180, 270].map(() => false)));
	const visitedCells: boolean[][] = board.map(line => line.map(cell => false));
	let incomingCells: CellID[] = [];
	[0, 90, 180, 270].forEach((direction) => {
		const typedDirection = direction as Direction;
		if (visitedBestResults[endY][endX].costByDirection.get(typedDirection)!.bestCost === bestCostAtDestination) {
			incomingCells.push(
				...visitedBestResults[endY][endX].costByDirection.get(typedDirection)!.incomingCells ?? []
			);
		}
	});
	while (incomingCells.length > 0) {
		const nextIncomingCells: CellID[] = [];
		incomingCells.forEach(cell => {
			if (!visitedCellAtEachDirection[cell.row][cell.column][cell.direction]) {
				visitedCellAtEachDirection[cell.row][cell.column][cell.direction] = true;
				if (!visitedCells[cell.row][cell.column]) {
					visitedCells[cell.row][cell.column] = true;
					numberOfVisitedCellsOnTheBestPaths++;
				}
				nextIncomingCells.push(
					...visitedBestResults[cell.row][cell.column].costByDirection.get(cell.direction)?.incomingCells ?? [],
				);
			}
		});
		incomingCells = nextIncomingCells;
	}
	//console.log(visitedCells.map(line => line.map(cell => cell ? 'X' : '.').join('')).join('\n'));
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

	// Part 2 Answer: 528 - WRONG, TOO HIGH

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
		{
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
		}
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
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day16_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day16_part2(input));
	const part2After = performance.now();

	logSolution(16, 2024, part1Solution, part2Solution);

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

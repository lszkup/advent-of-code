import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { left } from "inquirer/lib/utils/readline";

const YEAR = 2024;
const DAY = 12;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/12/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/12/data.txt
// problem url  : https://adventofcode.com/2024/day/12

/*
--- Day 12: Garden Groups ---
Why not search for the Chief Historian near the gardener and his massive farm? There's plenty of food, so The Historians grab something to eat while they search.

You're about to settle near a complex arrangement of garden plots when some Elves ask if you can lend a hand. They'd like to set up fences around each region of garden plots, but they can't figure out how much fence they need to order or how much it will cost. They hand you a map (your puzzle input) of the garden plots.

Each garden plot grows only a single type of plant and is indicated by a single letter on your map. When multiple garden plots are growing the same type of plant and are touching (horizontally or vertically), they form a region. For example:

AAAA
BBCD
BBCC
EEEC
This 4x4 arrangement includes garden plots growing five different types of plants (labeled A, B, C, D, and E), each grouped into their own region.

In order to accurately calculate the cost of the fence around a single region, you need to know that region's area and perimeter.

The area of a region is simply the number of garden plots the region contains. The above map's type A, B, and C plants are each in a region of area 4. The type E plants are in a region of area 3; the type D plants are in a region of area 1.

Each garden plot is a square and so has four sides. The perimeter of a region is the number of sides of garden plots in the region that do not touch another garden plot in the same region. The type A and C plants are each in a region with perimeter 10. The type B and E plants are each in a region with perimeter 8. The lone D plot forms its own region with perimeter 4.

Visually indicating the sides of plots in each region that contribute to the perimeter using - and |, the above map's regions' perimeters are measured as follows:

+-+-+-+-+
|A A A A|
+-+-+-+-+     +-+
			  |D|
+-+-+   +-+   +-+
|B B|   |C|
+   +   + +-+
|B B|   |C C|
+-+-+   +-+ +
		  |C|
+-+-+-+   +-+
|E E E|
+-+-+-+
Plants of the same type can appear in multiple separate regions, and regions can even appear within other regions. For example:

OOOOO
OXOXO
OOOOO
OXOXO
OOOOO
The above map contains five regions, one containing all of the O garden plots, and the other four each containing a single X plot.

The four X regions each have area 1 and perimeter 4. The region containing 21 type O plants is more complicated; in addition to its outer edge contributing a perimeter of 20, its boundary with each X region contributes an additional 4 to its perimeter, for a total perimeter of 36.

Due to "modern" business practices, the price of fence required for a region is found by multiplying that region's area by its perimeter. The total price of fencing all regions on a map is found by adding together the price of fence for every region on the map.

In the first example, region A has price 4 * 10 = 40, region B has price 4 * 8 = 32, region C has price 4 * 10 = 40, region D has price 1 * 4 = 4, and region E has price 3 * 8 = 24. So, the total price for the first example is 140.

In the second example, the region with all of the O plants has price 21 * 36 = 756, and each of the four smaller X regions has price 1 * 4 = 4, for a total price of 772 (756 + 4 + 4 + 4 + 4).

Here's a larger example:

RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE
It contains:

A region of R plants with price 12 * 18 = 216.
A region of I plants with price 4 * 8 = 32.
A region of C plants with price 14 * 28 = 392.
A region of F plants with price 10 * 18 = 180.
A region of V plants with price 13 * 20 = 260.
A region of J plants with price 11 * 20 = 220.
A region of C plants with price 1 * 4 = 4.
A region of E plants with price 13 * 18 = 234.
A region of I plants with price 14 * 22 = 308.
A region of M plants with price 5 * 12 = 60.
A region of S plants with price 3 * 8 = 24.
So, it has a total price of 1930.

What is the total price of fencing all regions on your map?
*/

async function p2024day12_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => [...line.trim()]);
	const visitedGlobal = lines.map(line => line.map(() => false));
	let regionCostCounter = 0;
	for (let rowIndex = 0; rowIndex < lines.length; rowIndex++) {
		for (let columnIndex = 0; columnIndex < lines[rowIndex].length; columnIndex++) {
			if (visitedGlobal[rowIndex][columnIndex]) {
				continue;
			}
			const visitedLocal = input.split("\n").map(line => [...line.trim()].map(() => false));
			const letter = lines[rowIndex][columnIndex];
			visitedLocal[rowIndex][columnIndex] = true;
			let cellsToVisit = [{ row: rowIndex, column: columnIndex }];
			while (cellsToVisit.length) {
				let cellsToVisitNext: Cell[] = [];
				cellsToVisit.forEach(cell => {
					const neighbors: Cell[] = [
						{ row: cell.row - 1, column: cell.column },
						{ row: cell.row + 1, column: cell.column },
						{ row: cell.row, column: cell.column - 1 },
						{ row: cell.row, column: cell.column + 1 }
					];
					for (const neighbor of neighbors) {
						if (neighbor.row >= 0 && neighbor.row < lines.length && neighbor.column >= 0 && neighbor.column < lines[0].length) {
							if (lines[neighbor.row][neighbor.column] === letter && !visitedLocal[neighbor.row][neighbor.column]) {
								cellsToVisitNext.push(neighbor);
								visitedLocal[neighbor.row][neighbor.column] = true;
								//console.log('neighbor', neighbor);
							}
						}
					}
				});
				cellsToVisit = cellsToVisitNext;
			}
			// Udpate the region cost
			let numberOfFences = 0;
			let fieldSize = 0;
			for (let i = 0; i < visitedLocal.length; i++) {
				for (let j = 0; j < visitedLocal[i].length; j++) {
					if (visitedLocal[i][j]) {
						fieldSize++;
						const neighbors: Cell[] = [
							{ row: i - 1, column: j },
							{ row: i + 1, column: j },
							{ row: i, column: j - 1 },
							{ row: i, column: j + 1 }
						];
						for (const neighbor of neighbors) {
							if (neighbor.row < 0) {
								numberOfFences++;
							}
							if (neighbor.row >= lines.length) {
								numberOfFences++;
							}
							if (neighbor.column < 0) {
								numberOfFences++;
							}
							if (neighbor.column >= lines[0].length) {
								numberOfFences++;
							}
							if (neighbor.row >= 0 && neighbor.row < lines.length && neighbor.column >= 0 && neighbor.column < lines[0].length) {
								if (!visitedLocal[neighbor.row][neighbor.column]) {
									numberOfFences++;
								}
							}
						}
					}
				}
			}
			// Update the global visited array
			for (let i = 0; i < visitedLocal.length; i++) {
				for (let j = 0; j < visitedLocal[i].length; j++) {
					if (visitedLocal[i][j]) {
						visitedGlobal[i][j] = true;
					}
				}
			}
			regionCostCounter += fieldSize * numberOfFences;
		}
	}
	return regionCostCounter;
}

interface Cell {
	row: number;
	column: number;
}

interface CellFences {
	row: number;
	column: number;
	fencePosition: 'top' | 'bottom' | 'left' | 'right';
}

async function p2024day12_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => [...line.trim()]);
	const visitedGlobal = lines.map(line => line.map(() => false));
	let regionCostCounter = 0;
	for (let rowIndex = 0; rowIndex < lines.length; rowIndex++) {
		for (let columnIndex = 0; columnIndex < lines[rowIndex].length; columnIndex++) {
			if (visitedGlobal[rowIndex][columnIndex]) {
				continue;
			}
			const visitedLocal: Map<string, boolean> = new Map();
			const letter = lines[rowIndex][columnIndex];
			visitedLocal.set(`${rowIndex},${columnIndex}`, true);
			let cellsToVisit = [{ row: rowIndex, column: columnIndex }];
			while (cellsToVisit.length) {
				let cellsToVisitNext: Cell[] = [];
				cellsToVisit.forEach(cell => {
					const neighbors: Cell[] = [
						{ row: cell.row - 1, column: cell.column },
						{ row: cell.row + 1, column: cell.column },
						{ row: cell.row, column: cell.column - 1 },
						{ row: cell.row, column: cell.column + 1 }
					];
					for (const neighbor of neighbors) {
						if (neighbor.row >= 0 && neighbor.row < lines.length && neighbor.column >= 0 && neighbor.column < lines[0].length) {
							if (lines[neighbor.row][neighbor.column] === letter && !visitedLocal.has(`${neighbor.row},${neighbor.column}`)) {
								cellsToVisitNext.push(neighbor);
								visitedLocal.set(`${neighbor.row},${neighbor.column}`, true);
							}
						}
					}
				});
				cellsToVisit = cellsToVisitNext;
			}
			// Udpate the region cost
			let fieldSize = 0;
			const fencing: CellFences[] = [];
			visitedLocal.forEach((value, key) => {
				const [i, j] = key.split(',').map(Number);
				fieldSize++;
				const neighbors: CellFences[] = [
					{ row: i - 1, column: j, fencePosition: 'top' },
					{ row: i + 1, column: j, fencePosition: 'bottom' },
					{ row: i, column: j - 1, fencePosition: 'left' },
					{ row: i, column: j + 1, fencePosition: 'right' }
				];
				for (const neighbor of neighbors) {
					if (neighbor.row < 0) {
						fencing.push({ row: i, column: j, fencePosition: 'top' });
					}
					if (neighbor.row >= lines.length) {
						fencing.push({ row: i, column: j, fencePosition: 'bottom' });
					}
					if (neighbor.column < 0) {
						fencing.push({ row: i, column: j, fencePosition: 'left' });
					}
					if (neighbor.column >= lines[0].length) {
						fencing.push({ row: i, column: j, fencePosition: 'right' });
					}
					if (neighbor.row >= 0 && neighbor.row < lines.length && neighbor.column >= 0 && neighbor.column < lines[0].length) {
						if (!visitedLocal.has(`${neighbor.row},${neighbor.column}`)) {
							fencing.push({ row: i, column: j, fencePosition: neighbor.fencePosition });
						}
					}
				}
			});

			let numberOfStraightFences = 0;
			const fenceRowsAndColumns = new Map<string, number[]>();
			fencing.forEach(fence => {
				if (fence.fencePosition === 'top' || fence.fencePosition === 'bottom') {
					const key = `${fence.fencePosition}${fence.row}`;
					if (!fenceRowsAndColumns.has(key)) {
						fenceRowsAndColumns.set(key, []);
					}
					fenceRowsAndColumns.get(key)!.push(fence.column);
				} else {
					const key = `${fence.fencePosition}${fence.column}`;
					if (!fenceRowsAndColumns.has(key)) {
						fenceRowsAndColumns.set(key, []);
					}
					fenceRowsAndColumns.get(key)!.push(fence.row);
				}
			});

			fenceRowsAndColumns.forEach((columnsOrRows, key) => {
				const sorted = columnsOrRows.sort();
				if (sorted.length === 1) {
					numberOfStraightFences++;
				} if (sorted.length > 1) {
					numberOfStraightFences++;
					for (let i = 1; i < sorted.length; i++) {
						if (sorted[i] - sorted[i - 1] > 1) {
							numberOfStraightFences++;
						}
					}
				}
			});

			// Update the global visited array
			visitedLocal.forEach((value, key) => {
				const [i, j] = key.split(',').map(Number);
				visitedGlobal[i][j] = true;
			});
			regionCostCounter += fieldSize * numberOfStraightFences;
		}
	}
	return regionCostCounter;
}


async function run() {
	const part1tests: TestCase[] = [{
		input: `AAAA
				BBCD
				BBCC
				EEEC`,
		expected: `140`
	}, {
		input: `OOOOO
				OXOXO
				OOOOO
				OXOXO
				OOOOO`,
		expected: `772`
	}, {
		input: `RRRRIICCFF
			RRRRIICCCF
			VVRRRCCFFF
			VVRCCCJFFF
			VVVVCJJCFE
			VVIVCCJJEE
			VVIIICJJEE
			MIIIIIJJEE
			MIIISIJEEE
			MMMISSJEEE`,
		expected: `1930`
	}];
	const part2tests: TestCase[] = [{
		input: `AAAA
				BBCD
				BBCC
				EEEC`,
		expected: `80`
	}, {
		input: `EEEEE
				EXXXX
				EEEEE
				EXXXX
				EEEEE`,
		expected: `236`
	}, {
		input: `AAAAAA
				AAABBA
				AAABBA
				ABBAAA
				ABBAAA
				AAAAAA`,
		expected: `368`
	}, {
		input: `ABABABABABAB
				BABABABABABA
				ABABABABABAB
				BABABABABABA
				ABABABABABAB
				BABABABABABA
				ABABABABABAB`,
		expected: `336`
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day12_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day12_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day12_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day12_part2(input));
	const part2After = performance.now();

	logSolution(12, 2024, part1Solution, part2Solution);

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

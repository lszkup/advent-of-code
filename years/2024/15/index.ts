import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 15;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/15/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/15/data.txt
// problem url  : https://adventofcode.com/2024/day/15

async function p2024day15_part1(input: string, ...params: any[]) {
	const board = input.split("\n")
		.map(line => line.trim())
		.filter(line => line.length && line.startsWith('#'))
		.map(line => [...line.trim()]);
	//console.log(board.map(line => line.join("")).join("\n"));
	const moves = input.split("\n")
		.map(line => line.trim())
		.filter(line => line.length && !line.startsWith('#'))
		.join("");
	let robotX = board.filter(line => line.includes('@'))[0].indexOf('@');
	let robotY = board.findIndex(line => line.includes('@'));
	[...moves].forEach((move, index) => {
		//console.log(move, index);
		switch (move) {
			case '^':
				if (robotY > 1) {
					for (let i = robotY - 1; i >= 0; i--) {
						if (board[i][robotX] == '#') {
							break;
						}
						if (board[i][robotX] == '.') {
							for (let j = i; j < robotY; j++) {
								board[j][robotX] = board[j + 1][robotX];
							}
							board[robotY][robotX] = '.';
							robotY--;
							break;
						}
					}
				}
				break;
			case 'v':
				if (robotY < board.length - 1) {
					for (let i = robotY + 1; i < board.length; i++) {
						if (board[i][robotX] == '#') {
							break;
						}
						if (board[i][robotX] == '.') {
							for (let j = i; j > robotY; j--) {
								board[j][robotX] = board[j - 1][robotX];
							}
							board[robotY][robotX] = '.';
							robotY++;
							break;
						}
					}
				}
				break;
			case '<':
				if (robotX > 1) {
					for (let i = robotX - 1; i >= 0; i--) {
						if (board[robotY][i] == '#') {
							break;
						}
						if (board[robotY][i] == '.') {
							for (let j = i; j < robotX; j++) {
								board[robotY][j] = board[robotY][j + 1];
							}
							board[robotY][robotX] = '.';
							robotX--;
							break;
						}
					}
				}
				break;
			case '>':
				if (robotX < board[0].length - 1) {
					for (let i = robotX + 1; i < board[0].length; i++) {
						if (board[robotY][i] == '#') {
							break;
						}
						if (board[robotY][i] == '.') {
							for (let j = i; j > robotX; j--) {
								board[robotY][j] = board[robotY][j - 1];
							}
							board[robotY][robotX] = '.';
							robotX++;
							break;
						}
					}
				}
				break;
		}
		//console.log(board.map(line => line.join("")).join("\n"));
	});
	let sumOfAllBoxesLocations = 0;
	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			if (board[y][x] == 'O') {
				sumOfAllBoxesLocations += gpsLocation(x, y);
			}
		}
	}
	return sumOfAllBoxesLocations;
}

function gpsLocation(x: number, y: number): number {
	return y * 100 + x;
}

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function p2024day15_part2(input: string, ...params: any[]) {
	const debugMode = false;
	const board = input.split("\n")
		.map(line => line.trim())
		.filter(line => line.length && line.startsWith('#'))
		.map(line => line.replaceAll('#', '##').replaceAll('O', '[]').replaceAll('.', '..').replaceAll('@', '@.'))
		.map(line => [...line.trim()]);
	if (debugMode) {
		console.log(board.map(line => line.join("")).join("\n"));
	}
	const moves = input.split("\n")
		.map(line => line.trim())
		.filter(line => line.length && !line.startsWith('#'))
		.join("");
	let robotX = board.filter(line => line.includes('@'))[0].indexOf('@');
	let robotY = board.findIndex(line => line.includes('@'));
	for (let index = 0; index < moves.length; index++) {
		const move = moves[index];
		if (debugMode) {
			await sleep(300);
			console.log(move, index, moves.length);
		}
		switch (move) {
			case '^':
				if (robotY > 1) {
					if (board[robotY - 1][robotX] == '#') {
						break;
					}
					else if (board[robotY - 1][robotX] == '.') {
						board[robotY - 1][robotX] = '@';
						board[robotY][robotX] = '.';
						robotY--;
					}
					else if (board[robotY - 1][robotX] == '[') {
						const cellsToPush: CellToPush[] = [];
						if (canBoxBePushedUp(board, robotY - 1, robotX, robotX + 1, cellsToPush)) {
							moveBoxesUp(board, cellsToPush);
							board[robotY - 1][robotX] = '@';
							board[robotY][robotX] = '.';
							robotY--;
						}
					}
					else if (board[robotY - 1][robotX] == ']') {
						const cellsToPush: CellToPush[] = [];
						if (canBoxBePushedUp(board, robotY - 1, robotX - 1, robotX, cellsToPush)) {
							moveBoxesUp(board, cellsToPush);
							// if (index == 5) {
							// 	console.log('cellsToPush', cellsToPush);
							// }
							board[robotY - 1][robotX] = '@';
							board[robotY][robotX] = '.';
							robotY--;
						}
					}
				}
				break;
			case 'v':
				if (robotY < board.length - 1) {
					if (board[robotY + 1][robotX] == '#') {
						break;
					}
					else if (board[robotY + 1][robotX] == '.') {
						board[robotY + 1][robotX] = '@';
						board[robotY][robotX] = '.';
						robotY++;
					}
					else if (board[robotY + 1][robotX] == '[') {
						const cellsToPush: CellToPush[] = [];
						if (canBoxBePushedDown(board, robotY + 1, robotX, robotX + 1, cellsToPush)) {
							moveBoxesDown(board, cellsToPush);
							board[robotY + 1][robotX] = '@';
							board[robotY][robotX] = '.';
							robotY++;
						}
					}
					else if (board[robotY + 1][robotX] == ']') {
						const cellsToPush: CellToPush[] = [];
						if (canBoxBePushedDown(board, robotY + 1, robotX - 1, robotX, cellsToPush)) {
							moveBoxesDown(board, cellsToPush);
							board[robotY + 1][robotX] = '@';
							board[robotY][robotX] = '.';
							robotY++;
						}
					}
				}
				break;
			case '<':
				if (robotX > 1) {
					for (let i = robotX - 1; i >= 0; i--) {
						if (board[robotY][i] == '#') {
							break;
						}
						if (board[robotY][i] == '.') {
							for (let j = i; j < robotX; j++) {
								board[robotY][j] = board[robotY][j + 1];
							}
							board[robotY][robotX] = '.';
							robotX--;
							break;
						}
					}
				}
				break;
			case '>':
				if (robotX < board[0].length - 1) {
					for (let i = robotX + 1; i < board[0].length; i++) {
						if (board[robotY][i] == '#') {
							break;
						}
						if (board[robotY][i] == '.') {
							for (let j = i; j > robotX; j--) {
								board[robotY][j] = board[robotY][j - 1];
							}
							board[robotY][robotX] = '.';
							robotX++;
							break;
						}
					}
				}
				break;
		}
		if (debugMode) {
			console.log(board.map(line => line.join("").replace('@', move)).join("\n"));
		}
	}
	let sumOfAllBoxesLocations = 0;
	for (let y = 0; y < board.length; y++) {
		for (let x = 0; x < board[y].length; x++) {
			if (board[y][x] == '[') {
				sumOfAllBoxesLocations += gpsLocation(x, y);
			}
		}
	}
	return sumOfAllBoxesLocations;
}

interface CellToPush {
	x: number;
	y: number;
	value: string;
}

// WORKS
function canBoxBePushedUp(board: string[][], boxY: number, boxX1: number, boxX2: number, cellsToPush: CellToPush[]): boolean {
	if (board[boxY - 1][boxX1] == '#' || board[boxY - 1][boxX2] == '#') {
		return false;
	}
	if (board[boxY - 1][boxX1] == '.' && board[boxY - 1][boxX2] == '.') {
		cellsToPush.push({ x: boxX1, y: boxY, value: board[boxY][boxX1] });
		cellsToPush.push({ x: boxX2, y: boxY, value: board[boxY][boxX2] });
		return true;
	}
	if (board[boxY - 1][boxX1] == '[') {
		if (canBoxBePushedUp(board, boxY - 1, boxX1, boxX2, cellsToPush)) {
			cellsToPush.push({ x: boxX1, y: boxY, value: board[boxY][boxX1] });
			cellsToPush.push({ x: boxX2, y: boxY, value: board[boxY][boxX2] });
			return true;
		}
	} else {
		let numberOfMustBePushedBoxes = 0;
		let numberOfCanBePushedBoxes = 0;
		if (board[boxY - 1][boxX1] == ']') {
			numberOfMustBePushedBoxes++;
			if (canBoxBePushedUp(board, boxY - 1, boxX1 - 1, boxX1, cellsToPush)) {
				numberOfCanBePushedBoxes++;
			}
		}
		if (board[boxY - 1][boxX2] == '[') {
			numberOfMustBePushedBoxes++;
			if (canBoxBePushedUp(board, boxY - 1, boxX2, boxX2 + 1, cellsToPush)) {
				numberOfCanBePushedBoxes++;
			}
		}
		const canBePushed = numberOfMustBePushedBoxes > 0 && numberOfMustBePushedBoxes == numberOfCanBePushedBoxes;
		if (canBePushed) {
			cellsToPush.push({ x: boxX1, y: boxY, value: board[boxY][boxX1] });
			cellsToPush.push({ x: boxX2, y: boxY, value: board[boxY][boxX2] });
		}
		return canBePushed;
	}
	return false;
}

function canBoxBePushedDown(board: string[][], boxY: number, boxX1: number, boxX2: number, cellsToPush: CellToPush[]): boolean {
	if (board[boxY + 1][boxX1] == '#' || board[boxY + 1][boxX2] == '#') {
		return false;
	}
	if (board[boxY + 1][boxX1] == '.' && board[boxY + 1][boxX2] == '.') {
		cellsToPush.push({ x: boxX1, y: boxY, value: board[boxY][boxX1] });
		cellsToPush.push({ x: boxX2, y: boxY, value: board[boxY][boxX2] });
		return true;
	}
	if (board[boxY + 1][boxX1] == '[') {
		if (canBoxBePushedDown(board, boxY + 1, boxX1, boxX2, cellsToPush)) {
			cellsToPush.push({ x: boxX1, y: boxY, value: board[boxY][boxX1] });
			cellsToPush.push({ x: boxX2, y: boxY, value: board[boxY][boxX2] });
			return true;
		}
	} else {
		let numberOfMustBePushedBoxes = 0;
		let numberOfCanBePushedBoxes = 0;
		if (board[boxY + 1][boxX1] == ']') {
			numberOfMustBePushedBoxes++;
			if (canBoxBePushedDown(board, boxY + 1, boxX1 - 1, boxX1, cellsToPush)) {
				numberOfCanBePushedBoxes++;
			}
		}
		if (board[boxY + 1][boxX2] == '[') {
			numberOfMustBePushedBoxes++;
			if (canBoxBePushedDown(board, boxY + 1, boxX2, boxX2 + 1, cellsToPush)) {
				numberOfCanBePushedBoxes++;
			}
		}
		const canBePushed = numberOfMustBePushedBoxes > 0 && numberOfMustBePushedBoxes == numberOfCanBePushedBoxes;
		if (canBePushed) {
			cellsToPush.push({ x: boxX1, y: boxY, value: board[boxY][boxX1] });
			cellsToPush.push({ x: boxX2, y: boxY, value: board[boxY][boxX2] });
		}
		return canBePushed;
	}
	return false;
}

function moveBoxesUp(board: string[][], cellsToPush: CellToPush[]): void {
	cellsToPush.sort((a, b) => a.y - b.y);
	for (const cell of cellsToPush) {
		board[cell.y - 1][cell.x] = cell.value;
		board[cell.y][cell.x] = '.';
	}
}

function moveBoxesDown(board: string[][], cellsToPush: CellToPush[]): void {
	cellsToPush.sort((a, b) => b.y - a.y);
	for (const cell of cellsToPush) {
		board[cell.y + 1][cell.x] = cell.value;
		board[cell.y][cell.x] = '.';
	}
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `########
				#..O.O.#
				##@.O..#
				#...O..#
				#.#.O..#
				#...O..#
				#......#
				########

				<^^>>>vv<v>>v<<`,
		expected: `2028`
	},
	{
		input: `##########
				#..O..O.O#
				#......O.#
				#.OO..O.O#
				#..O@..O.#
				#O#..O...#
				#O..O..O.#
				#.OO.O.OO#
				#....O...#
				##########

				<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
				vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
				><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
				<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
				^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
				^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
				>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
				<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
				^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
				v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^`,
		expected: `10092`
	}];
	const part2tests: TestCase[] = [
		{
			input: `#######
					#.....#
					#.OOO.#
					#..OO@#
					#..O..#
					#.....#
					#######
		
					<vv<<^^<<^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^`,
			expected: `1036`
		},
		{
			input: `#######
					#...#.#
					#.....#
					#..OO@#
					#..O..#
					#.....#
					#######
		
					<vv<<^^<<^^`,
			expected: `618`
		},
		{
			input: `##########
					#..O..O.O#
					#......O.#
					#.OO..O.O#
					#..O@..O.#
					#O#..O...#
					#O..O..O.#
					#.OO.O.OO#
					#....O...#
					##########

					<vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
					vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
					><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
					<<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
					^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
					^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
					>^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
					<><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
					^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
					v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^`,
			expected: `9021`
		}
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day15_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day15_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day15_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day15_part2(input));
	const part2After = performance.now();

	logSolution(15, 2024, part1Solution, part2Solution);

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

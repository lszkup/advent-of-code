import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 14;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/14/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/14/data.txt
// problem url  : https://adventofcode.com/2024/day/14

const regexForNumber = /((\-)?\d+)/g;

interface Robot {
	robotX: number;
	robotY: number;
}

interface Robot2 {
	robotX: number;
	robotY: number;
	numberOfStepsPerSecondX: number;
	numberOfStepsPerSecondY: number;
}

async function p2024day14_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(x => x.trim()).filter(x => x);
	const spaceWidth = params[0] ?? 101;
	const spaceHeight = params[1] ?? 103;
	const robots: Robot[] = [];
	for (let i = 0; i < lines.length; i++) {
		const [robotX, robotY, stepPerSecondX, stepPerSecondY] = lines[i].match(regexForNumber)!.map(Number);
		const robot: Robot = { robotX: (robotX + stepPerSecondX * 100) % spaceWidth, robotY: (robotY + stepPerSecondY * 100) % spaceHeight };
		if (robot.robotX < 0) {
			robot.robotX += spaceWidth;
		}
		if (robot.robotY < 0) {
			robot.robotY += spaceHeight;
		}
		robots.push(robot);
	}
	let quadrant1 = 0;
	let quadrant2 = 0;
	let quadrant3 = 0;
	let quadrant4 = 0;
	const middleColumn = Math.floor(spaceWidth / 2);
	const middleRow = Math.floor(spaceHeight / 2);
	robots.forEach(robot => {
		if (robot.robotX < middleColumn && robot.robotY < middleRow) {
			quadrant1++;
		} else if (robot.robotX > middleColumn && robot.robotY < middleRow) {
			quadrant2++;
		} else if (robot.robotX > middleColumn && robot.robotY > middleRow) {
			quadrant3++;
		} else if (robot.robotX < middleColumn && robot.robotY > middleRow) {
			quadrant4++;
		}
	});
	return quadrant1 * quadrant2 * quadrant3 * quadrant4;
}

async function p2024day14_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(x => x.trim()).filter(x => x);
	const spaceWidth = params[0] ?? 101;
	const spaceHeight = params[1] ?? 103;
	const robots: Robot2[] = [];
	for (let i = 0; i < lines.length; i++) {
		const [robotX, robotY, numberOfStepsPerSecondX, numberOfStepsPerSecondY] = lines[i].match(regexForNumber)!.map(Number);
		const robot: Robot2 = { robotX, robotY, numberOfStepsPerSecondX, numberOfStepsPerSecondY };
		robots.push(robot);
	}
	const xmasPattern: boolean[][] = Array.from({ length: spaceHeight }, () => Array.from({ length: spaceWidth }, () => false));
	const middleColumn = Math.floor(spaceWidth / 2);
	for (let row = 0; row < spaceHeight; row++) {
		xmasPattern[row][middleColumn] = true;
	}
	for (let row = 0; row <= middleColumn; row++) {
		for (let column = 0; column < row * 2 + 1; column++) {
			xmasPattern[row][middleColumn - column + row] = true;
		}
	}
	let numberOfRobotsInPattern = 0;
	robots.forEach(robot => {
		if (xmasPattern[robot.robotY][robot.robotX]) {
			numberOfRobotsInPattern++;
		}
	});
	await sleep(1000);
	// console.log(xmasPattern.map(row => row.map(cell => cell ? 'X' : '.').join('')).join('\n'));
	let totalNumberOfSeconds = 0;
	const xmasLocalPatternTest: boolean[][] = Array.from({ length: spaceHeight }, () => Array.from({ length: spaceWidth }, () => false));
	robots.forEach(robot => {
		xmasLocalPatternTest[robot.robotY][robot.robotX] = true;
	});
	console.log(xmasLocalPatternTest.map(row => row.map(cell => cell ? 'O' : ' ').join('')).join('\n'));
	let maxNumberOfRobotsInPattern = 0;
	await sleep(2000);
	while (true) {
		const xmasLocalPattern: boolean[][] = Array.from({ length: spaceHeight }, () => Array.from({ length: spaceWidth }, () => false));
		numberOfRobotsInPattern = 0;
		robots.forEach(robot => {
			const [newX, newY] = moveRobot(robot, spaceWidth, spaceHeight);
			if (xmasPattern[newY][newX]) {
				numberOfRobotsInPattern++;
			}
			xmasLocalPattern[newY][newX] = true;
			robot.robotX = newX;
			robot.robotY = newY;
		});
		totalNumberOfSeconds++;
		if (numberOfRobotsInPattern > maxNumberOfRobotsInPattern) {
			maxNumberOfRobotsInPattern = numberOfRobotsInPattern;
			console.log(totalNumberOfSeconds, numberOfRobotsInPattern, maxNumberOfRobotsInPattern);
			console.log(totalNumberOfSeconds, numberOfRobotsInPattern, robots.length);
			console.log(xmasLocalPattern.map(row => row.map(cell => cell ? 'X' : '.').join('')).join('\n'));
			await sleep(1000);
		}
	}

	return totalNumberOfSeconds;
}

function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function moveRobot(robot: Robot2, spaceWidth: number, spaceHeight: number): number[] {
	let newX = (robot.robotX + robot.numberOfStepsPerSecondX) % spaceWidth;
	let newY = (robot.robotY + robot.numberOfStepsPerSecondY) % spaceHeight;
	if (newX < 0) {
		newX += spaceWidth;
	}
	if (newY < 0) {
		newY += spaceHeight;
	}
	return [newX, newY];
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `p=0,4 v=3,-3
				p=6,3 v=-1,-3
				p=10,3 v=-1,2
				p=2,0 v=2,-1
				p=0,0 v=1,3
				p=3,0 v=-2,-2
				p=7,6 v=-1,-3
				p=3,0 v=-1,-2
				p=9,3 v=2,3
				p=7,3 v=-1,2
				p=2,4 v=2,-3
				p=9,5 v=-3,-3`,
		expected: "12",
		extraArgs: [11, 7]
	}];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day14_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day14_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day14_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day14_part2(input));
	const part2After = performance.now();

	logSolution(14, 2024, part1Solution, part2Solution);

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

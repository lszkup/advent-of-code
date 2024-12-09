import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 9;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/09/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/09/data.txt
// problem url  : https://adventofcode.com/2024/day/9

async function p2024day9_part1(input: string, ...params: any[]) {
	const fileSystem: number[] = [];
	const line = input.split("\n")[0];
	const emptyBlockIndexes: number[] = [];
	const fileIndexes: number[] = [];
	let file = true;
	let fileId = 0;
	for (let i = 0; i < line.length; i++) {
		const blockLength = parseInt(line[i]);
		if (file) {
			for (let j = 0; j < blockLength; j++) {
				fileIndexes.push(fileSystem.length);
				fileSystem.push(fileId);
			}
			fileId++;
		} else {
			for (let j = 0; j < blockLength; j++) {
				emptyBlockIndexes.push(fileSystem.length);
				fileSystem.push(-1);
			}
		}
		file = !file;
	}
	// console.log('BEFORE', fileSystem);
	// console.log('emptyBlockIndexes', emptyBlockIndexes);
	// console.log('fileIndexes', fileIndexes);
	let currentEmptyBlockIndex = 0;
	for (let i = fileIndexes.length - 1; i >= 0 && currentEmptyBlockIndex < emptyBlockIndexes.length; i--, currentEmptyBlockIndex++) {
		const freeSpaceIndex = emptyBlockIndexes[currentEmptyBlockIndex];
		const fileIndex = fileIndexes[i];
		if (fileIndex > freeSpaceIndex) {
			fileSystem[freeSpaceIndex] = fileSystem[fileIndex];
			fileSystem[fileIndex] = -1;
		} else { break; }
	}
	//console.log('AFTER', fileSystem);
	const checkSum = fileSystem.reduce((acc, val, index) => {
		if (val >= 0) {
			acc += index * fileSystem[index];
		}
		return acc;
	}, 0);
	return checkSum;
}

interface FileRange {
	startIndex: number;
	length: number;
}

async function p2024day9_part2(input: string, ...params: any[]) {
	const fileSystem: number[] = [];
	const line = input.split("\n")[0];
	const emptyBlockIndexes: number[] = [];
	const fileIndexes: number[] = [];
	const fileRanges: FileRange[] = []
	let file = true;
	let fileId = 0;
	for (let i = 0; i < line.length; i++) {
		const blockLength = parseInt(line[i]);
		if (file) {
			if (blockLength > 0) {
				fileRanges.push({ startIndex: fileSystem.length, length: blockLength });
			}
			for (let j = 0; j < blockLength; j++) {
				fileIndexes.push(fileSystem.length);
				fileSystem.push(fileId);
			}
			fileId++;
		} else {
			for (let j = 0; j < blockLength; j++) {
				emptyBlockIndexes.push(fileSystem.length);
				fileSystem.push(-1);
			}
		}
		file = !file;
	}
	//console.log('BEFORE', fileSystem);
	//console.log('FILE_RANGES', fileRanges);
	for (let i = fileRanges.length - 1; i >= 0; i--) {
		const fileRange = fileRanges[i];
		let lengthOfContinousBlock = 0;
		let continousBlockStartindex = -1;
		for (let j = 0; j < fileSystem.length - fileRange.length; j++) {
			if (fileSystem[j] === -1) {
				if (continousBlockStartindex === -1) {
					continousBlockStartindex = j;
				}
				lengthOfContinousBlock++;
			} else {
				lengthOfContinousBlock = 0;
				continousBlockStartindex = -1;
			}
			if (lengthOfContinousBlock === fileRange.length) {
				if (continousBlockStartindex < fileRange.startIndex) {
					for (let k = 0; k < fileRange.length; k++) {
						fileSystem[continousBlockStartindex + k] = fileSystem[fileRange.startIndex + k];
						fileSystem[fileRange.startIndex + k] = -1;
					}
				}
				break;
			}
		}
	}
	//console.log('AFTER', fileSystem);
	const checkSum = fileSystem.reduce((acc, val, index) => {
		if (val >= 0) {
			acc += index * fileSystem[index];
		}
		return acc;
	}, 0);
	return checkSum;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: "2333133121414131402",
		expected: "1928",
		extraArgs: []
	}];
	const part2tests: TestCase[] = [{
		input: "2333133121414131402",
		expected: "2858",
		extraArgs: []
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day9_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day9_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day9_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day9_part2(input));
	const part2After = performance.now();

	logSolution(9, 2024, part1Solution, part2Solution);

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

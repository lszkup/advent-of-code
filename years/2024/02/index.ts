import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 2;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/02/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/02/data.txt
// problem url  : https://adventofcode.com/2024/day/2

interface SafetyAssessment {
	isSafe: boolean;
	problematicElementIndex: number | null;
}

function isReportSafe(report: number[]): SafetyAssessment {
	const isGoingUp = report[0] < report[1];
	var problematicElementIndex: number | null = null;
	const isItSafe = report.every((value, index, array) => {
		if (index === 0) return true;
		const difference = value - array[index - 1];
		const absoluteDifference = Math.abs(value - array[index - 1]);
		const isTheDifferenceWithinTheLimit = absoluteDifference <= 3 && absoluteDifference >= 1;
		const isItGoingTheRightWay = isGoingUp ? difference > 0 : difference < 0;
		const safe = isTheDifferenceWithinTheLimit && isItGoingTheRightWay;
		if (!safe) problematicElementIndex = index;
		return safe;
	});
	return {
		isSafe: isItSafe,
		problematicElementIndex: problematicElementIndex
	}
}

async function p2024day2_part1(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const inputData: number[][] = lines.map(line => line.trim().split(" ").filter(x => x.trim().length > 0).map(x => Number(x)));
	const numberOfSafeReports = inputData.reduce((acc, currentReport, _) => {
		const isItSafe = isReportSafe(currentReport).isSafe;
		return acc + (isItSafe ? 1 : 0);
	}, 0);
	return numberOfSafeReports;
}

async function p2024day2_part2(input: string, ...params: any[]) {
	const lines = input.split("\n");
	const inputData: number[][] = lines.map(line => line.trim().split(" ").filter(x => x.trim().length > 0).map(x => Number(x)));
	const numberOfSafeReportsProblemDampenerVersion = inputData.reduce((acc, currentReport, _) => {
		const { isSafe, problematicElementIndex } = isReportSafe(currentReport);
		if (!isSafe) {
			const indexesToCheck = [problematicElementIndex! - 2, problematicElementIndex! - 1, problematicElementIndex!,]
				.filter(index => index >= 0 && index < currentReport.length);
			const isSafeAfterRemovingOneStep = indexesToCheck.some((index) => {
				const reportWithoutProblematicElement = currentReport.slice(0, index).concat(currentReport.slice(index + 1));
				return isReportSafe(reportWithoutProblematicElement).isSafe;
			});
			return acc + (isSafeAfterRemovingOneStep ? 1 : 0);
		}
		return acc + 1;
	}, 0);
	return numberOfSafeReportsProblemDampenerVersion;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `7 6 4 2 1
					1 2 7 8 9
					9 7 6 2 1
					1 3 2 4 5
					8 6 4 4 1
					1 3 6 7 9`,
			extraArgs: [],
			expected: `2`,
		}
	];
	const part2tests: TestCase[] = [{
		input: `7 6 4 2 1
				1 2 7 8 9
				9 7 6 2 1
				1 3 2 4 5
				8 6 4 4 1
				1 3 6 7 9`,
		extraArgs: [],
		expected: `4`,
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day2_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day2_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day2_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day2_part2(input));
	const part2After = performance.now();

	logSolution(2, 2024, part1Solution, part2Solution);

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

import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import { ExpressionParser } from "expressionparser";
import { ExpressionParserOptions, ExpressionThunk } from "expressionparser/dist/ExpressionParser";

const YEAR = 2024;
const DAY = 7;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/07/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/07/data.txt
// problem url  : https://adventofcode.com/2024/day/7

interface PuzzleTestCase {
	result: number;
	numbers: number[];
}

async function p2024day7_part1(input: string, ...params: any[]) {
	const testCases: PuzzleTestCase[] = input.split("\n").map(line => {
		const [resultRaw, numbersRaw] = line.split(":").map(s => s.trim());
		const result = parseInt(resultRaw);
		const numbers = numbersRaw.split(" ").map(n => parseInt(n));
		return { result, numbers };
	});
	const totalCalibrations = testCases.reduce((acc, testCase) => {
		//console.log(testCase);
		return acc + (testOperators(testCase, 1, testCase.numbers[0]) ? testCase.result : 0);
	}, 0);
	return totalCalibrations;
}

function testOperators(testCase: PuzzleTestCase, numberIndex: number, currentResult: number): boolean {
	//console.log(`Testing ${currentResult} with ${testCase.numbers[numberIndex]} at index ${numberIndex}`);
	if (currentResult > testCase.result) {
		//console.log(`Result ${currentResult} is greater than ${testCase.result}`);
		return false;
	}
	if (numberIndex >= testCase.numbers.length) {
		//console.log(`Last number ${currentResult == testCase.result}`);
		return (currentResult == testCase.result);
	}

	const number = testCase.numbers[numberIndex];
	return testOperators(testCase, numberIndex + 1, currentResult + number) ||
		testOperators(testCase, numberIndex + 1, currentResult * number);
}

async function p2024day7_part2(input: string, ...params: any[]) {
	const testCases: PuzzleTestCase[] = input.split("\n").map(line => {
		const [resultRaw, numbersRaw] = line.split(":").map(s => s.trim());
		const result = parseInt(resultRaw);
		const numbers = numbersRaw.split(" ").map(n => parseInt(n));
		return { result, numbers };
	});
	const arithmeticLanguage: ExpressionParserOptions = {
		INFIX_OPS: {
			'+': function (a: any, b: any) {
				return a + b;
			},
			'*': function (a: any, b: any) {
				return a * b;
			},
			'||': function (a: any, b: any) {
				return parseInt(a.toString() + b.toString());
			}
		},
		PRECEDENCE: [['||', '+', '*']],
		GROUP_OPEN: '(',
		GROUP_CLOSE: ')',
		SEPARATOR: ' ',
		SYMBOLS: ['(', ')', '+', '-', '*', '/', ',', '||'],
		AMBIGUOUS: {},
		PREFIX_OPS: {},
		ESCAPE_CHAR: '\\',
		LITERAL_OPEN: '"',
		LITERAL_CLOSE: '"',

		termDelegate: function (term: string) {
			return parseInt(term);
		}
	};
	const expressionParser = new ExpressionParser(arithmeticLanguage);
	const totalCalibrations = testCases.reduce((acc, testCase) => {
		return acc + (testOperators2(testCase, 1, testCase.numbers[0].toString(), expressionParser) ? testCase.result : 0);
	}, 0);
	return totalCalibrations;
}

function testOperators2(testCase: PuzzleTestCase, numberIndex: number, currentResult: string, expressionParser: ExpressionParser): boolean {
	if (numberIndex >= testCase.numbers.length) {
		const expression = expressionParser.expressionToRpn(currentResult);
		return (testCase.result == evaluateReversePolishNotationExpression(expression));
	}

	const number = testCase.numbers[numberIndex];
	return testOperators2(testCase, numberIndex + 1, `${currentResult} + ${number}`, expressionParser) ||
		testOperators2(testCase, numberIndex + 1, `${currentResult} * ${number}`, expressionParser) ||
		testOperators2(testCase, numberIndex + 1, `${currentResult} || ${number}`, expressionParser);
}

function evaluateReversePolishNotationExpression(expression: string[]): number {
	const stack: number[] = [];
	for (const token of expression) {
		if (token === '+' || token === '*' || token === '||') {
			const b = stack.pop()!;
			const a = stack.pop()!;
			switch (token) {
				case '+':
					stack.push(a + b);
					break;
				case '*':
					stack.push(a * b);
					break;
				case '||':
					stack.push(parseInt(a.toString() + b.toString()));
					break;
			}
		} else {
			stack.push(parseInt(token));
		}
	}
	return stack[0];
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `190: 10 19
				3267: 81 40 27
				83: 17 5
				156: 15 6
				7290: 6 8 6 15
				161011: 16 10 13
				192: 17 8 14
				21037: 9 7 18 13
				292: 11 6 16 20`,
		expected: `3749`
	}, {
		input: `1: 1`,
		expected: `1`
	}];
	const part2tests: TestCase[] = [
		{
			input: `190: 10 19
			3267: 81 40 27
			83: 17 5
			156: 15 6
			7290: 6 8 6 15
			161011: 16 10 13
			192: 17 8 14
			21037: 9 7 18 13
			292: 11 6 16 20`,
			expected: `11387`
		}, {
			input: `1: 1`,
			expected: `1`
		}, {
			input: `123456789: 1 2 3 4 5 6 7 8 9`,
			expected: `123456789`
		}, {
			input: `363: 1 1 33
					363: 1 1 33`,
			expected: `726`
		}, {
			input: `156: 15 6`,
			expected: `156`
		}, {
			input: `7290: 6 8 6 15`,
			expected: `7290`
		}, {
			input: `192: 17 8 14`,
			expected: `192`
		}
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day7_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day7_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day7_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day7_part2(input));
	const part2After = performance.now();

	logSolution(7, 2024, part1Solution, part2Solution);

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
function ExpressionValue(): import("expressionparser/dist/ExpressionParser").ExpressionValue {
	throw new Error("Function not implemented.");
}


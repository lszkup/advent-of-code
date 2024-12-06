import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import TopologicalSort from 'topological-sort';

const YEAR = 2024;
const DAY = 5;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/05/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/05/data.txt
// problem url  : https://adventofcode.com/2024/day/5

async function p2024day5_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => line.trim());
	const pageOrderRules = lines.filter(line => line.includes("|")).map(line => line.split("|").map(Number));
	const updates = lines.filter(line => line.includes(",")).map(line => line.split(",").map(Number));
	const middlePageNumberInGoodUpdate = updates.reduce((acc, update) => {
		const pagesAsMap: { [key: number]: number } = update.reduce((acc, page, index) => {
			return { ...acc, [page]: index };
		}, {});
		const allOrderRulesOk = pageOrderRules.every(rule => {
			const [page1, page2] = rule;
			const page1Index = pagesAsMap[page1];
			const page2Index = pagesAsMap[page2];
			if (page1Index != undefined && page2Index != undefined) {
				return page1Index < page2Index;
			}
			return true;
		});
		return acc + (allOrderRulesOk ? update[update.length >> 1] : 0);
	}, 0);
	return middlePageNumberInGoodUpdate;
}

async function p2024day5_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(line => line.trim());
	const pageOrderRules = lines.filter(line => line.includes("|")).map(line => line.split("|").map(Number));
	const updates = lines.filter(line => line.includes(",")).map(line => line.split(",").map(Number));
	const badUpdates: number[][] = [];
	updates.forEach(update => {
		const pagesAsMap: { [key: number]: number } = update.reduce((acc, page, index) => {
			return { ...acc, [page]: index };
		}, {});
		const allOrderRulesOk = pageOrderRules.every(rule => {
			const [page1, page2] = rule;
			const page1Index = pagesAsMap[page1];
			const page2Index = pagesAsMap[page2];
			if (page1Index != undefined && page2Index != undefined) {
				return page1Index < page2Index;
			}
			return true;
		});
		if (!allOrderRulesOk) {
			badUpdates.push(update);
		}
	});
	const theNumber = badUpdates.reduce((acc, update) => {
		const rulesThatApply = pageOrderRules.filter(rule => {
			const [page1, page2] = rule;
			const page1Index = update.indexOf(page1);
			const page2Index = update.indexOf(page2);
			return page1Index >= 0 && page2Index >= 0;
		});
		const setOfPages = rulesThatApply.reduce((acc, rule) => {
			const [page1, page2] = rule;
			return new Set([...acc, page1, page2]);
		}, new Set<number>());
		const nodes = new Map<number, string>();
		setOfPages.forEach(page => {
			nodes.set(page, "test");
		});
		const sortOp = new TopologicalSort<number, string>(nodes);
		rulesThatApply.forEach(rule => {
			const [page1, page2] = rule;
			sortOp.addEdge(page1, page2);
		});
		const sorted = sortOp.sort();
		const sortedKeys = [...sorted.keys()];
		return acc + sortedKeys[sortedKeys.length >> 1];
	}, 0);
	return theNumber;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`,
		expected: `143`
	}];
	const part2tests: TestCase[] = [{
		input: `47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`,
		expected: `123`
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day5_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day5_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day5_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day5_part2(input));
	const part2After = performance.now();

	logSolution(5, 2024, part1Solution, part2Solution);

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

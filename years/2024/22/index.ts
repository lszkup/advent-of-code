import _, { get } from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 22;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/22/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/22/data.txt
// problem url  : https://adventofcode.com/2024/day/22

function mix(secret: number, value: number): number {
	return secret ^ value;
}

function prune(secret: number): number {
	secret = secret % 16777216;
	if (secret < 0) {
		secret += 16777216;
	}
	return secret;
}

function getNextSecret(secret: number): number {
	// Step 1: Multiply by 64, mix, and prune
	secret = prune(mix(secret, secret * 64));

	// Step 2: Divide by 32 (integer division), mix, and prune
	secret = prune(mix(secret, Math.floor(secret / 32)));

	// Step 3: Multiply by 2048, mix, and prune
	secret = prune(mix(secret, secret * 2048));

	return secret;
}

function get2000thSecret(initialSecret: number): number {
	let secret = initialSecret;
	for (let i = 0; i < 2000; i++) {
		secret = getNextSecret(secret);
	}
	return secret;
}

function get2000thSecrets(initialSecret: number): number[] {
	const secrets = [initialSecret];
	let secret = initialSecret;
	for (let i = 0; i < 2000; i++) {
		secret = getNextSecret(secret);
		secrets.push(secret);
	}
	return secrets;
}

function sum2000thSecrets(initialSecrets: number[]): number {
	return initialSecrets.reduce((sum, secret) => sum + get2000thSecret(secret), 0);
}

async function p2024day22_part1(input: string, ...params: any[]) {
	const initialSecrets = input.split("\n").map(Number);
	const result = sum2000thSecrets(initialSecrets);
	return result;
}

type EncodedSequence = string
type Price = number;

interface Buyer {
	secrets: number[];
	prices: number[];
	priceChanges: number[];
	sequenceToPrice: Map<EncodedSequence, Price>;
}

function encodeSequence(secrets: number[]): EncodedSequence {
	return secrets.join(",");
}

async function p2024day22_part2(input: string, ...params: any[]) {
	const initialSecrets = input.split("\n").map(Number);
	const buyers: Buyer[] = initialSecrets.map(secret => ({
		secrets: get2000thSecrets(secret),
		prices: [],
		priceChanges: [],
		sequenceToPrice: new Map()
	}));
	const sequenceToTotalPrice: Map<EncodedSequence, Price> = new Map();
	for (const buyer of buyers) {
		for (let i = 1; i < buyer.secrets.length; i++) {
			const previousPrice = buyer.secrets[i - 1] % 10;
			const currentPrice = buyer.secrets[i] % 10;
			buyer.prices.push(currentPrice);
			buyer.priceChanges.push(currentPrice - previousPrice);
		}
		//console.log(buyer.secrets[0], buyer.prices.slice(0, 10), buyer.priceChanges.slice(0, 10));
		const sequence = [];
		for (let i = 0; i < buyer.priceChanges.length; i++) {
			if (sequence.length >= 4) {
				sequence.shift();
			}
			sequence.push(buyer.priceChanges[i]);
			if (sequence.length == 4) {
				const encodedSequence = encodeSequence(sequence);
				if (!buyer.sequenceToPrice.has(encodedSequence)) {
					const currentPrice = buyer.prices[i];
					if (encodedSequence == '-9,9,-1,0') {
						console.log(buyer.secrets[0], i, encodedSequence, currentPrice);
					}
					buyer.sequenceToPrice.set(encodedSequence, currentPrice);
					const currentTotalPrice = sequenceToTotalPrice.get(encodedSequence) || 0;
					sequenceToTotalPrice.set(encodedSequence, currentTotalPrice + currentPrice);
				}
			}
		}
	}
	//console.log('sequenceToTotalPrice', sequenceToTotalPrice);
	const bestSequence = [...sequenceToTotalPrice.entries()].reduce((best, [sequence, price]) => {
		if (price > best) {
			console.log('new best', sequence, price);
			return price;
		}
		return best;
	}, 0);
	return bestSequence;
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `1
10
100
2024`, expected: `37327623`
	}];
	const part2tests: TestCase[] = [{
		input: `1
10
100
2024`, expected: `23`
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day22_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day22_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day22_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day22_part2(input));
	const part2After = performance.now();

	logSolution(22, 2024, part1Solution, part2Solution);

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

import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 24;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/24/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/24/data.txt
// problem url  : https://adventofcode.com/2024/day/24

type GateOperation = {
	type: 'AND' | 'OR' | 'XOR';
	input1: string;
	input2: string;
	output: string;
};

class GateSystem {
	private wireValues: Record<string, number> = {};
	private gateOperations: GateOperation[] = [];
	private evaluatedWires: Set<string> = new Set();

	constructor(initialValues: string[], operations: string[]) {
		this.parseInitialValues(initialValues);
		this.parseOperations(operations);
	}

	// Parse initial wire values (e.g., x00: 1)
	private parseInitialValues(initialValues: string[]): void {
		initialValues.forEach(line => {
			const [wire, value] = line.split(':').map(s => s.trim());
			this.wireValues[wire] = parseInt(value);
			this.evaluatedWires.add(wire);
		});
	}

	// Parse gate operations (e.g., x00 AND y00 -> z00)
	private parseOperations(operations: string[]): void {
		operations.forEach(line => {
			const [lhs, rhs] = line.split('->').map(s => s.trim());
			const [input1, gateType, input2] = lhs.split(' ').map(s => s.trim());
			this.gateOperations.push({
				type: gateType as 'AND' | 'OR' | 'XOR',
				input1,
				input2,
				output: rhs,
			});
		});
	}

	// Evaluate a wire value (either from initial value or gate output)
	private evaluateWire(wire: string): number {
		if (this.evaluatedWires.has(wire)) {
			return this.wireValues[wire];
		}

		// Find the gate operation that produces this wire
		const operation = this.gateOperations.find(op => op.output === wire);
		if (!operation) {
			throw new Error(`Wire ${wire} is not connected to any gate.`);
		}

		// Evaluate input1 and input2
		const input1Value = this.evaluateWire(operation.input1);
		const input2Value = this.evaluateWire(operation.input2);

		// Compute the result of the gate operation
		let result: number;
		switch (operation.type) {
			case 'AND':
				result = input1Value & input2Value;
				break;
			case 'OR':
				result = input1Value | input2Value;
				break;
			case 'XOR':
				result = input1Value ^ input2Value;
				break;
			default:
				throw new Error(`Unknown gate type: ${operation.type}`);
		}

		// Store the result and mark this wire as evaluated
		this.wireValues[wire] = result;
		this.evaluatedWires.add(wire);

		return result;
	}

	// Get the final result by evaluating all wires starting with "z"
	public getFinalResult(): number {
		let binaryString = '';
		for (let i = 0; ; i++) {
			const wire = `z${String(i).padStart(2, '0')}`;
			try {
				const wireValue = this.evaluateWire(wire);
				binaryString = wireValue + binaryString;
			} catch (e) {
				// No more z wires, break the loop
				break;
			}
		}
		return parseInt(binaryString, 2);
	}
}

async function p2024day24_part1(input: string, ...params: any[]) {
	const lines = input.split('\n').map(s => s.trim()).filter(s => s.length > 0);
	const initialValues = lines.filter(line => line.includes(':'));
	const operations = lines.filter(line => line.includes('->'));
	const gateSystem = new GateSystem(initialValues, operations);
	const result = gateSystem.getFinalResult();
	return result;
}

async function p2024day24_part2(input: string, ...params: any[]) {
	return "Not implemented";
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `x00: 1
x01: 0
x02: 1
x03: 1
x04: 0
y00: 1
y01: 1
y02: 1
y03: 1
y04: 1

ntg XOR fgs -> mjb
y02 OR x01 -> tnw
kwq OR kpj -> z05
x00 OR x03 -> fst
tgd XOR rvg -> z01
vdt OR tnw -> bfw
bfw AND frj -> z10
ffh OR nrd -> bqk
y00 AND y03 -> djm
y03 OR y00 -> psh
bqk OR frj -> z08
tnw OR fst -> frj
gnj AND tgd -> z11
bfw XOR mjb -> z00
x03 OR x00 -> vdt
gnj AND wpb -> z02
x04 AND y00 -> kjc
djm OR pbm -> qhw
nrd AND vdt -> hwm
kjc AND fst -> rvg
y04 OR y02 -> fgs
y01 AND x02 -> pbm
ntg OR kjc -> kwq
psh XOR fgs -> tgd
qhw XOR tgd -> z09
pbm OR djm -> kpj
x03 XOR y03 -> ffh
x00 XOR y04 -> ntg
bfw OR bqk -> z06
nrd XOR fgs -> wpb
frj XOR qhw -> z04
bqk OR frj -> z07
y03 OR x01 -> nrd
hwm AND bqk -> z03
tgd XOR rvg -> z12
tnw OR pbm -> gnj`,
			expected: "2024"
		}
	];
	const part2tests: TestCase[] = [];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day24_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day24_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day24_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day24_part2(input));
	const part2After = performance.now();

	logSolution(24, 2024, part1Solution, part2Solution);

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

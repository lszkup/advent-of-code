import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";

const YEAR = 2024;
const DAY = 17;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/17/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/17/data.txt
// problem url  : https://adventofcode.com/2024/day/17

const regexForNumber = /(\d+)/g;

interface Machine {
	instructionPointer: number;
	program: number[];
	registerA: number;
	registerB: number;
	registerC: number;
	output: number[];
}

async function p2024day17_part1(input: string, ...params: any[]) {
	const lines = input.split("\n").map(x => x.trim());
	const machine: Machine = {
		instructionPointer: 0,
		program: lines[4].substring("Program: ".length).split(',').map(Number),
		registerA: Number(lines[0].match(regexForNumber)![0]),
		registerB: Number(lines[1].match(regexForNumber)![0]),
		registerC: Number(lines[2].match(regexForNumber)![0]),
		output: []
	};

	//console.log(`Program: ${machine.program}, IP: ${machine.instructionPointer}, A: ${machine.registerA}, B: ${machine.registerB}, C: ${machine.registerC}`);

	let interation = 0;
	while (machine.instructionPointer < machine.program.length) {
		interation++;
		performOperation(machine);
	}
	//console.log(`Iteration ${interation}, IP: ${machine.instructionPointer}, A: ${machine.registerA}, B: ${machine.registerB}, C: ${machine.registerC}, Output: ${machine.output}`);

	return machine.output.join(',');
}

function getOperandValue(machine: Machine, operand: number): number {
	if (operand >= 0 && operand <= 3) {
		return operand;
	} else if (operand == 4) {
		return machine.registerA;
	} else if (operand == 5) {
		return machine.registerB;
	} else if (operand == 6) {
		return machine.registerC;
	}
	console.log(`Invalid operand: ${operand}!!!!!!!!!`);
	return -1;
}

function performOperation(machine: Machine): void {
	const operation = machine.program[machine.instructionPointer];
	const literalOperand = machine.program[machine.instructionPointer + 1];
	const operand = getOperandValue(machine, literalOperand);

	/*
	The adv instruction (opcode 0) performs division. The numerator is the value in the A register.
	The denominator is found by raising 2 to the power of the instruction's combo operand.
	(So, an operand of 2 would divide A by 4 (2^2); an operand of 5 would divide A by 2^B.)
	The result of the division operation is truncated to an integer and then written to the A register.
	*/
	if (operation == 0) {
		machine.registerA = Math.trunc(machine.registerA / Math.pow(2, operand));
	}

	/*The bxl instruction (opcode 1) calculates the bitwise XOR of register B and the instruction's literal operand, then stores the result in register B.*/
	if (operation == 1) {
		machine.registerB = machine.registerB ^ literalOperand;
	}

	/*The bst instruction (opcode 2) calculates the value of its combo operand modulo 8 (thereby keeping only its lowest 3 bits), then writes that value to the B register.*/
	if (operation == 2) {
		machine.registerB = operand % 8;
	}

	/*The jnz instruction (opcode 3) does nothing if the A register is 0. However, if the A register is not zero, it jumps by setting the instruction pointer to the value of its literal operand;
	if this instruction jumps, the instruction pointer is not increased by 2 after this instruction.*/
	if (operation == 3) {
		if (machine.registerA != 0) {
			machine.instructionPointer = literalOperand;
			return;
		}
	}

	/*The bxc instruction (opcode 4) calculates the bitwise XOR of register B and register C, then stores the result in register B. (For legacy reasons, this instruction reads an operand but ignores it.)*/
	if (operation == 4) {
		machine.registerB = machine.registerB ^ machine.registerC;
	}

	/*The out instruction (opcode 5) calculates the value of its combo operand modulo 8, then outputs that value. (If a program outputs multiple values, they are separated by commas.)*/
	if (operation == 5) {
		machine.output.push(operand % 8);
	}

	/*The bdv instruction (opcode 6) works exactly like the adv instruction except that the result is stored in the B register. (The numerator is still read from the A register.)*/
	if (operation == 6) {
		machine.registerB = Math.trunc(machine.registerA / Math.pow(2, operand));
	}

	/*The cdv instruction (opcode 7) works exactly like the adv instruction except that the result is stored in the C register. (The numerator is still read from the A register.)*/
	if (operation == 7) {
		machine.registerC = Math.trunc(machine.registerA / Math.pow(2, operand));
	}

	machine.instructionPointer += 2;
}

let longestOutput: number = 0;

function performOperation2(machine: Machine, startingRegisterA: number): boolean {
	const operation = machine.program[machine.instructionPointer];
	const literalOperand = machine.program[machine.instructionPointer + 1];
	const operand = getOperandValue(machine, literalOperand);

	//console.log('Operation:', operation, 'Operand:', operand, 'Literal Operand:', literalOperand, 'Register A:', machine.registerA, 'Register B:', machine.registerB, 'Register C:', machine.registerC, 'Output:', machine.output.join(','));

	/*
	The adv instruction (opcode 0) performs division. The numerator is the value in the A register.
	The denominator is found by raising 2 to the power of the instruction's combo operand.
	(So, an operand of 2 would divide A by 4 (2^2); an operand of 5 would divide A by 2^B.)
	The result of the division operation is truncated to an integer and then written to the A register.
	*/
	if (operation == 0) {
		machine.registerA = Math.trunc(machine.registerA / Math.pow(2, operand));
	}

	/*The bxl instruction (opcode 1) calculates the bitwise XOR of register B and the instruction's literal operand, then stores the result in register B.*/
	if (operation == 1) {
		machine.registerB = machine.registerB ^ literalOperand;
	}

	/*The bst instruction (opcode 2) calculates the value of its combo operand modulo 8 (thereby keeping only its lowest 3 bits), then writes that value to the B register.*/
	if (operation == 2) {
		machine.registerB = operand % 8;
	}

	/*The jnz instruction (opcode 3) does nothing if the A register is 0. However, if the A register is not zero, it jumps by setting the instruction pointer to the value of its literal operand;
	if this instruction jumps, the instruction pointer is not increased by 2 after this instruction.*/
	if (operation == 3) {
		if (machine.registerA != 0) {
			machine.instructionPointer = literalOperand;
			//console.log(`JUMP: Register A: ${machine.registerA}, Register B: ${machine.registerB}, Register C: ${machine.registerC}, Output: ${machine.output.join(',')}, Output Length: ${machine.output.length}`);
			return true;
		}
		//console.log(`NO JUMP: Register A: ${machine.registerA}, Register B: ${machine.registerB}, Register C: ${machine.registerC}, Output: ${machine.output.join(',')}, Output Length: ${machine.output.length}`);
	}

	/*The bxc instruction (opcode 4) calculates the bitwise XOR of register B and register C, then stores the result in register B. (For legacy reasons, this instruction reads an operand but ignores it.)*/
	if (operation == 4) {
		machine.registerB = machine.registerB ^ machine.registerC;
	}

	/*The out instruction (opcode 5) calculates the value of its combo operand modulo 8, then outputs that value. (If a program outputs multiple values, they are separated by commas.)*/
	if (operation == 5) {
		const printOutValue = operand % 8;
		machine.output.push(printOutValue);
		//console.log(`LOG: Operand: ${operand}, Print Out Value: ${printOutValue}, Register A: ${machine.registerA}, Register B: ${machine.registerB}, Register C: ${machine.registerC}, Output: ${machine.output.join(',')}, Output Length: ${machine.output.length}`);
		if (machine.output[machine.output.length - 1] != machine.program[machine.output.length - 1]) {
			if ((machine.output.length - 1) > longestOutput) {
				longestOutput = machine.output.length - 1;
				console.log(`Longest output: ${longestOutput}, Starting Register A: ${startingRegisterA}, Output: ${machine.output.join(',')}`);
			}
			return false;
		}
	}

	/*The bdv instruction (opcode 6) works exactly like the adv instruction except that the result is stored in the B register. (The numerator is still read from the A register.)*/
	if (operation == 6) {
		machine.registerB = Math.trunc(machine.registerA / Math.pow(2, operand));
	}

	/*The cdv instruction (opcode 7) works exactly like the adv instruction except that the result is stored in the C register. (The numerator is still read from the A register.)*/
	if (operation == 7) {
		machine.registerC = Math.trunc(machine.registerA / Math.pow(2, operand));
	}

	machine.instructionPointer += 2;
	return true;
}

async function p2024day17_part2(input: string, ...params: any[]) {
	const lines = input.split("\n").map(x => x.trim());
	const originalMachine: Machine = {
		instructionPointer: 0,
		program: lines[4].substring("Program: ".length).split(',').map(Number),
		registerA: Number(lines[0].match(regexForNumber)![0]),
		registerB: Number(lines[1].match(regexForNumber)![0]),
		registerC: Number(lines[2].match(regexForNumber)![0]),
		output: []
	};
	let registerA = 108172640200513689275202126656;
	longestOutput = 0;
	while (true) {

		const machine: Machine = {
			instructionPointer: 0,
			program: originalMachine.program,
			registerA: registerA,
			registerB: originalMachine.registerB,
			registerC: originalMachine.registerC,
			output: []
		};
		while (machine.instructionPointer < machine.program.length && machine.output.length <= originalMachine.program.length) {
			if (!performOperation2(machine, registerA)) {
				break;
			}
		}
		//console.log(`Machine Program: ${machine.program}, Machine Program Length: ${machine.program.length}`);
		if (machine.output.length == originalMachine.program.length &&
			machine.output.join(',') == originalMachine.program.join(',')) {
			console.log(`Found register A: ${registerA}, Output: ${machine.output.join(',')}`);
			break;
		}
		registerA++;
	}
	return registerA;
}

async function run() {
	const part1tests: TestCase[] = [
		{
			input: `Register A: 729
					Register B: 0
					Register C: 0

					Program: 0,1,5,4,3,0`,
			expected: "4,6,3,5,6,3,5,2,1,0",
		},
		{
			input: `Register A: 0
					Register B: 0
					Register C: 9

					Program: 2,6`,
			expected: "",
		},
		{
			input: `Register A: 10
					Register B: 0
					Register C: 0

					Program: 5,0,5,1,5,4`,
			expected: "0,1,2",
		},
		{
			input: `Register A: 2024
					Register B: 0
					Register C: 0

					Program: 0,1,5,4,3,0`,
			expected: "4,2,5,6,7,7,7,7,3,1,0",
		},
		{
			input: `Register A: 0
					Register B: 2024
					Register C: 43690

					Program: 4,0`,
			expected: "",
		}
	];
	const part2tests: TestCase[] = [
		// 		{
		// 		input: `Register A: 2024
		// Register B: 0
		// Register C: 0

		// Program: 0,3,5,4,3,0`,
		// 		expected: "117440",
		// 	}
	];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day17_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day17_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day17_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day17_part2(input));
	const part2After = performance.now();

	logSolution(17, 2024, part1Solution, part2Solution);

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

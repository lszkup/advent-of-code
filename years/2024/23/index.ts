import _ from "lodash";
import * as util from "../../../util/util";
import * as test from "../../../util/test";
import chalk from "chalk";
import { log, logSolution, trace } from "../../../util/log";
import { performance } from "perf_hooks";
import { normalizeTestCases } from "../../../util/test";
import BronKerbosch from '@seregpie/bron-kerbosch';

const YEAR = 2024;
const DAY = 23;

// solution path: /Users/lszkup/Development/advent-of-code/years/2024/23/index.ts
// data path    : /Users/lszkup/Development/advent-of-code/years/2024/23/data.txt
// problem url  : https://adventofcode.com/2024/day/23

function countTrianglesWithT(edges: string[]): number {
	// 1. Build an adjacency map
	//    Key = computer name (e.g. "kh"), value = set of connected nodes
	const adjacencyMap = new Map<string, Set<string>>();

	// Helper: ensure both directions kh->tc and tc->kh
	const addEdge = (a: string, b: string) => {
		if (!adjacencyMap.has(a)) {
			adjacencyMap.set(a, new Set<string>());
		}
		adjacencyMap.get(a)!.add(b);
	};

	edges.forEach(edge => {
		const [n1, n2] = edge.split("-");
		addEdge(n1, n2);
		addEdge(n2, n1);
	});

	// 2. Collect all unique computers (vertices)
	const allComputers = Array.from(adjacencyMap.keys());
	// Optional: sort them if you want predictable ordering of triangles
	allComputers.sort();

	// 3. Find all triangles
	//    A triangle is any combination of three distinct nodes x, y, z
	//    such that all edges x-y, y-z, x-z exist.
	const triangles: string[][] = [];

	for (let i = 0; i < allComputers.length; i++) {
		for (let j = i + 1; j < allComputers.length; j++) {
			for (let k = j + 1; k < allComputers.length; k++) {
				const a = allComputers[i];
				const b = allComputers[j];
				const c = allComputers[k];

				// Check if a-b, b-c, a-c are all edges
				if (
					adjacencyMap.get(a)?.has(b) &&
					adjacencyMap.get(b)?.has(c) &&
					adjacencyMap.get(a)?.has(c)
				) {
					triangles.push([a, b, c]);
				}
			}
		}
	}

	// 4. Filter for those that contain at least one computer starting with "t"
	const trianglesWithT = triangles.filter(triangle =>
		triangle.some(node => node.startsWith("t"))
	);

	// 5. Return the count
	return trianglesWithT.length;
}

async function p2024day23_part1(input: string, ...params: any[]) {
	const computerEdges = input.split("\n");
	return countTrianglesWithT(computerEdges);
}

async function p2024day23_part2(input: string, ...params: any[]) {
	const computerEdges: Array<string[]> = input.split("\n").map(edge => edge.split("-"));
	let cliques = BronKerbosch(computerEdges as any);
	let maxCliqueSize = 0;
	let maxClique: string[] = [];
	for (let i = 0; i < cliques.length; i++) {
		if (cliques[i].length > maxCliqueSize) {
			maxCliqueSize = cliques[i].length;
			maxClique = cliques[i] as string[];
		}
	}
	maxClique.sort();
	console.log(maxCliqueSize, maxClique);
	return maxClique.join(",");
}

async function run() {
	const part1tests: TestCase[] = [{
		input: `kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn`, expected: "7"
	}];
	const part2tests: TestCase[] = [{
		input: `kh-tc
qp-kh
de-cg
ka-co
yn-aq
qp-ub
cg-tb
vc-aq
tb-ka
wh-tc
yn-cg
kh-ub
ta-co
de-co
tc-td
tb-wq
wh-td
ta-ka
td-qp
aq-cg
wq-ub
ub-vc
de-ta
wq-aq
wq-vc
wh-yn
ka-de
kh-ta
co-tc
wh-qp
tb-vc
td-yn`,
		expected: `co,de,ka,ta`
	}];

	const [p1testsNormalized, p2testsNormalized] = normalizeTestCases(part1tests, part2tests);

	// Run tests
	test.beginTests();
	await test.section(async () => {
		for (const testCase of p1testsNormalized) {
			test.logTestResult(testCase, String(await p2024day23_part1(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	await test.section(async () => {
		for (const testCase of p2testsNormalized) {
			test.logTestResult(testCase, String(await p2024day23_part2(testCase.input, ...(testCase.extraArgs || []))));
		}
	});
	test.endTests();

	// Get input and run program while measuring performance
	const input = await util.getInput(DAY, YEAR);

	const part1Before = performance.now();
	const part1Solution = String(await p2024day23_part1(input));
	const part1After = performance.now();

	const part2Before = performance.now()
	const part2Solution = String(await p2024day23_part2(input));
	const part2After = performance.now();

	logSolution(23, 2024, part1Solution, part2Solution);

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

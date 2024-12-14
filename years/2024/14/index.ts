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
	let totalNumberOfSeconds = 0;
	while (true) {
		const xmasLocalPattern: boolean[][] = Array.from({ length: spaceHeight }, () => Array.from({ length: spaceWidth }, () => false));
		let numberOfRobotsInPattern = 0;
		robots.forEach(robot => {
			const [newX, newY] = moveRobot(robot, spaceWidth, spaceHeight);
			if (!xmasLocalPattern[newY][newX]) {
				xmasLocalPattern[newY][newX] = true;
				numberOfRobotsInPattern++;
			}
			robot.robotX = newX;
			robot.robotY = newY;
		});
		totalNumberOfSeconds++;
		if (numberOfRobotsInPattern == robots.length) {
			console.log(xmasLocalPattern.map(row => row.map(cell => cell ? 'X' : '.').join('')).join('\n'));
			break;
		}
	}

	return totalNumberOfSeconds;
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
	const part2tests: TestCase[] = [{
		input: `p=38,76 v=-61,88
				p=28,22 v=-43,-40
				p=76,78 v=-98,87
				p=39,56 v=10,96
				p=38,0 v=79,-15
				p=6,44 v=-88,53
				p=40,80 v=-83,31
				p=11,2 v=28,-31
				p=41,91 v=-86,-48
				p=8,55 v=-81,95
				p=77,19 v=3,-90
				p=94,73 v=-59,42
				p=51,53 v=35,48
				p=12,52 v=72,6
				p=62,61 v=96,47
				p=78,62 v=47,-57
				p=39,54 v=53,50
				p=1,43 v=-64,-46
				p=9,21 v=28,-36
				p=92,79 v=67,-47
				p=6,15 v=-58,-48
				p=54,67 v=99,-38
				p=96,99 v=-55,30
				p=90,44 v=-10,-8
				p=23,84 v=20,77
				p=5,84 v=28,88
				p=55,20 v=-31,-36
				p=84,43 v=-37,-41
				p=12,75 v=-38,30
				p=39,2 v=-12,-29
				p=74,14 v=56,-81
				p=63,53 v=22,-53
				p=51,28 v=9,-90
				p=53,72 v=48,-61
				p=33,42 v=-43,23
				p=75,18 v=-89,-37
				p=38,83 v=27,38
				p=69,31 v=61,80
				p=73,3 v=-45,74
				p=39,29 v=92,17
				p=78,45 v=-23,-47
				p=48,59 v=-57,38
				p=2,41 v=-71,-93
				p=30,13 v=36,-82
				p=37,57 v=25,13
				p=51,73 v=56,-98
				p=76,78 v=38,91
				p=56,49 v=22,55
				p=34,47 v=10,84
				p=83,93 v=81,-16
				p=14,70 v=71,-50
				p=97,74 v=-4,70
				p=33,8 v=93,-35
				p=39,70 v=-2,19
				p=94,63 v=20,44
				p=86,4 v=-33,19
				p=17,67 v=26,44
				p=39,2 v=-70,-25
				p=47,56 v=-79,-55
				p=5,98 v=86,-75
				p=53,21 v=79,-89
				p=53,85 v=61,73
				p=46,32 v=66,54
				p=30,75 v=49,-73
				p=44,81 v=-61,-69
				p=82,66 v=-72,-6
				p=89,76 v=-13,98
				p=57,87 v=30,36
				p=12,41 v=59,-40
				p=36,56 v=10,-61
				p=60,80 v=48,39
				p=50,75 v=-44,42
				p=66,56 v=-93,-1
				p=57,96 v=83,-79
				p=98,88 v=-15,-16
				p=0,63 v=59,44
				p=90,27 v=29,-40
				p=21,60 v=-86,2
				p=85,13 v=11,61
				p=92,77 v=24,-34
				p=16,24 v=80,4
				p=47,8 v=-79,-49
				p=1,28 v=-82,-48
				p=80,55 v=6,-72
				p=60,94 v=-67,-15
				p=83,90 v=-98,78
				p=3,75 v=46,-66
				p=93,40 v=15,11
				p=52,37 v=48,7
				p=23,4 v=-47,25
				p=46,43 v=57,-98
				p=23,12 v=-98,-36
				p=11,42 v=-83,50
				p=80,33 v=25,54
				p=59,95 v=-1,36
				p=55,67 v=-44,-60
				p=90,80 v=83,-39
				p=57,61 v=-1,96
				p=51,79 v=31,39
				p=28,89 v=85,35
				p=12,98 v=28,-80
				p=25,61 v=-95,-50
				p=77,84 v=-37,78
				p=50,80 v=66,89
				p=93,32 v=-15,-45
				p=30,4 v=-96,-29
				p=81,95 v=14,-66
				p=23,3 v=42,-16
				p=33,69 v=-96,-10
				p=28,23 v=-43,68
				p=77,25 v=-45,-41
				p=27,96 v=-69,-32
				p=41,15 v=-53,-35
				p=66,81 v=-22,5
				p=5,15 v=13,-95
				p=88,1 v=-59,-26
				p=48,41 v=16,-19
				p=88,75 v=33,46
				p=21,9 v=-64,-86
				p=36,4 v=-16,-95
				p=68,22 v=-5,65
				p=8,43 v=-34,46
				p=71,68 v=-49,-59
				p=37,92 v=-48,-18
				p=59,43 v=-21,-10
				p=69,31 v=30,58
				p=90,77 v=46,-74
				p=42,42 v=-76,20
				p=58,34 v=78,55
				p=18,10 v=33,2
				p=23,92 v=45,-69
				p=23,45 v=-32,27
				p=63,50 v=39,-96
				p=8,72 v=-34,85
				p=22,102 v=-69,26
				p=73,14 v=-45,-38
				p=65,54 v=-51,68
				p=99,29 v=-16,67
				p=29,60 v=15,-19
				p=85,76 v=-54,80
				p=21,23 v=-3,-47
				p=9,37 v=94,-44
				p=99,77 v=48,80
				p=48,47 v=18,56
				p=26,61 v=36,-57
				p=80,58 v=56,90
				p=37,6 v=53,-90
				p=47,15 v=53,60
				p=4,79 v=70,52
				p=35,8 v=31,12
				p=18,8 v=25,-30
				p=80,38 v=33,45
				p=23,26 v=-69,61
				p=10,35 v=-78,-96
				p=53,17 v=48,-34
				p=24,45 v=72,-2
				p=65,75 v=-1,-38
				p=5,72 v=-49,39
				p=63,87 v=-27,-16
				p=0,46 v=-34,73
				p=14,46 v=55,-15
				p=28,70 v=45,92
				p=29,30 v=89,10
				p=98,31 v=-46,-89
				p=1,85 v=-77,82
				p=30,79 v=-43,28
				p=29,70 v=-81,65
				p=51,97 v=13,-25
				p=76,19 v=-23,18
				p=36,83 v=-17,91
				p=52,34 v=-39,-98
				p=35,46 v=-43,55
				p=97,13 v=-99,-26
				p=40,26 v=27,13
				p=18,38 v=89,57
				p=45,57 v=-79,-52
				p=86,76 v=-54,-64
				p=12,38 v=28,55
				p=6,56 v=-86,97
				p=85,100 v=-41,-22
				p=4,34 v=28,-95
				p=89,33 v=-4,-73
				p=82,20 v=-33,-15
				p=98,5 v=31,43
				p=85,81 v=73,88
				p=13,42 v=-90,-49
				p=93,60 v=-91,-64
				p=56,7 v=-5,64
				p=9,5 v=45,76
				p=61,4 v=74,86
				p=23,53 v=-7,3
				p=89,21 v=-38,-74
				p=13,44 v=-86,10
				p=96,62 v=-11,96
				p=5,98 v=-22,3
				p=26,26 v=-73,-93
				p=52,95 v=-5,42
				p=62,50 v=-57,-7
				p=11,2 v=41,-77
				p=23,73 v=-2,-97
				p=34,77 v=-47,-71
				p=91,58 v=99,43
				p=41,74 v=-53,42
				p=75,102 v=55,-81
				p=89,95 v=30,8
				p=76,28 v=-80,12
				p=82,27 v=-43,77
				p=62,63 v=-97,21
				p=94,73 v=-58,14
				p=13,35 v=-47,-46
				p=56,0 v=61,25
				p=94,39 v=11,8
				p=96,53 v=77,-53
				p=23,78 v=-43,-7
				p=24,51 v=-74,-86
				p=77,33 v=60,8
				p=84,71 v=-76,19
				p=78,96 v=82,3
				p=61,92 v=-58,-30
				p=9,75 v=94,-34
				p=89,13 v=7,-26
				p=16,67 v=-25,96
				p=95,43 v=-25,-54
				p=39,62 v=18,-40
				p=41,36 v=17,-65
				p=2,42 v=86,-10
				p=29,54 v=55,-2
				p=51,74 v=-44,92
				p=75,40 v=-36,-96
				p=60,15 v=-93,-84
				p=44,33 v=44,8
				p=88,51 v=85,-94
				p=26,60 v=43,62
				p=94,22 v=-81,-98
				p=4,50 v=-94,-96
				p=87,47 v=-55,3
				p=15,80 v=33,-14
				p=4,48 v=-24,-48
				p=57,36 v=-18,-98
				p=87,12 v=76,63
				p=53,17 v=-91,-81
				p=17,96 v=53,6
				p=91,40 v=95,-46
				p=23,28 v=-55,55
				p=81,7 v=-54,16
				p=62,102 v=-97,-77
				p=42,31 v=80,-41
				p=99,53 v=-72,57
				p=17,29 v=98,58
				p=24,57 v=84,-48
				p=98,101 v=-33,-30
				p=77,82 v=-36,-25
				p=44,8 v=83,18
				p=27,35 v=-27,16
				p=95,58 v=-29,52
				p=87,40 v=60,-91
				p=66,1 v=17,24
				p=17,11 v=63,21
				p=67,77 v=-23,-11
				p=91,30 v=-59,64
				p=22,34 v=7,84
				p=55,90 v=48,29
				p=45,45 v=31,50
				p=12,34 v=65,-86
				p=40,48 v=18,-1
				p=39,42 v=75,11
				p=28,27 v=63,-49
				p=93,44 v=-81,3
				p=8,78 v=-51,-15
				p=6,37 v=-51,-42
				p=73,89 v=-45,23
				p=2,80 v=-23,50
				p=93,37 v=55,-44
				p=16,52 v=-54,35
				p=15,17 v=-33,74
				p=84,37 v=-6,-48
				p=13,47 v=50,-48
				p=88,34 v=-79,-39
				p=16,68 v=50,94
				p=20,78 v=-99,29
				p=100,20 v=77,64
				p=79,2 v=-91,30
				p=52,0 v=-95,-86
				p=4,84 v=79,35
				p=13,74 v=19,-66
				p=57,55 v=-9,-63
				p=21,30 v=19,-94
				p=50,37 v=-66,4
				p=9,56 v=94,95
				p=91,59 v=55,-65
				p=77,15 v=34,-33
				p=5,100 v=81,-26
				p=26,96 v=-34,83
				p=36,64 v=-44,94
				p=37,65 v=-70,51
				p=74,6 v=25,-93
				p=33,78 v=-17,-48
				p=0,33 v=-6,-39
				p=3,55 v=-11,96
				p=32,19 v=-8,-33
				p=60,53 v=-5,-55
				p=75,62 v=56,45
				p=74,71 v=12,-66
				p=50,74 v=-53,91
				p=24,90 v=-19,-57
				p=58,53 v=31,5
				p=13,95 v=-33,20
				p=30,98 v=41,-70
				p=54,78 v=71,-43
				p=78,73 v=26,53
				p=66,30 v=-49,60
				p=81,87 v=-24,-15
				p=28,27 v=-31,11
				p=75,18 v=-89,10
				p=76,82 v=-89,-66
				p=44,65 v=-17,98
				p=17,42 v=-7,-5
				p=75,92 v=-54,32
				p=95,10 v=-28,-76
				p=20,36 v=-22,-62
				p=100,0 v=11,21
				p=37,39 v=5,-46
				p=80,50 v=-63,7
				p=77,28 v=-98,2
				p=61,41 v=-1,-40
				p=88,78 v=95,-17
				p=83,1 v=47,-30
				p=47,67 v=-30,-9
				p=14,81 v=-38,82
				p=40,97 v=-31,76
				p=76,27 v=37,-70
				p=25,73 v=80,35
				p=88,84 v=-33,77
				p=60,71 v=83,35
				p=14,93 v=-3,-25
				p=40,45 v=-35,4
				p=34,35 v=15,19
				p=87,100 v=90,-66
				p=20,90 v=-42,-68
				p=90,44 v=50,-52
				p=43,77 v=31,89
				p=99,81 v=33,-12
				p=28,35 v=58,-37
				p=37,52 v=57,6
				p=48,65 v=-66,23
				p=63,21 v=39,-35
				p=91,77 v=-15,-70
				p=27,28 v=93,-94
				p=18,61 v=-99,38
				p=56,36 v=-98,81
				p=90,75 v=-72,-67
				p=86,21 v=-13,-46
				p=20,88 v=89,-74
				p=17,41 v=-82,-98
				p=28,65 v=45,-72
				p=85,15 v=35,41
				p=39,43 v=-2,-36
				p=93,72 v=-94,91
				p=90,73 v=-64,77
				p=83,43 v=-94,-99
				p=50,59 v=-49,51
				p=58,25 v=13,-36
				p=25,102 v=-44,-54
				p=100,86 v=16,-23
				p=45,42 v=21,-90
				p=9,29 v=-13,18
				p=24,41 v=1,-47
				p=69,33 v=-58,55
				p=80,52 v=52,-2
				p=82,77 v=82,-11
				p=86,78 v=-41,-69
				p=89,58 v=69,-13
				p=12,91 v=-55,-65
				p=69,40 v=-93,59
				p=8,26 v=2,19
				p=21,47 v=19,3
				p=38,20 v=25,-83
				p=20,99 v=54,31
				p=20,74 v=-14,-30
				p=51,83 v=-40,24
				p=61,30 v=-27,-94
				p=84,19 v=-28,69
				p=28,33 v=-65,3
				p=58,91 v=-93,-18
				p=33,78 v=22,92
				p=86,53 v=63,-43
				p=53,79 v=-26,-42
				p=83,16 v=94,56
				p=21,0 v=-64,-35
				p=48,80 v=-97,79
				p=62,18 v=29,71
				p=17,13 v=-69,-36
				p=1,93 v=19,75
				p=7,75 v=41,93
				p=65,61 v=-45,65
				p=56,71 v=92,-63
				p=71,102 v=-53,-21
				p=64,79 v=96,49
				p=40,13 v=-74,-84
				p=28,71 v=93,91
				p=43,68 v=-39,-6
				p=10,40 v=63,55
				p=73,0 v=-97,-82
				p=26,38 v=85,-27
				p=27,94 v=36,-79
				p=1,99 v=-82,-30
				p=66,96 v=-23,31
				p=78,21 v=96,16
				p=10,93 v=-51,-76
				p=76,87 v=78,80
				p=13,20 v=-38,68
				p=31,42 v=-43,5
				p=56,10 v=-53,-33
				p=76,61 v=34,-4
				p=73,2 v=-36,74
				p=93,83 v=15,-19
				p=76,50 v=20,-51
				p=27,53 v=36,-51
				p=93,97 v=50,72
				p=59,22 v=87,21
				p=95,22 v=-29,66
				p=56,35 v=79,10
				p=60,38 v=17,-94
				p=67,41 v=-5,6
				p=97,71 v=-73,35
				p=26,10 v=-73,74
				p=74,71 v=5,64
				p=36,91 v=84,-17
				p=38,91 v=67,33
				p=19,64 v=41,-9
				p=89,15 v=-59,66
				p=5,94 v=94,-27
				p=92,21 v=7,-87
				p=87,64 v=-28,-5
				p=22,6 v=-95,25
				p=59,42 v=-51,-7
				p=50,95 v=88,29
				p=59,91 v=73,-21
				p=52,42 v=-75,56
				p=10,39 v=-30,7
				p=88,79 v=29,-62
				p=31,89 v=-21,-82
				p=43,60 v=4,52
				p=2,76 v=-68,-15
				p=13,71 v=-38,97
				p=93,38 v=1,-95
				p=53,99 v=10,16
				p=94,72 v=-98,30
				p=1,3 v=37,-82
				p=68,78 v=55,18
				p=1,78 v=42,-7
				p=80,84 v=52,-26
				p=75,46 v=-87,-20
				p=71,27 v=95,-39
				p=90,18 v=73,11
				p=99,3 v=62,52
				p=39,88 v=-80,-93
				p=85,32 v=69,-40
				p=72,23 v=-28,-75
				p=22,59 v=98,-7
				p=69,76 v=12,93
				p=56,59 v=30,50
				p=80,92 v=-49,-80
				p=4,40 v=-77,-50
				p=90,60 v=40,-28
				p=6,79 v=9,56
				p=63,47 v=57,-59
				p=33,62 v=22,37
				p=74,27 v=78,70
				p=26,101 v=-43,-49
				p=1,24 v=-29,-38
				p=73,90 v=56,79
				p=5,90 v=-20,-75
				p=16,35 v=94,8
				p=96,93 v=4,58
				p=61,43 v=4,4
				p=13,68 v=76,94
				p=5,29 v=86,-95
				p=32,81 v=39,-85
				p=94,42 v=-37,55
				p=80,20 v=60,22
				p=43,94 v=57,-19
				p=93,4 v=51,-26
				p=12,4 v=62,-58
				p=87,74 v=-98,-64
				p=81,41 v=-26,69
				p=30,54 v=-30,-13
				p=73,4 v=21,-30
				p=68,35 v=-49,-44
				p=47,2 v=19,-70
				p=92,100 v=33,79
				p=81,11 v=73,-83
				p=46,75 v=-62,-69
				p=48,56 v=-13,-56
				p=7,84 v=15,30
				p=92,10 v=28,69
				p=15,31 v=-87,61
				p=95,0 v=33,79
				p=3,61 v=-37,-50
				p=73,95 v=96,20`,
		expected: "6285",
	}];

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

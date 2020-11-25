import * as util from "../../../util/util.js";
import * as test from "../../../util/test.js";
import * as LOGUTIL from "../../../util/log.js";
const { log, logGrid, logSolution, trace } = LOGUTIL;
const YEAR = 2018;
const DAY = 20;
const DEBUG = true;
LOGUTIL.setDebug(DEBUG);
// solution path: /Users/trevorsg/t-hugs/aoc-2020/years/2018/20/index.ts
// data path    : /Users/trevorsg/t-hugs/aoc-2020/years/2018/20/data.txt
// problem url  : https://adventofcode.com/2018/day/20
async function p2018day20_part1(input) {
    return "Not implemented";
}
async function p2018day20_part2(input) {
    return "Not implemented";
}
async function run() {
    const part1tests = [];
    const part2tests = [];
    // Run tests
    test.beginTests();
    test.beginSection();
    for (const testCase of part1tests) {
        test.logTestResult(testCase, String(await p2018day20_part1(testCase.input)));
    }
    test.beginSection();
    for (const testCase of part2tests) {
        test.logTestResult(testCase, String(await p2018day20_part2(testCase.input)));
    }
    test.endTests();
    // Get input and run program
    const input = await util.getInput(DAY, YEAR);
    const part1Solution = String(await p2018day20_part1(input));
    const part2Solution = String(await p2018day20_part2(input));
    logSolution(part1Solution, part2Solution);
}
run()
    .then(() => {
    process.exit();
})
    .catch(error => {
    throw error;
});

// this is just for mass requesting new boards and analysing them cause bad documentation and i wanna know there are only 3 difficulties prob) or more 

// config
let apiURL = "https://sudoku-api.vercel.app/api/dosuku";
let delay = 100;
let maxTimeout = 300;
let times = 1000;

// import other libs
import { Agent, fetch } from "undici";

// progress bar
import * as cliProgress from "cli-progress";
import colors from 'ansi-colors';
const pBar = new cliProgress.SingleBar({
    format: 'Fetching Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Fetches || ETA: {eta_formatted}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
});

// Define helper functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Define variables
let startTime = Date.now();
let difficulties = [];
let timeEstimate = times * delay
let timeUnit = "ms"
if (timeEstimate > 15 * 1000) { // 15 seconds
    timeEstimate = timeEstimate / 1000 // convert to seconds
    timeUnit = "s"
}
if (timeUnit == "s" && timeEstimate > 120) { // 120 seconds
    timeEstimate = timeEstimate / 60 // convert to minutes
    timeUnit = "m"
}

// fetching
pBar.start(times, 0);
for (let i = 0; i < times; i++) {
    let res = await fetch(apiURL, {
        dispatcher: new Agent({ connectTimeout: maxTimeout })
      });
    if (res.status != 200) {
        //console.error(res.statusText);
        continue;
    };
    let data = await res.json();
    let difficulty = data.newboard.grids[0].difficulty;
    difficulties.push(difficulty);
    //console.log(difficulty);
    pBar.increment() // increment the progress bar
    sleep(delay);
};
pBar.stop();
let timeDone = Date.now()

let diffCounts = difficulties.reduce((counts, cur) => {
    counts[cur]++;
    return counts;
},
    [...new Set(difficulties)].reduce((obj, cur) => {
        obj[cur] = 0;
        return obj;
    }, {})
);

let content = {
    timeStart: startTime,
    timeEnd: timeDone,
    timeElapsed: timeDone-startTime,
    avgPerFetch: (timeDone-startTime)/times,
    delay: delay,
    times: times,
    results: diffCounts,
    successCounts: difficulties.length,
    successRate: difficulties.length / times,
}
console.log(`Fetching done
====================================
Time elapsed: ${content.timeElapsed}
Avg Time per fetch: ${content.avgPerFetch}
Fetched count: ${content.successCounts}
Target fetched count: ${content.times}
Fetch delay: ${content.delay}
Fetch success rate: ${content.successRate*100}%`)

let sortedKeys = Object.keys(diffCounts).sort((a, b) => diffCounts[b] - diffCounts[a])
for (const key of sortedKeys) {
    const value = diffCounts[key]
    console.log(value, key)
}

import * as fs from "node:fs";
try {
    let outputLog = fs.readFileSync('./output.json')
    let fileOutput = JSON.parse(outputLog)
    fileOutput.push(content)
    fs.writeFileSync('./output.json', JSON.stringify(fileOutput));
    // file written successfully
} catch (err) {
    console.error(err);
}
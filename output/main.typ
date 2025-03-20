#import "@preview/lilaq:0.1.0" as lq;

// helper func
#let diagCounter = counter("graph")
#diagCounter.update(1)
#let diag(..args) = {
    let namedArgs = args.named()
    let title = context [
        #diagCounter.step()
        Graph #diagCounter.display(): #namedArgs.at("title",default: "")
    ]
    namedArgs.at("title") = title
    figure(
        lq.diagram(..args.pos(), ..namedArgs),
    )
}
#let divSep(value, divident) = {
    return (calc.floor(value/divident), calc.rem(value, divident))
}
#let formatMS(ms) = {
    let (second, ms) = divSep(ms, 1000)
    let (minute, second) = divSep(second, 60)
    let (hour, minute) = divSep(minute, 60)
    let (day, hour) = divSep(hour, 24)
    return [
        #if day != 0 [#{day}d ]
        #if hour != 0 [#{hour}h ]
        #if minute != 0 [#{minute}m ]
        #if second != 0 [#{second}s ]
        #if ms != 0 [#{ms}ms]
    ]
}

// code or some shit
#let data = json("data.json")
#let measurePoints = data.len()
#let merged = (
    totalTimeElapsed: 0,
    totalTargetFetches: 0,
    totalSuccessFetches: 0,
    results: (:),
)

#for item in data {
    for (key, result) in item.at("results") {
        merged.at("results").insert(key, merged.at("results").at(key, default: 0) + result)
    }
    merged.insert("totalTimeElapsed", 
        merged.at("totalTimeElapsed", default: 0) + item.at("timeElapsed",default: 0)
    );
    merged.insert("totalTargetFetches", 
        merged.at("totalTargetFetches", default: 0) + item.at("times",default: 0)
    );
    merged.insert("totalSuccessFetches", 
        merged.at("totalSuccessFetches", default: 0) + item.at("successCounts",default: 0)
    );
}
#let results = merged.at("results")

#diag(
    title: "Difficulty distrubiton",
    yaxis: (
        subticks: none,
        ticks: merged.at("results").keys()
            .enumerate(),
    ),
    xaxis: (
        label: "amount of times recieved",
    ),
    lq.hbar(
        merged.at("results").values(),
        range(merged.at("results").keys().len()),
    )
) <difDistribution>
#let commonResults = merged.at("results").keys().sorted(key: it => results.at(it, default: 0))
#let chances = (:)
#for (key, value) in merged.results {
    chances.insert(key, value/merged.totalSuccessFetches)
}
As visualised in @difDistribution the most common difficulty is #commonResults.at(-1), the least common difficulty is #commonResults.at(0).
#figure(caption: "Chance to recieve per difficulty",
    table(
        columns: 2,
        table.header()[Difficulty][Chance to recieve],
        ..for (key, value) in chances {
            (key, $#calc.round(value, digits:2)%$)
        }.flatten()
))
This data has been gathered in #formatMS(merged.totalTimeElapsed). #merged.totalSuccessFetches datapoints have been succesfully collected with a success rate of $#calc.round(merged.totalSuccessFetches/merged.totalTargetFetches*100, digits: 2)%$.
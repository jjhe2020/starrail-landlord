#!/usr/bin/env python3
"""Reproduce the independent Python audit of frozen v0.7 natural campaigns.

This preserves the 36 assertions used for the final read-only review: per
difficulty, eight run-maximum statistics, five late role counts, the two
observed terminal star counts, terminal floor counts, late held role maxima,
and the independent seed count. Source checks are listed separately.

Run from the repository root:
  python3 scripts/verify-v070-natural-independent.py

No game or JavaScript analysis modules are imported. Quantiles are descriptive
R-7 interpolation over the uniform policy mixture; no CI is calculated.
"""

import argparse
from collections import Counter
from datetime import datetime, timezone
import gzip
import hashlib
import json
from pathlib import Path


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def quantile(sorted_values, probability):
    index = (len(sorted_values) - 1) * probability
    lower = int(index)
    return sorted_values[lower] + (
        sorted_values[min(lower + 1, len(sorted_values) - 1)]
        - sorted_values[lower]
    ) * (index - lower)


def record_assertion(records, key, actual, expected):
    assert actual == expected, f"{key}: actual {actual!r} != expected {expected!r}"
    records.append({"key": key, "actual": actual, "expected": expected, "passed": True})


def archive_path(source, natural_path):
    declared = Path(source["path"])
    if declared.exists():
        return declared.resolve()
    # Raw archives accompany the repository data package under docs/benchmarks.
    # The frozen metadata can retain an absolute path from the original host.
    candidate = natural_path.parent / "benchmarks" / declared.name
    if candidate.exists():
        return candidate.resolve()
    raise FileNotFoundError(source["path"])


def audit(natural_path, main_path, terminal_path):
    paths = {"natural": natural_path, "main": main_path, "terminal": terminal_path}
    documents = {key: json.loads(path.read_text()) for key, path in paths.items()}
    natural, main, terminal = (documents[key] for key in ["natural", "main", "terminal"])
    source_checks, results, source_results = [], [], []
    for key, document in documents.items():
        record_assertion(source_checks, f"{key}.ready", document["validation"]["ready"], True)
    record_assertion(source_checks, "natural.protocol", natural["protocol"], "v070-natural-growth-audit-v1")
    main_sources = {row["sha256"]: row for row in main["sources"] if row["mode"] == "campaigns"}
    terminal_sources = {row["sha256"]: row for row in terminal["sources"]}
    names = {card["id"]: card["name"] for card in main["cards"]}
    roles = {card["id"]: card["role"] for card in main["cards"]}

    for source in natural["sources"]:
        path = archive_path(source, natural_path)
        difficulty = source["config"]["difficulty"]
        prefix = f"D{difficulty}"
        expected = next(row for row in natural["difficulties"] if row["difficulty"] == difficulty)
        coverage = next(row["cardCoverage"] for row in main["campaigns"] if row["difficulty"] == difficulty)
        actual_sha = sha256(path)
        record_assertion(source_checks, f"{prefix}.archive.sha256", actual_sha, source["sha256"])
        for label, declared_sources in [("main", main_sources), ("terminal", terminal_sources)]:
            record_assertion(source_checks, f"{prefix}.{label}.archivePresent", actual_sha in declared_sources, True)
            record_assertion(source_checks, f"{prefix}.{label}.sourceHashes", declared_sources[actual_sha]["sourceHashes"], source["sourceHashes"])

        maxima, late_roles, terminal_stars = [], Counter(), Counter()
        late_held_role_maxima, tail_examples = {}, []
        terminal_floors, seeds = Counter(), set()
        at_least_6 = at_least_12 = campaign_count = asta_late_appearances = 0
        header = footer = None
        opener = gzip.open if path.name.endswith(".gz") else open
        with opener(path, "rt") as stream:
            for line in stream:
                record = json.loads(line)
                if record["kind"] == "header":
                    header = record
                    continue
                if record["kind"] == "end":
                    footer = record
                    continue
                if record["kind"] != "row":
                    continue
                run = record["value"]
                campaign_count += 1
                seeds.add(run["seed"])
                terminal_floors[str(run["floor"])] += 1
                maximum = max((unit["growth"] for unit in run["finalRoster"]), default=0)
                maxima.append(maximum)
                at_least_6 += maximum >= 6
                at_least_12 += maximum >= 12
                if maximum >= 6:
                    tail_examples.append({
                        "seed": run["seed"], "policy": run["strategyId"],
                        "won": run["won"], "terminalFloor": run["floor"],
                        "recordedTurns": len(run["turns"]),
                        "maximumGrowthCards": [
                            {"id": unit["id"], "name": names[unit["id"]],
                             "stars": unit["stars"], "growth": unit["growth"],
                             "ticks": unit.get("ticks")}
                            for unit in run["finalRoster"] if unit["growth"] == maximum
                        ],
                        "finalTrainerRoster": [
                            {"id": unit["id"], "name": names[unit["id"]], "stars": unit["stars"]}
                            for unit in run["finalRoster"] if roles[unit["id"]] == "trainer"
                        ],
                    })
                for turn in run["turns"]:
                    for unit in turn["cards"]:
                        if turn["floor"] >= 9:
                            role = roles[unit["id"]]
                            late_held_role_maxima[role] = max(late_held_role_maxima.get(role, 0), unit["endGrowth"])
                            if unit["present"]:
                                late_roles[role] += 1
                                asta_late_appearances += unit["id"] == "1009"
                        if turn["floor"] == run["floor"] and unit["present"]:
                            terminal_stars[str(unit["stars"])] += 1

        record_assertion(source_checks, f"{prefix}.archive.unchanged", sha256(path), actual_sha)
        record_assertion(source_checks, f"{prefix}.header.sourceHashes", header["value"]["sourceHashes"], natural["frozenSourceHashes"])
        record_assertion(source_checks, f"{prefix}.header.sourceStable", header["value"]["sourceStable"], True)
        record_assertion(source_checks, f"{prefix}.footer.rows", footer["counts"]["rows"], campaign_count)
        record_assertion(source_checks, f"{prefix}.header.expectedRows", header["expectedCounts"]["rows"], campaign_count)

        maxima.sort()
        run_quantiles = {
            "n": campaign_count, "median": quantile(maxima, .5), "p90": quantile(maxima, .9),
            "p95": quantile(maxima, .95), "p99": quantile(maxima, .99), "max": max(maxima),
            "campaignsAtLeast6": at_least_6, "campaignsAtLeast12": at_least_12,
        }
        assertions = []
        for key, value in run_quantiles.items():
            record_assertion(assertions, f"{prefix}.finalRosterRunMaximumGrowth.{key}", value, expected["finalRosterRunMaximumGrowth"][key])
        for role, count in late_roles.items():
            record_assertion(assertions, f"{prefix}.lateRoleAppearanceCounts.{role}", count, expected["lateRoleAppearanceShares"]["counts"][role])
        for star, count in terminal_stars.items():
            record_assertion(assertions, f"{prefix}.terminalPresentStarCounts.{star}", count, expected["terminalEncounterStars"]["counts"][star])
        record_assertion(assertions, f"{prefix}.actualTerminalFloorCounts", dict(terminal_floors), expected["terminalEncounterStars"]["actualTerminalFloorCounts"])
        record_assertion(assertions, f"{prefix}.lateHeldRoleMaxima", late_held_role_maxima, expected["lateObservedGrowth"]["maxAllHeldByRole"])
        record_assertion(assertions, f"{prefix}.sharedSeedBlockCount", len(seeds), expected["sharedSeedBlockCount"])

        asta_coverage = next(card for card in coverage["cards"] if card["id"] == "1009")
        trainer_count = late_roles["trainer"]
        record_assertion(source_checks, f"{prefix}.mainCoverage.campaignCount", coverage["campaignCount"], campaign_count)
        record_assertion(source_checks, f"{prefix}.mainCoverage.nSeeds", coverage["nSeeds"], len(seeds))
        record_assertion(source_checks, f"{prefix}.mainCoverage.astaLateAppearances", asta_coverage["stages"]["late"]["appearances"], asta_late_appearances)
        record_assertion(source_checks, f"{prefix}.mainCoverage.trainerLateAppearances", sum(card["stages"]["late"]["appearances"] for card in coverage["cards"] if card["role"] == "trainer"), trainer_count)
        results.append({
            "difficulty": difficulty, "campaignCount": campaign_count, "sharedSeedBlockCount": len(seeds),
            "policyCount": expected["policyCount"], "samplesPerPolicy": expected["samplesPerPolicy"],
            "finalRosterRunMaximumGrowth": run_quantiles,
            "lateRoleAppearanceCounts": dict(late_roles), "lateHeldRoleMaxima": late_held_role_maxima,
            "actualTerminalFloorCounts": dict(terminal_floors), "terminalPresentStarCountsObserved": dict(terminal_stars),
            "astaShareOfLateTrainerAppearances": {
                "cardId": "1009", "name": names["1009"],
                "numeratorAstaPresentInstanceTurns": asta_late_appearances,
                "denominatorTrainerPresentInstanceTurns": trainer_count,
                "ratio": asta_late_appearances / trainer_count,
                "otherTrainerPresentInstanceTurns": trainer_count - asta_late_appearances,
                "denominatorAllLatePresentInstanceTurns": sum(late_roles.values()),
                "otherTrainerShareOfAllLateAppearances": (trainer_count - asta_late_appearances) / sum(late_roles.values()),
            },
            "growthAtLeast6SharedSeedCount": len({example["seed"] for example in tail_examples}),
            "growthAtLeast6SharedSeeds": sorted({example["seed"] for example in tail_examples}),
            "growthAtLeast6CampaignExamples": tail_examples,
            "assertionCount": len(assertions), "assertions": assertions,
        })
        source_results.append({
            "declaredPath": source["path"], "resolvedPath": str(path), "sha256": actual_sha,
            "rows": campaign_count, "config": source["config"], "sourceHashes": source["sourceHashes"],
        })

    return {
        "protocol": "v070-natural-independent-python-v1", "ready": True,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "method": {
            "implementation": "Independent standard-library Python streaming parse of the original JSONL archives; no game or JavaScript analysis imports.",
            "quantiles": "Sort per-campaign max(finalRoster[].growth), using zero for an empty final roster, then apply R-7 linear interpolation.",
            "late": "floor >= 9; role counts and Asta proportions use present instances only; role growth maxima also include held but absent instances.",
            "terminal": "Use every recorded turn at actual run.floor, and count stars only when present; never substitute fixed floor12 or finalRoster stars.",
            "population": "Descriptive uniform mixture of the included policies; shared seeds are counted separately. These campaign quantiles have no CI and are not independent human samples.",
            "growth": "Retained additive growth value, not a damage multiplier. Normal, temporary and commission instances remain pooled because raw records omit status/UID.",
            "assertionScope": "The same 36 statistical assertions as the final read-only review. Source and main-coverage checks are recorded separately.",
        },
        "inputDocuments": {key: {"path": str(path), "sha256": sha256(path)} for key, path in paths.items()},
        "frozenSourceHashes": natural["frozenSourceHashes"], "sources": source_results,
        "assertionCount": sum(row["assertionCount"] for row in results),
        "sourceCheckCount": len(source_checks), "sourceChecks": source_checks, "difficulties": results,
        "analysisSourceHashes": {"scripts/verify-v070-natural-independent.py": sha256(Path(__file__).resolve())},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--natural", type=Path, default=Path("docs/V070-NATURAL-GROWTH.json"))
    parser.add_argument("--main", type=Path, default=Path("docs/V070-TEST-RESULTS.json"))
    parser.add_argument("--terminal", type=Path, default=Path("docs/V070-TERMINAL-CARDS.json"))
    parser.add_argument("--output", type=Path, default=Path("docs/benchmarks/v070-natural-independent-audit.json"))
    args = parser.parse_args()
    document_paths = [path.resolve() for path in [args.natural, args.main, args.terminal]]
    result = audit(*document_paths)
    output = args.output.resolve()
    assert output not in document_paths and output not in [Path(source["resolvedPath"]) for source in result["sources"]], "Output must not overwrite an input"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"PASS: {result['assertionCount']} statistical assertions; {result['sourceCheckCount']} source/coverage checks; {output}")

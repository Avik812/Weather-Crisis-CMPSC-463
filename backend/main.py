from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Set

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComputeRequest(BaseModel):
    k: int
    stations: Dict[str, List[int]]

def greedy_max_coverage(k: int, stations: Dict[str, Set[int]]):
    covered = set()
    chosen = []

    for _ in range(k):
        best_station = None
        best_gain = 0

        for name, regions in stations.items():
            gain = len(regions - covered)
            if gain > best_gain:
                best_gain = gain
                best_station = name

        if best_station is None:
            break

        chosen.append(best_station)
        covered |= stations[best_station]

    return chosen, list(covered)

@app.post("/compute")
def compute_optimal(req: ComputeRequest):
    # Convert lists to sets for algorithm
    station_sets = {name: set(regions) for name, regions in req.stations.items()}

    chosen, covered = greedy_max_coverage(req.k, station_sets)

    return {
        "chosen": chosen,
        "covered": covered,
        "stations": req.stations
    }
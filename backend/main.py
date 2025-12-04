from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# DATASET
# Regions are numbered 1–12
stations = {
    "S1": {1, 2, 5},
    "S2": {2, 3, 6},
    "S3": {4, 7},
    "S4": {5, 6, 9, 10},
    "S5": {8, 9, 12},
}

# GREEDY MAXIMUM COVERAGE
def greedy_max_coverage(k: int):
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


@app.get("/")
def root():
    return {"status": "backend running"}


@app.post("/compute")
def compute_optimal(k: int):
    chosen, covered = greedy_max_coverage(k)
    return {
        "chosen": chosen,
        "covered": covered,
        "stations": {s: list(r) for s, r in stations.items()},
    }
# Architecture
The worker pool manages a configurable number of worker threads that each initialize their own Shiki highlighter instance. Tasks are distributed across available workers, with queuing when all workers are busy.

```text
+---------------- Main Thread ----------------+
| +-- React (if used) ----------------------+ |
| | <WorkerPoolContextProvider>             | |
| |   <FileDiff />                          | |
| |   <File />                              | |
| | </WorkerPoolContextProvider>            | |
| | * Each component manages their own      | |
| |   instances of the Vanilla JS Classes   | |
| +-------------------+---------------------+ |
|                     |                       |
|                     v                       |
| +----------- Vanilla JS Classes ----------+ |
| | new FileDiff(opts, poolManager)         | |
| | new File(opts, poolManager)             | |
| | * Renders plain text synchronously      | |
| | * Queue requests to WorkerPool for      | |
| |   highlighted HAST                      | |
| | * Automatically render highlighted HAST | |
| +-------------------+---------------------+ |
|                     | HAST Request          |
|                     v                       |
| +----------- WorkerPoolManager -----------+ |
| | * Shared singleton                      | |
| | * Manages WorkerPool instance and       | |
| |   request queue                         | |
| +-------------------+---------------------+ |
+---------------------|----------------------+
                      | postMessage
                      v
+--------------- Worker Threads --------------+
| +------------- worker.js ------------------+ |
| | * 8 threads by default                   | |
| | * Runs Shiki's codeToHast()              | |
| | * Manages themes and language loading    | |
| |   automatically                          | |
| +------------------------------------------+ |
+---------------------------------------------+
```

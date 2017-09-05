Swarm Path Finding
------------------

This is a pathfinding algorithm that uses the basis of Dijkstra's Algorithm, but is adjusted for our uses. The C++ backend performs the pathfinding calculations from an input map that shows the blocked tiles, unblocked tiles, and target tile. It outputs each open tile's distance to the target tile. This output file is then sent to the JavaScript frontend, which picks a random tile to animate a dot at and moves the dot by checking which tile next to it decreases the travel distance by 1. If the user clicks on a tile in the map displayed in the front end to block or unblock a tile, a new input file is created and sent to the C++ backend and the process repeats itself. 

Benchmarking
------------

| N             | Elapsed Time  | Memory Usage   |
|---------------|---------------|----------------|
| 10            | 0.001551 s    | 0.589844 Mb    |
| 20            | 0.005163 s    | 0.703125 Mb    |
| 30            | 0.015317 s    | 0.722656 Mb    |
| 50            | 0.064529 s    | 1.050781 Mb    |
| 80            | 0.471637 s    | 1.667969 Mb    | 
| 100           | 0.911113 s    | 2.601562 Mb    |


Contributions
-------------

- Jamie (jmaher5): Worked mostly on the C++ backend. Performed the benchmarking tests. Created a random map generator for testing purposes. 

- Nick (npalutsi): Built the user interface and framework for HTML and JS. Worked on transferring the algorithm to Javascript.

- Henry (hlong2): Worked on transferring the algorithm to Javascript and the user interface.



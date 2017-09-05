// pathfinder.cpp
// Data Structures Final Project

#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <unordered_set>
#include <algorithm>
#include <map>


using namespace std;

// const int HEIGHT = 10;
// const int WIDTH = 20;

class Cell {
public:
	int row;
	int col;
	int access;
	int dist;
};

struct Comp{
    bool operator()(const Cell& a, const Cell& b){
        return ((a.row < b.row) && (a.col < b.col));
    }
};

void printVec(vector<vector<Cell> > &, int, int);
void findDistances(vector<vector<Cell> >, Cell, int, int);
bool checkCellExistence(vector<Cell>, Cell);
bool checkValid(int, int, int, int, int);

// Main Execution

int main (int argc, char *argv[]) {
	int i, j, a, HEIGHT, WIDTH;
	cin >> HEIGHT;
	cin >> WIDTH;
	Cell start;
	vector<vector<Cell> > graph;
	for (i = 0; i < HEIGHT; i++) {
		vector<Cell> line;
		for (j = 0; j < WIDTH; j++) {
			cin >> a;
			if (a == 2) {
				start.row = i; 
				start.col = j;
				start.access = a;
				start.dist = 0;
				line.push_back(start);
			}
			else {
				Cell temp;
				temp.row = i;
				temp.col = j;
				temp.access = a;
				temp.dist = 0;
				line.push_back(temp);
			}
		}
		graph.push_back(line);
	}

	findDistances(graph, start, WIDTH, HEIGHT);
	return 0;
}

void findDistances(vector<vector<Cell> > g, Cell start, int WIDTH, int HEIGHT) {
	queue<Cell> frontier;
	frontier.push(start);
	vector<Cell> distance;
	int surroundingRow[] = {-1, 0, 0, 1};
	int surroundingCol[] = {0, 1, -1, 0};

	while (!frontier.empty()) {
		Cell current = frontier.front();
		frontier.pop();
		int x = current.row;
		int y = current.col;
		bool found = false;

		for (int i = 0; i < 4; i++) {

			if (checkValid(i, x, y, WIDTH, HEIGHT)) {
				found = false;
				int row = x+surroundingRow[i];
				int col = y+surroundingCol[i];
				Cell check = g[row][col];
				if (check.access == 1) {
					if (!checkCellExistence(distance, check)) {
						check.dist = current.dist + 1;
						g[row][col].dist = check.dist;
						frontier.push(check);
					}
				}
				distance.push_back(check);
			}
		}
	}

	g[start.row][start.col].dist = 999;
	printVec(g, WIDTH, HEIGHT);
}

bool checkValid(int i, int x, int y, int WIDTH, int HEIGHT) {
	if (i == 0) {
		if (x > 0)
			return true;
	}

	else if (i == 1) {
		if (y < WIDTH - 1)
			return true;
	}

	else if (i == 2) {
		if (y > 0)
			return true;

	}

	else if (i == 3) {
		if (x < HEIGHT-1)
			return true;
	}
	return false;
}

bool checkCellExistence(vector<Cell> d, Cell c) {

	for (int i = 0; i < d.size(); i++) {
		if ((d[i].row == c.row) && (d[i].col == c.col))
			return true;
	}
	return false;
}


void printVec(vector<vector<Cell> > &graph, int WIDTH, int HEIGHT) {
	int i, j;
	for (i = 0; i < HEIGHT; i++) {
		bool first = true;
		for (j = 0; j < WIDTH; j++) {
			if (first) {
				cout << graph[i][j].dist;
				first = false;
			}
			else {
				cout << " " << graph[i][j].dist;
			}
		}
		cout << endl;
	}
}

// pathfinder.cpp
// Data Structures Final Project

#include <iostream>
#include <vector>
#include <queue>
#include <set>
#include <unordered_set>
#include <algorithm>


using namespace std;

// const int HEIGHT = 10;
// const int WIDTH = 20;

class Cell {
public:
	int row;
	int col;
	int access;
	int dist;
	// bool operator<(const Cell& a, const Cell& b) {
 //  		return ((a.row < b.row) && (a.col < b.col));
	// }
};

struct Comp{
    bool operator()(const Cell& a, const Cell& b){
        return ((a.row < b.row) && (a.col < b.col));
    }
};

void printVec(vector<vector<Cell> > &, int, int);
void findDistances(vector<vector<Cell> >, Cell, int, int);
bool checkCellExistence(priority_queue<Cell, vector<Cell>, Comp>, Cell);

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
	//printVec(graph);
	return 0;
}

void findDistances(vector<vector<Cell> > g, Cell start, int WIDTH, int HEIGHT) {
	priority_queue<Cell, vector<Cell>, Comp> frontier;
	frontier.push(start);
	vector<Cell> distance;
	bool found;

	while (!frontier.empty()) {
		Cell current = frontier.top();
		frontier.pop();
		int x = current.row;
		int y = current.col;

		if (x > 0) {
			found = false;
			Cell up = g[x-1][y];
			if (up.access == 1) {
				for (int i = 0; i < distance.size(); i++) {
					if ((distance[i].row == up.row) && (distance[i].col == up.col)) {
						found = true;
						break;
					}
				}
				if (!found) {
					up.dist = current.dist+1;
					g[x-1][y].dist = up.dist;
					frontier.push(up);
				}
			}
			distance.push_back(up);
		}

		if (y < WIDTH - 1) {
			found = false;
			Cell right = g[x][y+1];
			if (right.access == 1) {
				for (int i = 0; i < distance.size(); i++) {
					if ((distance[i].row == right.row) && (distance[i].col == right.col)) {
						found = true;
						break;
					}
				}
				if (!found) {
					right.dist = current.dist + 1;
					g[x][y+1].dist = right.dist;
					frontier.push(right);
				}
			}
			distance.push_back(right);
		}

		if (y > 0) {
			found = false;
			Cell left = g[x][y-1];
			if (left.access == 1) {
				for (int i = 0; i < distance.size(); i++) {
					if ((distance[i].row == left.row) && (distance[i].col == left.col)) {
						found = true;
						break;
					}
				}
				if (!found) {
					left.dist = current.dist + 1;
					g[x][y-1].dist = left.dist;
					frontier.push(left);
				}
			}
			distance.push_back(left);
		}

		if (x < HEIGHT-1) {
			found = false;
			Cell down = g[x+1][y];
			if (down.access == 1) {
				for (int i = 0; i < distance.size(); i++) {
					if ((distance[i].row == down.row) && (distance[i].col == down.col)) {
						found = true;
						break;
					}
				}
				if (!found) {
					down.dist = current.dist + 1;
					g[x+1][y].dist = down.dist;
					frontier.push(down);
				}
			}
			distance.push_back(down);
		}
	}
	g[start.row][start.col].dist = 999;
	printVec(g, WIDTH, HEIGHT);
}

// bool checkCellExistence(priority_queue<Cell, vector<Cell>, Comp> f, Cell c) {
// 	int n = f.size();
// 	int min = 0;
// 	int max = n - 1;
// 	int mid;
// 	while (min < max) {
// 		mid = (int)((min + max) /2);
// 		if (f[mid].row > c.row) {
// 			max = mid - 1;
// 		}
// 		else if (f[mid].row < c.row) {
// 			min = mid + 1;
// 		}
// 		else if (f[mid].row == c.row && f[mid].col == c.col)
// 			return true;
// 	}
// 	return false;
// }


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

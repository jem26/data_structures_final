// generate_map.cpp

#include <iostream>
#include <cstdlib>
#include <time.h>

using namespace std;

int pickRandomInt();

int main(int argc, char *argv[]) {
	srand(time(NULL));
	int n = atoi(argv[1]);
	cout << n << " " << n << endl;

	for (int i = 0; i < n; i++) {
		for (int j = 0; j < n; j++) {
			if (i == n-3 && j == n-3)
				cout << 2 << " ";
			else
				cout << pickRandomInt() << " ";
		}
		cout << endl;
	}

	return 0;
}

int pickRandomInt() {
	int i = rand() % 100;
	if (i < 15)
		return 0;
	else 
		return 1;
}
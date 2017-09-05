CXX=		g++
CXXFLAGS=	-g -Wall -std=gnu++11
SHELL=		bash
PROGRAMS=	pathfinder measure

all:		pathfinder measure generate_map

pathfinder:	pathfinder.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^

clean:
	rm -f $(PROGRAMS)
	rm -rf *.dSYM

test:		test-output test-memory test-time

test-output:	pathfinder
	@echo Testing output0...
	@diff --suppress-common-lines -y <(./pathfinder < ./data/input.txt) ./data/output.txt
	@echo Testing output1...
	@diff --suppress-common-lines -y <(./pathfinder < ./data/input1.txt) ./data/output1.txt
	@echo Testing output2...
	@diff --suppress-common-lines -y <(./pathfinder < ./data/input2.txt) ./data/output2.txt
test-memory:	pathfinder
	@echo Testing memory...
	@[ `valgrind --leak-check=full ./pathfinder < ./data/input.txt 2>&1 | grep ERROR | awk '{print $$4}'` = 0 ]

test-time:	$(PROGRAMS)
	@echo Testing time...
	@./measure ./pathfinder < ./data/input.txt | tail -n 1 | awk '{ if ($$1 > 1.0) { print "Time limit exceeded"; exit 1} }'

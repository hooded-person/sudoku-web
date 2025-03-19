// alert("Loaded ./script.js")
let apiURL = "https://sudoku-api.vercel.app/api/dosuku";
let gridEl = document.getElementById("grid")
let infoEl = document.getElementById("info")

class Board {
	constructor(apiURL, gridEl, infoEl) {
		this.apiURL = apiURL
		this.gridEl = gridEl
		this.infoEl = infoEl
		this.grids = []
		this.grid = {}
	};
	
	async newBoard() {
		console.log("fetching new board");
		let res = await fetch(this.apiURL);
		if (!res.ok) {
			alert(`Response status: ${response.status}`);
		};
		let data = await res.json();
        data = data.newboard;
		if (data.message != "All Ok") {
			alert(`Non-ok resonse 	message: ${data.message}`);
		};
		this.grids.push(data.grids);
		this.grid = {
			"value": data.grids[0].value.map(e => e),
			"start": data.grids[0].value.map(e => e),
			"solution": data.grids[0].solution.map(e => e)
		};
		this.difficulty = data.grids[0].difficulty;
		console.log("fetched new board", this.grid,
			"\nBoard difficulty",this.difficulty,
			"\nvalue clone success", !(this.grid.value == this.grid.start)
		);
	};
	
	renderText() {
		a = a.map(an => [an.slice(0,3), an.slice(3,6), an.slice(6,9)])
			.map(an => an.map(am => am.join(" ")))
			.map(an => an.join(" | "));
		return [a.slice(0,3), a.slice(3,6), a.slice(6,9)]
			.map(an => an.join("\n"))
			.join("\n------|-------|------\n").replace(/0/g,".");
	};
	renderHTML(game) {
		console.log("rendering to HTML");
		this.gridEl.innerHTML = "";
		let numbers = this.grid.value.flat().map(number => number != 0 ? number.toString() : "");
		let startNum = this.grid.start.flat();
		for (let [index, number] of Object.entries(numbers)) {
			let el = document.createElement("span");
			el.classList.add("cell");
			if (startNum[index] != 0) {
				el.classList.add("fixed");
			};
			if (game) {
				el.addEventListener("click", e => game.selectTile(e.currentTarget));
			};
			el.id = index;
			el.innerText = number;
			
			this.gridEl.appendChild(el);
		};
		console.log("Rendered too HTML")
	};
	renderInfo() {
		let difficulty = this.infoEl.querySelector("#difficulty");
		difficulty.innerText = `Difficulty: ${this.difficulty}`;
	};
}

class Game {
	constructor(apiURL, gridEl, infoEl) {
		this.apiURL = apiURL;
		this.gridEl = gridEl;
		this.infoEl = infoEl;
		
		this.board = new Board(apiURL, gridEl, infoEl);
		console.log(this.board);
		this.board.newBoard().then(() => {
			this.board.renderHTML(this);
			this.board.renderInfo();
		});
		document.addEventListener("keydown", (e) => this.handleKeyPress(e))
	}

	selectTile(el) {
		if (el.parentElement != this.gridEl) {
			console.warn("Game.selectTile was with a non child event target");
			return 
		};
		if (el.classList.contains("selected")) {
			// console.log("removing selected");
			el.classList.remove("selected");
			this.selectedEl = undefined
		} else {
			// console.log("switching selected");
			[...this.gridEl.children].forEach((cEl) => {
				cEl.classList.remove("selected");
			});
			el.classList.add("selected");
			this.selectedEl = el
		};
	}

	handleKeyPress(e) {
		const arrowKeys = {
			"ArrowLeft": -1,
			"ArrowRight": +1,
			"ArrowUp":-9,
			"ArrowDown": +9,
		}
		const numberKeys = {
			"Backspace": ["", false],
			"1":[1, false],
			"2":[2, false],
			"3":[3, false],
			"4":[4, false],
			"5":[5, false],
			"6":[6, false],
			"7":[7, false],
			"8":[8, false],
			"9":[9, false],
			"!":[1, true ],
			"@":[2, true ],
			"#":[3, true ],
			"$":[4, true ],
			"%":[5, true ],
			"^":[6, true ],
			"&":[7, true ],
			"*":[8, true ],
			"(":[9, true ],
		}
		let keyPressed = e.key;
		console.log(keyPressed);
		if (keyPressed in arrowKeys) {
			this.arrowSelect(keyPressed);
		};
		if (keyPressed in numberKeys) {
			this.enterNumber(numberKeys[keyPressed])
		}
	}

	enterNumber(numberInfo) {
		let [num, isCaption] = numberInfo
		let curI = Number(this.selectedEl.id);
		let y = Math.floor(curI/9)
		let x = curI - (y*9)
		let isFixed = this.board.grid.start[y][x] != 0
		if (!isFixed) {
			this.board.grid.value[y][x] = num
			console.log(this.board.grid.start)
			this.gridEl.children[curI].innerText = num
		}
	}

	arrowSelect(keyPressed) {
		const arrowKeys = {
			"ArrowLeft":  -1,
			"ArrowRight": +1,
			"ArrowUp":    -9,
			"ArrowDown":  +9,
		};
		let offset = arrowKeys[keyPressed];
		let curI = Number(this.selectedEl.id);
		if (offset == -1 && curI % 9 == 0) {
			offset = 8
		} else if (offset == 1 && (curI+1) % 9 == 0) {
			offset = -8
		}
		let newI = curI + offset;
		if (newI >= 9*9) {
			newI = newI - 9*9;
		} else if (newI < 0 ) {
			newI = newI + 9*9;
		}
		let newSelEl = this.gridEl.children[newI];
		if (newSelEl != undefined) {
			this.selectTile(newSelEl);
		};
	}
}

let game = new Game(apiURL, gridEl, infoEl);
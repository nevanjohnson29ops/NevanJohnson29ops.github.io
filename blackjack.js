// Simple Blackjack game
(() => {
	const dealBtn = document.getElementById('deal');
	const hitBtn = document.getElementById('hit');
	const standBtn = document.getElementById('stand');
	const message = document.getElementById('message');
	const dealerHandEl = document.getElementById('dealer-hand');
	const playerHandEl = document.getElementById('player-hand');
	const dealerScoreEl = document.getElementById('dealer-score');
	const playerScoreEl = document.getElementById('player-score');
	const winsEl = document.getElementById('wins');
	const lossesEl = document.getElementById('losses');
	const pushesEl = document.getElementById('pushes');

	let deck = [];
	let player = [];
	let dealer = [];
	let inRound = false;
	let stats = { wins: 0, losses: 0, pushes: 0 };

	function createDeck() {
		const suits = ['♠','♥','♦','♣'];
		const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
		const d = [];
		for (const s of suits) for (const r of ranks) d.push({suit:s,rank:r});
		return d;
	}

	function shuffle(a){
		for(let i=a.length-1;i>0;i--){
			const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];
		}
		return a;
	}

	function cardValue(card){
		if(!card) return 0;
		const r = card.rank;
		if(r==='A') return 11;
		if(['J','Q','K'].includes(r)) return 10;
		return Number(r);
	}

	function scoreHand(hand){
		let total = 0;
		let aces = 0;
		for(const c of hand){
			total += cardValue(c);
			if(c.rank==='A') aces++;
		}
		while(total>21 && aces>0){ total-=10; aces--; }
		return total;
	}

	function renderCard(card, hide=false){
		const el = document.createElement('div');
		el.className = 'card';
		if(hide){ el.classList.add('back'); el.textContent=''; return el; }
		const red = card.suit==='♥' || card.suit==='♦';
		if(red) el.classList.add('red');
		el.innerHTML = `<div>${card.rank}</div><div style="text-align:right">${card.suit}</div>`;
		return el;
	}

	function render(){
		dealerHandEl.innerHTML = '';
		playerHandEl.innerHTML = '';

		// show dealer with first card hidden while round
		dealer.forEach((c,i)=> dealerHandEl.appendChild(renderCard(c, inRound && i===0)));
		player.forEach(c=> playerHandEl.appendChild(renderCard(c)));

		playerScoreEl.textContent = scoreHand(player);
		dealerScoreEl.textContent = inRound ? '?' : scoreHand(dealer);
	}

	function startRound(){
		deck = shuffle(createDeck());
		player = [deck.pop(), deck.pop()];
		dealer = [deck.pop(), deck.pop()];
		inRound = true;
		dealBtn.disabled = true; hitBtn.disabled = false; standBtn.disabled = false;
		message.textContent = 'Your move: Hit or Stand';
		render();

		const pScore = scoreHand(player);
		if(pScore===21){ // immediate blackjack
			endRound();
		}
	}

	function playerHit(){
		if(!inRound) return;
		player.push(deck.pop());
		render();
		const s = scoreHand(player);
		if(s>21){
			message.textContent = 'Bust — You lose';
			stats.losses++;
			endRound();
		}
	}

	function dealerPlay(){
		while(scoreHand(dealer) < 17){ dealer.push(deck.pop()); }
	}

	function endRound(){
		inRound = false;
		hitBtn.disabled = true; standBtn.disabled = true; dealBtn.disabled = false;
		dealerPlay();
		const p = scoreHand(player);
		const d = scoreHand(dealer);
		render();
		if(p>21){
			message.textContent = `You busted (${p}). Dealer wins (${d}).`;
		} else if(d>21){
			message.textContent = `Dealer busted (${d}). You win!`;
			stats.wins++;
		} else if(p> d){
			message.textContent = `You win! ${p} vs ${d}`;
			stats.wins++;
		} else if(p<d){
			message.textContent = `Dealer wins ${d} vs ${p}`;
			stats.losses++;
		} else {
			message.textContent = `Push: ${p} — it's a tie.`;
			stats.pushes++;
		}
		updateStats();
	}

	function updateStats(){
		winsEl.textContent = stats.wins;
		lossesEl.textContent = stats.losses;
		pushesEl.textContent = stats.pushes;
	}

	dealBtn.addEventListener('click', ()=> startRound());
	hitBtn.addEventListener('click', ()=> playerHit());
	standBtn.addEventListener('click', ()=> { if(!inRound) return; endRound(); });

	// initial render
	render();
})();



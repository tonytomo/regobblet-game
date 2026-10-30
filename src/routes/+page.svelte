<script lang="ts">
	import Header from '#lib/components/layout/Header.svelte';
	import Shell from '#lib/components/layout/Shell.svelte';
	import GameBoard from '#lib/components/features/regobblet/GameBoard.svelte';
	import ReserveTray from '#lib/components/features/regobblet/ReserveTray.svelte';
	import GameControls from '#lib/components/features/regobblet/GameControls.svelte';
	import MoveHistory from '#lib/components/features/regobblet/MoveHistory.svelte';
	import SetupModal from '#lib/components/features/regobblet/SetupModal.svelte';
	import RulesModal from '#lib/components/features/regobblet/RulesModal.svelte';
	import OnlineRoomModal from '#lib/components/features/regobblet/OnlineRoomModal.svelte';
	import StackInspectModal from '#lib/components/features/regobblet/StackInspectModal.svelte';
	import GameOverModal from '#lib/components/features/regobblet/GameOverModal.svelte';
	import { gameStore } from '#lib/stores/gameStore.svelte.js';

	let isSetupOpen = $state<boolean>(false);
	let isRulesOpen = $state<boolean>(false);
	let isOnlineOpen = $state<boolean>(false);

	const gameMode = $derived(gameStore.gameMode);
	const aiDifficulty = $derived(gameStore.aiDifficulty);
</script>

<svelte:head>
	<title>Regobblet · Matryoshka Nested Tic-Tac-Toe</title>
	<meta
		name="description"
		content="Play Regobblet: Gobblet-style nested-piece tic-tac-toe for 2 players with 3x3, 4x4, and 5x5 boards, AI opponents, and online rooms."
	/>
</svelte:head>

<Header
	onopenSetup={() => (isSetupOpen = true)}
	onopenRules={() => (isRulesOpen = true)}
	onopenOnline={() => (isOnlineOpen = true)}
/>

<Shell>
	<div class="my-auto flex w-full flex-col items-center gap-3 sm:gap-4">
		<!-- Player 2 Reserve (Top) -->
		<ReserveTray
			owner={2}
			label={gameMode === 'ai' ? `AI Opponent (${aiDifficulty})` : 'Player 2'}
		/>

		<!-- Game Board (Center) -->
		<GameBoard oninspect={(r, c) => gameStore.inspectSquare(r, c)} />

		<!-- Player 1 Reserve (Bottom) -->
		<ReserveTray owner={1} label="Player 1" />

		<!-- Game Controls & Status Banner -->
		<GameControls onopenOnline={() => (isOnlineOpen = true)} />

		<!-- Move Log -->
		<MoveHistory />
	</div>
</Shell>

<!-- Modals -->
<SetupModal isOpen={isSetupOpen} onclose={() => (isSetupOpen = false)} />
<RulesModal isOpen={isRulesOpen} onclose={() => (isRulesOpen = false)} />
<OnlineRoomModal isOpen={isOnlineOpen} onclose={() => (isOnlineOpen = false)} />
<StackInspectModal />
<GameOverModal onopenSetup={() => (isSetupOpen = true)} />

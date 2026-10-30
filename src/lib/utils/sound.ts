class SoundManager {
	private ctx: AudioContext | null = null;
	private enabled = true;

	private getContext(): AudioContext | null {
		if (typeof window === 'undefined') return null;
		if (!this.ctx) {
			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			if (AudioContextClass) {
				this.ctx = new AudioContextClass();
			}
		}
		if (this.ctx && this.ctx.state === 'suspended') {
			this.ctx.resume().catch(() => {});
		}
		return this.ctx;
	}

	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	public isAudioEnabled(): boolean {
		return this.enabled;
	}

	public playPickup(): void {
		if (!this.enabled) return;
		const ctx = this.getContext();
		if (!ctx) return;

		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'triangle';
		osc.frequency.setValueAtTime(320, now);
		osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);

		gain.gain.setValueAtTime(0.12, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(now);
		osc.stop(now + 0.07);
	}

	public playPlace(): void {
		if (!this.enabled) return;
		const ctx = this.getContext();
		if (!ctx) return;

		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'sine';
		osc.frequency.setValueAtTime(220, now);
		osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

		gain.gain.setValueAtTime(0.25, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(now);
		osc.stop(now + 0.1);
	}

	public playGobble(): void {
		if (!this.enabled) return;
		const ctx = this.getContext();
		if (!ctx) return;

		const now = ctx.currentTime;

		// Deep hollow pop + thud
		const osc1 = ctx.createOscillator();
		const osc2 = ctx.createOscillator();
		const gain = ctx.createGain();

		osc1.type = 'triangle';
		osc1.frequency.setValueAtTime(300, now);
		osc1.frequency.exponentialRampToValueAtTime(110, now + 0.14);

		osc2.type = 'sine';
		osc2.frequency.setValueAtTime(160, now);
		osc2.frequency.exponentialRampToValueAtTime(60, now + 0.14);

		gain.gain.setValueAtTime(0.3, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

		osc1.connect(gain);
		osc2.connect(gain);
		gain.connect(ctx.destination);

		osc1.start(now);
		osc2.start(now);
		osc1.stop(now + 0.15);
		osc2.stop(now + 0.15);
	}

	public playReveal(): void {
		if (!this.enabled) return;
		const ctx = this.getContext();
		if (!ctx) return;

		const now = ctx.currentTime;
		const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chime

		notes.forEach((freq, idx) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			const start = now + idx * 0.05;

			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, start);

			gain.gain.setValueAtTime(0.08, start);
			gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(start);
			osc.stop(start + 0.19);
		});
	}

	public playWin(): void {
		if (!this.enabled) return;
		const ctx = this.getContext();
		if (!ctx) return;

		const now = ctx.currentTime;
		// Ascending triumphant major chord
		const melody = [
			{ freq: 440.0, time: 0.0, dur: 0.12 }, // A4
			{ freq: 554.37, time: 0.12, dur: 0.12 }, // C#5
			{ freq: 659.25, time: 0.24, dur: 0.14 }, // E5
			{ freq: 880.0, time: 0.38, dur: 0.35 } // A5
		];

		melody.forEach(({ freq, time, dur }) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			const start = now + time;

			osc.type = 'triangle';
			osc.frequency.setValueAtTime(freq, start);

			gain.gain.setValueAtTime(0.2, start);
			gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.start(start);
			osc.stop(start + dur + 0.02);
		});
	}

	public playInvalid(): void {
		if (!this.enabled) return;
		const ctx = this.getContext();
		if (!ctx) return;

		const now = ctx.currentTime;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.type = 'sawtooth';
		osc.frequency.setValueAtTime(120, now);
		osc.frequency.linearRampToValueAtTime(90, now + 0.08);

		gain.gain.setValueAtTime(0.12, now);
		gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.start(now);
		osc.stop(now + 0.09);
	}
}

export const sounds = new SoundManager();

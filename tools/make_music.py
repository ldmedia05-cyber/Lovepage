"""
Synthesize an original, warm, romantic piano-style piece for Meenu Baba.
Pure-Python (numpy) additive synthesis + soft multi-tap reverb.
Outputs a seamless ~32s loop as a mono WAV.
No external samples — fully original, no licensing concerns.
"""
import math
import struct
import wave

import numpy as np

SR = 32000  # sample rate (plenty for soft piano, keeps file small)

# ---- note frequencies -------------------------------------------------------
def hz(n):
    # n = MIDI note number; A4 (69) = 440Hz
    return 440.0 * (2 ** ((n - 69) / 12.0))

NOTE = {
    "C2": 36, "E2": 40, "G2": 43, "A2": 45, "F2": 41, "D2": 38,
    "C3": 48, "D3": 50, "E3": 52, "F3": 53, "G3": 55, "A3": 57, "B3": 59,
    "C4": 60, "D4": 62, "E4": 64, "F4": 65, "G4": 67, "A4": 69, "B4": 71,
    "C5": 72, "D5": 74, "E5": 76, "F5": 77, "G5": 79, "A5": 81,
}

# ---- a single soft piano-ish tone ------------------------------------------
HARMONICS = [(1, 1.0), (2, 0.55), (3, 0.33), (4, 0.18), (5, 0.10), (6, 0.06)]

def tone(midi, dur, amp=0.5, attack=0.008, decay_to=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(midi)
    wave_arr = np.zeros(n)
    for k, a in HARMONICS:
        # slight inharmonicity for a richer, bell/piano feel
        wave_arr += a * np.sin(2 * np.pi * f * k * (1 + 0.0006 * k) * t)
    wave_arr /= sum(a for _, a in HARMONICS)

    # envelope: quick attack, smooth exponential decay
    env = np.ones(n)
    atk = max(1, int(attack * SR))
    env[:atk] = np.linspace(0, 1, atk)
    decay = np.exp(-t * (3.2 if decay_to == 0 else 1.6))
    env = env * decay
    return wave_arr * env * amp

def add(buf, sig, start_sec):
    s = int(start_sec * SR)
    e = min(len(buf), s + len(sig))
    buf[s:e] += sig[: e - s]

# ---- arrangement ------------------------------------------------------------
# Romantic progression in C major (Pachelbel-flavoured):
# C  G  Am  Em  F  C  F  G   then loops back to C.
BEAT = 1.0          # seconds per beat (~60 BPM, slow & tender)
CHORD_BEATS = 2     # each chord lasts 2 beats
PROG = [
    ("C", ["C3", "E3", "G3"], "C4 E4 G4 E4"),
    ("G", ["G2", "D3", "G3"], "D4 G4 B4 G4"),
    ("Am", ["A2", "E3", "A3"], "E4 A4 C5 A4"),
    ("Em", ["E2", "G3", "B3"], "G4 B4 E5 B4"),
    ("F", ["F2", "A3", "C4"], "A4 C5 F5 C5"),
    ("C", ["C3", "E3", "G3"], "G4 E4 C5 E4"),
    ("F", ["F2", "A3", "C4"], "A4 C5 A4 F4"),
    ("G", ["G2", "B3", "D4"], "B4 D5 G4 B4"),
]

MELODY = [  # (note, beats) – a tender top line over two passes
    "E5 2", "D5 2", "C5 2", "B4 2", "A4 2", "C5 2", "C5 2", "D5 2",
    "G5 2", "E5 2", "E5 2", "G5 2", "A5 2", "G5 2", "F5 2", "G5 2",
]

def build():
    total_beats = len(PROG) * CHORD_BEATS * 2  # two passes
    total_sec = total_beats * BEAT + 2.0
    buf = np.zeros(int(total_sec * SR))

    t = 0.0
    melody_idx = 0
    for _pass in range(2):
        for name, chord, arp in PROG:
            # soft sustained pad (the chord, quiet, long)
            for note in chord:
                add(buf, tone(NOTE[note], CHORD_BEATS * BEAT * 1.05,
                              amp=0.10, attack=0.05, decay_to=1), t)
            # bass root
            add(buf, tone(NOTE[chord[0]] - 12, CHORD_BEATS * BEAT,
                          amp=0.22, attack=0.01), t)
            # rolling arpeggio (4 notes across the 2 beats)
            arp_notes = arp.split()
            step = (CHORD_BEATS * BEAT) / len(arp_notes)
            for i, note in enumerate(arp_notes):
                add(buf, tone(NOTE[note], step * 1.4, amp=0.16), t + i * step)

            # melody note(s) for this chord window
            mtxt = MELODY[melody_idx % len(MELODY)]
            mnote, mbeats = mtxt.split()
            add(buf, tone(NOTE[mnote], float(mbeats) * BEAT * 1.1,
                          amp=0.26, attack=0.012), t)
            melody_idx += 1

            t += CHORD_BEATS * BEAT
    return buf

# ---- gentle multi-tap reverb (adds warmth/space, vectorized) ----------------
def reverb(x):
    out = x.copy()
    taps = [(0.045, 0.32), (0.077, 0.24), (0.113, 0.18),
            (0.151, 0.13), (0.203, 0.09), (0.281, 0.05)]
    for delay, gain in taps:
        d = int(delay * SR)
        out[d:] += gain * x[: len(x) - d]
    return out

def main():
    buf = build()
    buf = reverb(buf)

    # normalise + soft limiter
    buf = buf / (np.max(np.abs(buf)) + 1e-9)
    buf = np.tanh(buf * 1.1) * 0.92

    # tiny fade in/out so looping has no click
    fade = int(0.04 * SR)
    buf[:fade] *= np.linspace(0, 1, fade)
    buf[-fade:] *= np.linspace(1, 0, fade)

    pcm = (buf * 32767).astype(np.int16)
    with wave.open("assets/romantic.wav", "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("wrote assets/romantic.wav", round(len(pcm) / SR, 1), "sec")

if __name__ == "__main__":
    main()

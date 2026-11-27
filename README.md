# Decidey 🐭

A cute 3D decision mouse. Type your options, poke the mouse, and it squeaks out a verdict with a little spin and a confetti pop.

Built with [three.js](https://threejs.org/) (procedural mouse, no external 3D assets), plain HTML/CSS/JS. No build step.

## Run locally

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL.

## How it works

- The mouse is built from primitives (sphere head, ears, eyes, nose, whiskers, tube tail) so every blink, ear-wiggle, squash and tail-wag is animated in code.
- It follows your cursor while idle, spins and pulses while "thinking", then pops and reveals the winner.
- The winner is chosen with `crypto.getRandomValues` for a fair pick.

## Deploy

Static site, deploys to GitHub Pages as-is (CDN import map for three.js).

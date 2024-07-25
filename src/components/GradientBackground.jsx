import React from 'react';
import { css, keyframes } from '@emotion/css';
import 'bootstrap/dist/css/bootstrap.min.css';

const movement = keyframes`
  0%, 100% {
    background-size: 
      130vmax 130vmax,
      80vmax 80vmax,
      90vmax 90vmax,
      110vmax 110vmax,
      90vmax 90vmax;
    background-position:
      -80vmax -80vmax,
      60vmax -30vmax,
      10vmax 10vmax,
      -30vmax -10vmax,
      50vmax 50vmax;
  }
  25% {
    background-size: 
      100vmax 100vmax,
      90vmax 90vmax,
      100vmax 100vmax,
      90vmax 90vmax,
      60vmax 60vmax;
    background-position:
      -60vmax -90vmax,
      50vmax -40vmax,
      0vmax -20vmax,
      -40vmax -20vmax,
      40vmax 60vmax;
  }
  50% {
    background-size: 
      80vmax 80vmax,
      110vmax 110vmax,
      80vmax 80vmax,
      60vmax 60vmax,
      80vmax 80vmax;
    background-position:
      -50vmax -70vmax,
      40vmax -30vmax,
      10vmax 0vmax,
      20vmax 10vmax,
      30vmax 70vmax;
  }
  75% {
    background-size: 
      90vmax 90vmax,
      90vmax 90vmax,
      100vmax 100vmax,
      90vmax 90vmax,
      70vmax 70vmax;
    background-position:
      -50vmax -40vmax,
      50vmax -30vmax,
      20vmax 0vmax,
      -10vmax 10vmax,
      40vmax 60vmax;
  }
`;

const gradientBackground = css`
  margin: 0;
  min-height: 100vh;
  background-image: 
    radial-gradient(closest-side, rgba(0, 128, 255, 1), rgba(0, 128, 255, 0)),
    radial-gradient(closest-side, rgba(0, 204, 255, 1), rgba(0, 204, 255, 0)),
    radial-gradient(closest-side, rgba(0, 102, 204, 1), rgba(0, 102, 204, 0)),
    radial-gradient(closest-side, rgba(255, 0, 0, 1), rgba(255, 0, 0, 0)),
    radial-gradient(closest-side, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  background-size: 
    130vmax 130vmax,
    80vmax 80vmax,
    90vmax 90vmax,
    110vmax 110vmax,
    90vmax 90vmax;
  background-position:
    -80vmax -80vmax,
    60vmax -30vmax,
    10vmax 10vmax,
    -30vmax -10vmax,
    50vmax 50vmax;
  background-repeat: no-repeat;
  animation: ${movement} 10s linear infinite;
  z-index: -1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

function GradientBackground() {
  return (
    <div className={gradientBackground}>
    </div>
  );
}

export default GradientBackground;
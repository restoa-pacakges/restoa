import React from 'react';
import { createStore } from '..';

type Count = number;

const [useCount, setCount, getCount] = createStore<Count>(() => 0);

function increaseOneCount() {
  setCount(count => count + 1);
}
function decreaseOneCount() {
  setCount(count => count - 1);
}
function alertCurrentCount() {
  alert(`Current Count: ${getCount()}`);
}

export function CountView() {
  const count = useCount();

  return (
    <div>
      <button aria-label="increase one count" onClick={increaseOneCount}>
        Increase 1 Count
      </button>
      <button aria-label="decrease one count" onClick={decreaseOneCount}>
        Decrease 1 Count
      </button>
      <button aria-label="alert current count" onClick={alertCurrentCount}>
        Alert Current Count
      </button>
      <br />
      <label aria-label="count">{`Count: ${count}`}</label>
    </div>
  );
}

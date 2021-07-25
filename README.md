# Restoa

Restoa 는 React Hooks 를 이용한 State 관리 라이브러리입니다.

Restoa 가 지향하는 State 관리는 정적이며 동시에 독립적입니다.

## 기본 예제

createStore 를 호출하여, State 를 관리할 수 있는 useState, setState, getState 3개의 함수를 생성 할 수 있습니다.

createStore 는 React Hooks 의 useState 처럼 튜플 구조를 반환 하기 때문에, 함수의 이름을 지정하기 편합니다.
```typescript
import { createStore } from 'restoa'

type Count = number;

const [useCount, setCount, getCount] = createStore<Count>(0)
```

3개의 함수 중 setState 와 getState 는 React Componet 바깥에서 사용 하려는 목적으로 만들어 졌습니다.

아래 예제와 같이 React Component 와 독립적으로 함수를 생성하여 State 조작을 할 수 있습니다.
```typescript
function increaseOneCount() {
  setCount(count => count + 1);
}
function decreaseOneCount() {
  setCount(count => count - 1);
}
function alertCurrentCount() {
  alert(`Current Count: ${getCount()}`);
}
```

3개의 함수 중 useState 는 React Component 내부에서 사용 하려는 목적으로 만들어 졌습니다.

useState 는 setState 를 호출하여, State 가 변경될 때 마다, React Component 에게 새 값을 전달합니다.
```typescript
export function CountView(){
  const count = useCount();

  return (
    <div>
      <button onClick={increaseOneCount}>Increase 1 Count</button>
      <button onClick={decreaseOneCount}>Decrease 1 Count</button>
      <button onClick={alertCurrentCount}>Alert Current Count</button>
      <br/>
      <span>{`Count: ${count}`}</span>
    </div>
  )

}
```

전체 예제입니다.
```typescript
import { createStore } from 'restoa'

type Count = number;

const [useCount, setCount, getCount] = createStore<Count>(0)

function increaseOneCount() {
  setCount(count => count + 1);
}
function decreaseOneCount() {
  setCount(count => count - 1);
}
function alertCurrentCount() {
  alert(`Current Count: ${getCount()}`);
}

export function CountView(){
  const count = useCount();

  return (
    <div>
      <button onClick={increaseOneCount}>Increase 1 Count</button>
      <button onClick={decreaseOneCount}>Decrease 1 Count</button>
      <button onClick={alertCurrentCount}>Alert Current Count</button>
      <br/>
      <span>{`Count: ${count}`}</span>
    </div>
  )

}
```


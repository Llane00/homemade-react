import React from "./core/react";

const FunctionComponent1 = ({ num }) => {
  console.log('render FunctionComponent', num);

  return (<p id="FunctionComponent1">
    FunctionComponent {num}
  </p>);
}

function FunctionComponent2({ num }) {
  console.log('render FunctionComponent', num);

  return (
    <div id="FunctionComponent2">
      FunctionComponent <span>{num}</span>
    </div>
  )
}

let countNum = 0;
let countProps = { id: 'Counter', className: 'red' };
function Counter() {
  console.log('render Counter');

  const update = React.update();
  function handleClick(e) {
    countNum++;
    countProps.className = countNum % 2 === 0 ? 'red' : 'blue';
    update();
    console.log('handle Counter click', e)
  }

  return (
    <button {...countProps} onClick={handleClick}>
      Click Me {countNum}
    </button>
  )
}

let showBar = false;
function ToggleComponent() {
  console.log('render ToggleComponent');

  const foo = (
    <div>
      foo
      <p>foo 's child1</p>
      <p>foo 's child2</p>
      <p>foo 's child3</p>
    </div>
  );

  const bar = <div>bar</div>

  const update = React.update();
  function handleShowBar() {
    showBar = !showBar;
    update();
  }

  return (
    <div id="ToggleComponent">
      <div>{showBar ? bar : foo}</div>
      <div>p1</div>
      {showBar && bar}
      <div>p2</div>
      <button onClick={handleShowBar}>showBar</button>
    </div>
  )
}

const App = () => {
  console.log('render App');

  return (
    <div>
      Hi React!
      <ToggleComponent />
      <div>
        <div>
          <FunctionComponent1 num={1} />
        </div>
      </div>
      <div>
        <Counter />
        <FunctionComponent2 num={2} />
      </div>
      <div>
        <div>
          <div>
            <FunctionComponent2 num={3} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

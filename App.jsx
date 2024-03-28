import React from "./core/react";

const FunctionComponent1 = ({ num }) => {
  console.log('render FunctionComponent1');

  return (<p>
    FunctionComponent {num}
  </p>);
}

function FunctionComponent2({ num }) {
  console.log('render FunctionComponent2');

  return (
    <div>
      FunctionComponent <span>{num}</span>
    </div>
  )
}

let countNum = 0;
let countProps = { className: 'red' };
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
    <div>
      <button onClick={handleShowBar}>showBar</button>
      <div>{showBar ? bar : foo}</div>
      {showBar && bar}
    </div>
  )
}

const AddDivButton = () => {
  console.log('render AddDivButton');

  function addDiv() {
    const containerDom = document.querySelector("#displayContainer1");
    const div = document.createElement("div");
    div.innerHTML = "add div";
    containerDom.appendChild(div);
  }

  return (
    <button onClick={addDiv}>add div</button>
  )
}

const App = () => {
  console.log('render App');

  return (
    <div>
      Hi React!
      <div id="displayContainer1">
        <ToggleComponent />
      </div>
      <AddDivButton />
      <div>
        <div>
          <FunctionComponent1 num={1} />
        </div>
      </div>
      <div>
        <div>
          <div>
            <FunctionComponent2 num={2} />
          </div>
        </div>
      </div>
      <div>
        <Counter />
      </div>
    </div>
  );
}

export default App;

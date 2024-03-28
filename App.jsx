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

  function handleClick(e) {
    React.update();
    countNum++;
    countProps.className = countNum % 2 === 0 ? 'red' : 'blue';
    console.log('handle Counter click', e)
  }

  return (
    <button {...countProps} onClick={handleClick}>
      Click Me {countNum}
    </button>
  )
}

let displayComponentA = true;
const ToggleComponent = () => {
  const ComponentA = <div>Component A</div>;
  function FnComponentA() {
    return <div>Fn Component A</div>;
  }

  const ComponentB = <p>Component B</p>;
  function FnComponentB() {
    return <div>Fn Component B</div>;
  }

  function handleClick() {
    displayComponentA = !displayComponentA;
    React.update();
  }

  return (
    <div>
      display Component:
      <div>{displayComponentA ? <FnComponentA /> : <FnComponentB />}</div>
      <div>{displayComponentA ? ComponentA : ComponentB}</div>
      <button onClick={handleClick}>toggle A or B</button>
    </div>
  )
}

const AddDivButton = () => {
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

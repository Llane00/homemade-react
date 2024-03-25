import React from "./core/react";

const FunctionComponent1 = ({ num }) => (
  <p>
    FunctionComponent {num}
  </p>
)

function FunctionComponent2({ num }) {
  return (
    <div>
      FunctionComponent <span>{num}</span>
    </div>
  )
}

const App = <div>
  Hi React!
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
</div>

export default App;

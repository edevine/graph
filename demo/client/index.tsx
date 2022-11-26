import { JSX, render } from 'preact';

function App(): JSX.Element {
  return <p>Hello World!</p>;
}

render(<App />, document.getElementById('app')!);

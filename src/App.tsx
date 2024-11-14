import "./App.css";

function App() {
  return (
    <main className="container">
      <h1>GitPulse</h1>
      <p>Track your GitHub repositories</p>

      <form>
        <input type="text" placeholder="GitHub username" />
        <button>Search</button>
      </form>

      <div className="repo-list">
        <div className="repo">
          <h2>Repository name</h2>
          <p>Repository description</p>
          <ul>
            <li>Stars: 0</li>
            <li>Issues: 0</li>
            <li>Forks: 0</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default App;

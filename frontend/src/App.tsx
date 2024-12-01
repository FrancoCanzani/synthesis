import { Link } from 'react-router';
import './App.css';

function App() {
  return (
    <div className='h-screen mx-auto w-full flex items-center justify-center'>
      <Link to={'/login'} className='font-medium text-xl'>
        Login
      </Link>
    </div>
  );
}

export default App;

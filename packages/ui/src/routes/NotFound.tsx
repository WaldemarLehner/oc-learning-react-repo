import { Link } from 'react-router';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="flex flex-col items-start gap-1">
      <h1 className="text-xl">Not Found</h1>
      <p>The route does not exist</p>
      <Link to={'/'}>
        <Button>Back to main page</Button>
      </Link>
    </div>
  );
}

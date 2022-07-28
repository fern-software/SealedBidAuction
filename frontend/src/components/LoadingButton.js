import { Button } from 'react-bootstrap';
import { useState } from 'react';

const LoadingButton = ({onClick, label, loadingLabel}) => {
  let [isLoading, setIsLoading] = useState(false);

  return (
    <Button className="w-100" disabled={isLoading} variant="dark" onClick={e => {setIsLoading(true); onClick(e);}}>
      {isLoading ? loadingLabel : label}
    </Button>
  );
}

export default LoadingButton;

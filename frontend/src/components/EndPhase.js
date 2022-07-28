import { useState } from "react";
import { Alert, Button } from 'react-bootstrap';
import Phases from './Phases.js';

const EndPhase = ({formBid, contract, phase}) => {
  let [winner, setWinner] = useState(null);
  let [signer, setSigner] = useState(null);

  const queryWinner = async () => {
    const signer = await contract.signer.getAddress();
    const winner = await contract.queryWinner();

    setWinner(winner.from);
    setSigner(signer);

    console.log('winner address: %s', winner);
    console.log('signer address: %s', signer);
  }

	if(phase !== Phases.end){
		return (
			<Alert variant="dark">You revealed {formBid} Wei. Please wait until the end phase to see if you've won 🤞</Alert>
		);
	}

  if(winner === null){
    return (
      <Button variant="dark" className="w-100" onClick={queryWinner}>Query Winner</Button>
    );
  }

	if(winner === signer){
		return (
			<Alert variant="dark">You won 🥳</Alert>
		);
	}

	return (
		<div>
			<Alert variant="dark">You lost 😭</Alert>
			<Button variant="dark" className="w-100" /*onClick={withdraw}*/>Withdraw Bid</Button>
		</div>
	)
}

export default EndPhase;

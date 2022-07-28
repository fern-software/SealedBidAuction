import { useState } from "react";
import { Alert } from 'react-bootstrap';
import Phases from './Phases.js';
import LoadingButton from './LoadingButton.js';

const EndPhase = ({formBid, contract, phase}) => {
  let [winner, setWinner] = useState(null);
  let [signer, setSigner] = useState(null);

  const queryWinner = async () => {
    console.log('attempting to query winner...');
    const signer = await contract.signer.getAddress();
    const winner = await contract.queryWinner();

    setWinner(winner.from);
    setSigner(signer);

    console.log('winner address: %s', winner);
    console.log('signer address: %s', signer);
  }

	if(phase !== Phases.end){
		return (
			<Alert variant="dark">You revealed {formBid} Eth💎. Please wait until the end phase to see if you've won 🤞</Alert>
		);
	}

  if(winner === null){
    return (
      <LoadingButton label="Query Winner" loadingLabel="Querying Winner..." onClick={queryWinner}/>
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
			<LoadingButton label="Withdraw Bid" loadingLabel="Withdrawing..." onClick={() => console.log('Withdrawing is not implemented yet.')}/>
		</div>
	)
}

export default EndPhase;

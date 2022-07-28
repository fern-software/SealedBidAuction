import { Alert } from 'react-bootstrap';
import Phases from './Phases.js';
import LoadingButton from './LoadingButton.js';

const RevealPhase = ({formBid, revealBid, phase}) => {
	return (
		<div>
			<Alert variant="dark">
				You bet {formBid} Wei. <br />
				{phase !== Phases.reveal && "Please wait until the reveal phase to see if you bet enough 💃"}
			</Alert>
			{phase === Phases.reveal && <LoadingButton label="Reveal" loadingLabel="Revealing..." onClick={revealBid}/>}
		</div>
	);
}

export default RevealPhase;

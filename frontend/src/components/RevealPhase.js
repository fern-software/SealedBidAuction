import { Alert, Button } from 'react-bootstrap';
import Phases from './Phases.js';

const RevealPhase = ({formBid, revealBid, phase}) => {
	return (
		<div>
			<Alert variant="dark">
				You bet {formBid} Wei. <br />
				{phase !== Phases.reveal && "Please wait until the reveal phase to see if you bet enough 💃"}
			</Alert>
			{phase === Phases.reveal && <Button variant="dark" className="w-100" onClick={revealBid}>Reveal</Button>}
		</div>
	);
}

export default RevealPhase;

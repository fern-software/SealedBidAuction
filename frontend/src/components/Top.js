import { Alert } from 'react-bootstrap';

const Top = ({contract, connected, phase, revealBlock, endBlock, currentBlock}) => {
	if(connected){
		return (
			<Alert variant="dark">
				<Alert.Heading>{phase}</Alert.Heading>
				<hr />
				Reveal Block: {revealBlock} <br />
				End Block: {endBlock} <br />
				Current Block: {currentBlock} <br />
			</Alert>
		);
	}

	return (
		<Alert variant="dark">
			<Alert.Heading>{contract ? "Please connect your wallet 🦊" : "Please enter the auction's address 👾"}</Alert.Heading>
			<hr />
			Current Block: {currentBlock} <br />
		</Alert>
	);
}

export default Top;
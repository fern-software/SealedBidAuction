const Home = ({onSubmit, onChange}) => {
	
	return (
		<form onSubmit={onSubmit}>
			<input type="text" placeholder="0x0000000000000000000000000000000000000000" onChange={onChange} />
			<input type="submit" value="Connect to Auction" />
		</form>
	);
}

export default Home;

import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import Web3 from 'web3';
import BlogSmartContract from './Blog.json';
import './App.css';

function App() {
	const [web3, setWeb3] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [blogSmartContract, setBlogSmartContract] = useState(null);
	const [posts, setPosts] = useState([]);

	const initWeb3 = () => {
		return new Promise((resolve, reject) => {
			if (typeof window.ethereum !== 'undefined') {
				const web3 = new Web3(window.ethereum);
				window.ethereum
					.enable()
					.then(() => {
						resolve(new Web3(window.ethereum));
					})
					.catch((e) => {
						reject(e);
					});
				return;
			}
			if (typeof window.web3 !== 'undefined') {
				return resolve(new Web3(window.web3.currentProvider));
			}
			resolve(new Web3('http://localhost:9545'));
		});
	};

	const initContract = (_web3) => {
		const deploymentKey = Object.keys(BlogSmartContract.networks)[0];
		return new _web3.eth.Contract(
			BlogSmartContract.abi,
			BlogSmartContract.networks[deploymentKey].address
		);
	};

	useEffect(() => {
		initWeb3()
			.then((_web3) => {
				setWeb3(_web3);
				setBlogSmartContract(initContract(_web3));
				// initApp();
			})
			.catch((e) => console.log(e.message));
	}, []);

	useEffect(() => {
		if (web3 && blogSmartContract) {
			web3.eth
				.getAccounts()
				.then((_accounts) => {
					setAccounts(_accounts);
					return blogSmartContract.methods.list().call();
				})
				.then((result) => {
					setPosts(result);
				})
				.catch((e) => console.log(e.message));
		}
	}, [web3, blogSmartContract]);

	return (
		<div className='App'>
			<header className='App-header'>
				<img src={logo} className='App-logo' alt='logo' />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>
				<a
					className='App-link'
					href='https://reactjs.org'
					target='_blank'
					rel='noopener noreferrer'
				>
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;

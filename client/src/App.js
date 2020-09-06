import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';

import BlogSmartContract from './Blog.json';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const TextArea = styled.textarea`
	resize: none;
	height: 15rem;
	width: 30rem;
`;

const ContentsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: start;
`;

const FormContainer = styled.form`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const SubFormContainer = styled.div`
	display: flex;
	width: 22rem;
	margin-top: 1rem;
	justify-content: space-between;
`;

const PostContainer = styled.div`
	border-width: 0.02rem;
	border-color: black;
	border-style: solid;
	width: 28rem;
	padding: 1rem;
	margin: 0rem;
	display: flex;
	flex-direction: column;
`;

const Post = ({ body, author }) => {
	return (
		<PostContainer>
			<p>{body}</p>
			<p>posted by: {author}</p>
		</PostContainer>
	);
};

function App() {
	const [web3, setWeb3] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [blogSmartContract, setBlogSmartContract] = useState(null);
	const [posts, setPosts] = useState([]);
	const [textInput, setTextInput] = useState('');
	const [authorInput, setAuthorInput] = useState('');

	const initWeb3 = () => {
		return new Promise((resolve, reject) => {
			if (typeof window.ethereum !== 'undefined') {
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
					setPosts(formattedPosts(result));
				})
				.catch((e) => console.log(e.message));
		}
	}, [web3, blogSmartContract]);

	const onSubmit = (e) => {
		e.preventDefault();
		if (authorInput === '' || textInput === '') {
			return alert('Either "author name" or "post body" is empty!');
		}

		blogSmartContract.methods
			.create(textInput, authorInput)
			.send({ from: accounts[0] })
			.then((result) => {
				return blogSmartContract.methods.list().call();
			})
			.then((result) => {
				setPosts(formattedPosts(result));
				setAuthorInput('');
				setTextInput('');
			});
	};

	const formattedPosts = (unformattedPost) => {
		return unformattedPost.map((post) => {
			return { id: parseInt(post[0]), body: post[1], author: post[2] };
		});
	};

	return (
		<Container>
			<h1 style={{ marginBottom: '0.2rem' }}>CSAG: AnonyTalk</h1>
			<h3 style={{ marginTop: '0rem' }}>
				{' '}
				(Powered by Ethereum Smart Contract)
			</h3>
			<FormContainer onSubmit={onSubmit}>
				<TextArea
					placeholder='Remember, be nice!'
					type='text'
					onChange={(e) => setTextInput(e.target.value)}
				></TextArea>
				<SubFormContainer>
					<label>Type your name: </label>
					<input
						placeholder='Anonymous Cat'
						type='text'
						onChange={(e) => setAuthorInput(e.target.value)}
					></input>
					<button>Submit</button>
				</SubFormContainer>
			</FormContainer>
			<h2>Explore the others posts down here!</h2>
			<ContentsContainer>
				{posts
					.map(({ body, author }) => (
						<p>
							<Post body={body} author={author} />
						</p>
					))
					.reverse()}
			</ContentsContainer>
		</Container>
	);
}

export default App;

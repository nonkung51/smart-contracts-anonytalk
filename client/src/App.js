import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import styled from 'styled-components';

import BlogSmartContract from './Blog.json';
import catPics from './catPics.json';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const TextArea = styled.textarea`
	resize: none;
	height: 15rem;
	width: 30rem;
	border-radius: 2rem;
	padding: 1rem 0.8rem;
	border-width: 0rem;

	&:focus {
		-webkit-box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		-moz-box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		transform: scaleX(1.1) scaleY(1.1);
		transform-origin: middle;
		outline: none;
	}
`;

const AuthorInput = styled.input`
	border-radius: 1rem;
	border-width: 0rem;

	&:focus {
		-webkit-box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		-moz-box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		transform: scaleX(1.1) scaleY(1.1);
		transform-origin: middle;
		outline: none;
	}
`;

const SubmitButton = styled.button`
	border-radius: 2rem;
	border-width: 0rem;
	color: white;
	background-color: darkolivegreen;
	cursor: pointer;
	&:hover {
		-webkit-box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		-moz-box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		box-shadow: 0px 0px 21px 15px rgba(0, 0, 0, 0.15);
		transform: scaleX(1.05) scaleY(1.05);
		transform-origin: bottom;
	}
	&:focus {
		outline: none;
	}
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
	background-color: white;
	border-radius: 2rem;
	width: 28rem;
	padding: 1rem;
	margin: 0.4rem;
	display: flex;
	flex-direction: column;

	&:hover {
		-webkit-box-shadow: 0px 1px 13px -6px rgba(0, 0, 0, 0.65);
		-moz-box-shadow: 0px 1px 13px -6px rgba(0, 0, 0, 0.65);
		box-shadow: 0px 1px 13px -6px rgba(0, 0, 0, 0.65);
		transform: scaleX(1.1) scaleY(1.1);
		transform-origin: middle;
		margin-bottom: 1rem;
		margin-top: 1rem;
	}
`;

const Post = ({ body, author }) => {
	return (
		<PostContainer>
			<p>
				<img
					src={author.toCat()}
					alt='Cat'
					width='48'
					height='48'
					style={{
						marginLeft: '0.4rem',
						marginRight: '0.8rem',
						verticalAlign: 'middle',
						borderRadius: '2rem',
					}}
				/>
				{author}
			</p>
			<p>{body}</p>
		</PostContainer>
	);
};

String.prototype.toCat = function () {
	const cats = catPics;
	let hash = 0;
	if (this.length === 0) return hash;
	for (var i = 0; i < this.length; i++) {
		hash = this.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	hash = ((hash % cats.length) + cats.length) % cats.length;
	return cats[hash];
};

function App() {
	const [web3, setWeb3] = useState(null);
	const [accounts, setAccounts] = useState([]);
	const [blogSmartContract, setBlogSmartContract] = useState(null);
	const [posts, setPosts] = useState([]);
	const [textInput, setTextInput] = useState('');
	const [authorInput, setAuthorInput] = useState('');
	const [waiting, setWaiting] = useState(false);

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

		setWaiting(true);
		blogSmartContract.methods
			.create(textInput, authorInput)
			.send({ from: accounts[0] })
			.then(() => {
				return blogSmartContract.methods.list().call();
			})
			.then((result) => {
				setWaiting(false);
				setAuthorInput('');
				setTextInput('');
				setPosts(formattedPosts(result));
			});
	};

	const formattedPosts = (unformattedPost) => {
		return unformattedPost.map((post) => {
			return { id: parseInt(post[0]), body: post[1], author: post[2] };
		});
	};

	return (
		<Container>
			<h1 style={{ marginBottom: '0.2rem', color: 'white' }}>CSAG: AnonyTalk 🎉</h1>
			<h3 style={{ marginTop: '0rem', color: 'white' }}>
				{' '}
				(Powered by Ethereum Smart Contract)
			</h3>
			<FormContainer onSubmit={onSubmit}>
				<TextArea
					placeholder='Remember, be nice!'
					type='text'
					value={textInput}
					onChange={(e) => setTextInput(e.target.value)}
				></TextArea>
				<SubFormContainer>
					<label style={{ color: 'white' }}>Type your name: </label>
					<AuthorInput
						placeholder='Anonymous Cat'
						type='text'
						value={authorInput}
						onChange={(e) => setAuthorInput(e.target.value)}
					></AuthorInput>
					<SubmitButton disabled={waiting}>Submit</SubmitButton>
				</SubFormContainer>
			</FormContainer>
			<hr style={{ width: '9rem', marginTop: '2rem', borderColor: 'white', backgroundColor: 'white' }}></hr>
			{posts.length > 0 && (
				<h2 style={{ color: 'white' }}>Explore the others posts down here!</h2>
			)}
			<ContentsContainer>
				{posts
					.map(({ body, author }) => {
						return <Post body={body} author={author} />;
					})
					.reverse()}
			</ContentsContainer>
		</Container>
	);
}

export default App;

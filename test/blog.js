const Blog = artifacts.require('Blog');

contract('Blog', () => {
	let blog = null;
	before(async () => {
		blog = await Blog.deployed();
	});

	it('Should create a new post', async () => {
		await blog.create('Hello!', 'test');
		const post = await blog.read(1);
		assert(post[0].toNumber() === 1);
		assert(post[1] === 'Hello!');
	});

	it('Should get all posts', async () => {
		await blog.create('Hello2!', 'test');
		const rawPosts = await blog.list();
		const posts = rawPosts.map((post) => {
            return { id: parseInt(post[0]), body: post[1], author: post[2] };
        });
		assert.deepEqual(posts, [
			{ id: 1, body: 'Hello!', author: 'test' },
			{ id: 2, body: 'Hello2!', author: 'test' },
		]);
	});
});

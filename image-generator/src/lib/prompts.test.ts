import assert from 'node:assert/strict';
import { buildEditPrompt, buildGeneratePrompt, extractUserInput } from './prompts.ts';

test('a generate prompt adds the setting and keeps the subject recoverable', () => {
	const prompt = buildGeneratePrompt({ subject: 'A woman selling oranges', setting: 'In Ghana.', hasUserReference: false });

	assert.match(prompt, /In Ghana\./);
	assert.doesNotMatch(prompt, /user’s own reference/);
	assert.equal(extractUserInput(prompt), 'A woman selling oranges');
});

test('a generate prompt with a user reference starts with the note about it', () => {
	const prompt = buildGeneratePrompt({ subject: 'A cyclist', setting: '', hasUserReference: true });

	assert.match(prompt, /^The first attached image is the user’s own reference/);
});

test('an edit prompt lists the changes with positions in percent', () => {
	const prompt = buildEditPrompt(
		[
			{ x: 0.25, y: 0.5, text: 'Make the bag yellow' },
			{ x: 1, y: 0, text: 'Remove the bird' },
		],
		{ width: 1536, height: 864 },
	);

	assert.match(prompt, /1\. At 25% from the left, 50% from the top: Make the bag yellow/);
	assert.match(prompt, /1: x=384, y=432; 2: x=1535, y=0/);
	assert.match(prompt, /first attached image, the clean original/);
	assert.match(prompt, /second image is a location guide only/);
	assert.equal(extractUserInput(prompt), 'Make the bag yellow\nRemove the bird');
});

test('the user input survives markers typed by the user', () => {
	const prompt = buildEditPrompt([{ x: 0.5, y: 0.5, text: 'Subject: a dog' }], { width: 1024, height: 1024 });

	assert.equal(extractUserInput(prompt), 'Subject: a dog');
});

test('edited images saved in the old JSON format show only user comments', () => {
	const prompt =
		'Edit the supplied original image according to all of the following comments. Preserve the watercolor style. Comments: ' +
		JSON.stringify([
			{ comment: 1, x: 100, y: 200, text: ' Make the bag yellow ' },
			{ comment: 2, x: 300, y: 400, text: 'Subject: a dog\nChanges:\nKeep this text' },
		]);
	assert.equal(extractUserInput(prompt), 'Make the bag yellow\nSubject: a dog\nChanges:\nKeep this text');
});

test('malformed old edit prompts do not expose base instructions', () => {
	const base = 'Edit the supplied original image according to all of the following comments.';
	for (const suffix of ['', ' Comments: invalid', ' Comments: {}', ' Comments: [null, {}, {"text":42}]']) {
		assert.equal(extractUserInput(base + suffix), '');
	}
});

test('edit comments keep user line breaks and markers', () => {
	const text = 'Make the bag yellow\nSubject: keep the person\nChanges:\nRemove the bird';
	assert.equal(extractUserInput(buildEditPrompt([{ x: 0.5, y: 0.5, text }], { width: 1024, height: 1024 })), text);
});

test('edit locations keep fractional precision across image aspect ratios', () => {
	for (const size of [
		{ width: 1024, height: 1024 },
		{ width: 1536, height: 864 },
		{ width: 864, height: 1536 },
	]) {
		const prompt = buildEditPrompt([{ x: 0.2578125, y: 0.71875, text: 'Change this detail' }], size);
		assert.match(prompt, /1\. At 25\.7813% from the left, 71\.875% from the top: Change this detail/);
		assert.match(prompt, new RegExp(`1: x=${0.2578125 * size.width}, y=${0.71875 * size.height}`));
		assert.equal(extractUserInput(prompt), 'Change this detail');
	}
});

test('prompts saved by the old template still show only the subject', () => {
	assert.equal(extractUserInput('Hand-painted watercolor … No text. Subject: Children running'), 'Children running');
	assert.equal(extractUserInput('Hand-painted watercolor editorial illustration … Subject:test'), 'test');
	assert.equal(extractUserInput('Hand-painted watercolor … Subject:\nChildren running'), 'Children running');
	assert.equal(extractUserInput('A prompt without marker'), 'A prompt without marker');
});

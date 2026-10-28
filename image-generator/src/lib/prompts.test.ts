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
	const prompt = buildEditPrompt([
		{ x: 0.25, y: 0.5, text: 'Make the bag yellow' },
		{ x: 1, y: 0, text: 'Remove the bird' },
	]);

	assert.match(prompt, /1\. At 25% from the left, 50% from the top: Make the bag yellow/);
	assert.equal(
		extractUserInput(prompt),
		'1. At 25% from the left, 50% from the top: Make the bag yellow\n2. At 100% from the left, 0% from the top: Remove the bird',
	);
});

test('the user input survives markers typed by the user', () => {
	const prompt = buildEditPrompt([{ x: 0.5, y: 0.5, text: 'Subject: a dog' }]);

	assert.match(extractUserInput(prompt), /: Subject: a dog$/);
});

test('prompts saved by the old template still show only the subject', () => {
	assert.equal(extractUserInput('Hand-painted watercolor … No text. Subject: Children running'), 'Children running');
	assert.equal(extractUserInput('A prompt without marker'), 'A prompt without marker');
});

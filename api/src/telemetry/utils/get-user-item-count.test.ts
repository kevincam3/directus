import { SchemaBuilder } from '@directus/schema-builder';
import { type Knex } from 'knex';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getSchema } from '../../utils/get-schema.js';
import { getItemCount } from './get-item-count.js';
import { getUserItemCount, sum } from './get-user-item-count.js';

vi.mock('../../utils/get-schema.js');
vi.mock('./get-item-count.js');

let mockDb: Knex;

beforeEach(() => {
	mockDb = {} as unknown as Knex;

	vi.mocked(getItemCount).mockImplementation(async (_db, collections) => {
		const res: Record<string, number> = {};

		for (const collection of collections) {
			res[collection.collection] = 15;
		}

		return res;
	});
});

afterEach(() => {
	vi.clearAllMocks();
});

describe('sum', () => {
	test('Sums', () => {
		const res = sum(15, 25);
		expect(res).toBe(40);
	});
});

describe('getUserItemCount', () => {
	const schema = new SchemaBuilder()
		.collection('test-a', (c) => {
			c.field('id').id();
		})
		.collection('test-b', (c) => {
			c.field('id').id();
		})
		.collection('directus_a', (c) => {
			c.field('id').id();
		})
		.collection('directus_users', (c) => {
			c.field('id').id();
		})
		.build();

	test('Calls getItemCount for all user collections in the schema', async () => {
		vi.mocked(getSchema).mockResolvedValue(schema);

		await getUserItemCount(mockDb);

		expect(getItemCount).toHaveBeenCalledWith(mockDb, [
			{ collection: 'test-a' },
			{ collection: 'test-b' },
			{ collection: 'directus_a' },
		]);
	});

	test('Returns collection count and summed item total', async () => {
		vi.mocked(getSchema).mockResolvedValue(schema);

		const res = await getUserItemCount(mockDb);

		expect(res).toEqual({ collections: 3, items: 45 });
	});
});

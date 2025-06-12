import { UserService } from '@socialincome/shared/src/database/user/user.service';
import { CreateUserInput } from '@socialincome/shared/src/database/user/user.types';
import { BaseImporter } from '../core/base.importer';

export class UsersImporter extends BaseImporter<CreateUserInput> {
	private readonly userService: UserService;

	constructor() {
		super();
		this.userService = new UserService();
	}

	import = async (users: CreateUserInput[]): Promise<number> => {
		const result = await this.userService.createUsers(users);

		if (result.success === false) {
			throw new Error(result.error ?? 'Unknown error during user import');
		}

		return result.data;
	};
}

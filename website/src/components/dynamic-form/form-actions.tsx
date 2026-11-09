import { Button } from '@socialincome/design-system/actions/button/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@socialincome/design-system/overlays/dialog/dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export type ExtraAction = {
	label: string;
	confirmTitle: string;
	confirmDescription: string;
	confirmLabel?: string;
	onConfirm: () => void;
};

type FormActionsProps = {
	mode: 'add' | 'edit' | 'readonly';
	isLoading?: boolean;
	onCancel?: () => void;
	onDelete?: () => void;
	extraAction?: ExtraAction;
};

type ConfirmState = {
	title: string;
	description: string;
	confirmLabel: string;
	variant: 'default' | 'destructive';
	onConfirm: () => void;
};

export const FormActions = ({ mode, isLoading = false, onCancel, onDelete, extraAction }: FormActionsProps) => {
	const t = useTranslations('portal-shared');
	const [confirm, setConfirm] = useState<ConfirmState | null>(null);
	const showSave = mode !== 'readonly';
	const showSecondaryActions = mode === 'edit' && (onDelete !== undefined || extraAction !== undefined);

	const closeConfirm = () => setConfirm(null);

	return (
		<>
			<div className="flex min-w-0 flex-wrap items-center justify-end gap-3">
				{showSecondaryActions && (
					<div className="mr-auto flex flex-wrap items-center gap-3">
						{onDelete && (
							<Button
								type="button"
								variant="destructive-outline"
								disabled={isLoading}
								onClick={() =>
									setConfirm({
										title: t('form.deleteConfirmTitle'),
										description: t('form.deleteConfirmDescription'),
										confirmLabel: t('form.deletePermanently'),
										variant: 'destructive',
										onConfirm: onDelete,
									})
								}
							>
								{t('form.delete')}
							</Button>
						)}

						{extraAction && (
							<Button
								type="button"
								variant="ghost"
								disabled={isLoading}
								onClick={() =>
									setConfirm({
										title: extraAction.confirmTitle,
										description: extraAction.confirmDescription,
										confirmLabel: extraAction.confirmLabel ?? extraAction.label,
										variant: 'default',
										onConfirm: extraAction.onConfirm,
									})
								}
							>
								{extraAction.label}
							</Button>
						)}
					</div>
				)}

				{(onCancel !== undefined || showSave) && (
					<div className="flex items-center gap-3">
						{onCancel && (
							<Button type="button" variant="outline" disabled={isLoading} onClick={onCancel}>
								{t('form.cancel')}
							</Button>
						)}

						{showSave && (
							<Button type="submit" disabled={isLoading}>
								{t('form.save')}
							</Button>
						)}
					</div>
				)}
			</div>

			<Dialog
				open={confirm !== null}
				onOpenChange={(open) => {
					if (!open) {
						closeConfirm();
					}
				}}
			>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>{confirm?.title}</DialogTitle>
						<DialogDescription>{confirm?.description}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={closeConfirm}>
							{t('form.cancel')}
						</Button>
						<Button
							variant={confirm?.variant}
							onClick={() => {
								const onConfirm = confirm?.onConfirm;
								closeConfirm();
								onConfirm?.();
							}}
						>
							{confirm?.confirmLabel}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export const canCreatePortalProgramDonation = (accessiblePrograms: { programId: string }[], programId: string): boolean =>
	accessiblePrograms.some((program) => program.programId === programId);

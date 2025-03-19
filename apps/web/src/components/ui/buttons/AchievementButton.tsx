"use client";

import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n";
import type * as React from "react";

interface AchievementButtonProps {
	hasNewAchievement?: boolean;
}

export function AchievementButton({
	hasNewAchievement = true,
}: AchievementButtonProps) {
	const router = useRouter();
	const { t } = useTranslation();

	return (
		<button
			type="button"
			onClick={() => router.push("/achievements")}
			className={cn(
				"relative h-[50px] w-[320px] rounded-[20px] bg-brand-secondary shadow-[0px_4px_4px_rgba(0,0,0,0.25)] hover:bg-brand-secondary/90",
				"flex items-center justify-center",
				"transform transition-all duration-300 hover:scale-105",
				"sm:w-[365px]",
			)}
		>
			<div className="absolute left-6">
				{hasNewAchievement && (
					<div className="h-3 w-3 rounded-full bg-accent-red" />
				)}
			</div>
			<span className="font-spaceGrotesk text-base font-medium text-white sm:text-lg">
				{t('achievements.title')}
			</span>
		</button>
	);
}

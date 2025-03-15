"use client";

import type * as React from "react";
import { useEffect, useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/base/avatar";
import { getQuotesForLanguage } from "@/data/motivationalQuotes";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/i18n";

interface User {
	name: string;
	last_name: string;
	level: string;
	points: number;
	maxPoints: number;
}

interface ProfileCardProps {
	className?: string;
	user?: User;
}

interface ProfileAvatarProps {
	name: string;
	lastName: string;
}

interface LevelProgressProps {
	points: number;
	maxPoints: number;
}

function ProfileAvatar({ name, lastName }: ProfileAvatarProps) {
	const initials = useMemo(() => {
		return `${name[0]}${lastName[0]}`.toUpperCase();
	}, [name, lastName]);

	return (
		<Avatar className="h-16 w-16 border-2 border-white shadow-lg sm:h-20 sm:w-20">
			<AvatarFallback className="bg-white text-lg font-bold text-brand-secondary sm:text-xl">
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}

function LevelProgress({ points, maxPoints }: LevelProgressProps) {
	const progress = (points / maxPoints) * 100;
	const { t, tWithVars } = useTranslation();

	return (
		<div className="w-full max-w-[250px]" aria-label={t('profile.levelProgress')}>
			<div className="relative h-2 rounded-full bg-white/30">
				<div
					className="absolute left-0 top-0 h-full rounded-full bg-[#E36C59] transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<p className="mt-1 text-center text-xs font-medium text-white">
				{tWithVars('profile.pointsToLevelUp', { points, maxPoints })}
			</p>
		</div>
	);
}

export function ProfileCard({
	className,
	user = {
		name: "John",
		last_name: "Doe",
		level: "Conscious Explorer",
		points: 45,
		maxPoints: 100,
	},
}: ProfileCardProps) {
	const { language } = useLanguage();
	const quotes = getQuotesForLanguage(language);
	const [quote, setQuote] = useState<string>(quotes[0]);
	const { t } = useTranslation();

	useEffect(() => {
		const getRandomQuote = (): string => {
			const randomIndex = Math.floor(Math.random() * quotes.length);
			return quotes[randomIndex];
		};

		setQuote(getRandomQuote());

		const intervalId = setInterval(() => {
			setQuote((prevQuote) => {
				let newQuote: string;
				do {
					newQuote = getRandomQuote();
				} while (newQuote === prevQuote);
				return newQuote;
			});
		}, 10000);

		return () => clearInterval(intervalId);
	}, [quotes]);

	return (
		<div
			className={cn(
				"w-full max-w-[365px] rounded-[20px] bg-gradient-to-br from-[#387478] to-[#2C5154] shadow-lg",
				"transform hover:scale-105 hover:-translate-y-1 hover:rotate-1",
				"shadow-[0_10px_20px_rgba(0,0,0,0.2),_0_6px_6px_rgba(0,0,0,0.25)]",
				"hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),_0_10px_10px_rgba(0,0,0,0.22)]",
				"transition-all duration-300",
				className,
			)}
		>
			<div className="absolute inset-0 translate-y-2 transform rounded-[20px] bg-black opacity-20 blur-md" />
			<div className="relative z-10 flex flex-col items-center p-4 sm:p-6">
				<ProfileAvatar name={user.name} lastName={user.last_name} />

				<div className="mt-4 text-center">
					<h3 className="text-xl font-bold text-white sm:text-2xl">
						{user.name} {user.last_name}
					</h3>
					<p className="mt-1 text-sm font-medium text-white">
						{t('profile.level')}: {user.level}
					</p>
				</div>

				<LevelProgress points={user.points} maxPoints={user.maxPoints} />

				<div className="mt-4 w-full">
					<p className="mb-2 text-sm font-medium text-white">
						{t('profile.dailyMotivation')}:
					</p>
					<h2 className="text-lg font-bold leading-tight text-accent-red sm:text-xl">
						{quote}
					</h2>
				</div>
			</div>
		</div>
	);
}

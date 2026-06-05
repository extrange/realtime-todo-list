import { Text } from "@mantine/core";
import React, { useMemo } from "react";

type InputProps = {
	text: string;
	query: string;
};

export const HighlightedText = React.memo(({ text, query }: InputProps) => {
	const parts = useMemo(() => {
		const trimmed = query.trim();
		if (!trimmed) return [{ text, match: false }];

		const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

		if (terms.length === 0) return [{ text, match: false }];

		const escapedTerms = terms.map((t) =>
			t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
		);
		const regex = new RegExp(`(${escapedTerms.join("|")})`, "gi");

		return text.split(regex).map((part) => ({
			text: part,
			match: terms.some((t) => t === part.toLowerCase()),
		}));
	}, [text, query]);

	if (parts.length === 1 && !parts[0].match) {
		return <Text span>{text}</Text>;
	}

	return (
		<Text span>
			{parts.map(({ text: partText, match }, i) => {
				const key = `${i}-${partText.slice(0, 10)}`;
				return match ? (
					<mark key={key}>{partText}</mark>
				) : (
					<span key={key}>{partText}</span>
				);
			})}
		</Text>
	);
});

HighlightedText.displayName = "HighlightedText";

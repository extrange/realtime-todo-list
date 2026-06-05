import { CloseButton, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useSearchStore } from "../appStore/searchStore";

export const SearchInput = React.memo(() => {
	const searchQuery = useSearchStore((s) => s.searchQuery);
	const setSearchQuery = useSearchStore((s) => s.setSearchQuery);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) =>
			setSearchQuery(e.currentTarget.value),
		[setSearchQuery],
	);

	const onClear = useCallback(() => setSearchQuery(""), [setSearchQuery]);

	return (
		<TextInput
			ref={inputRef}
			value={searchQuery}
			onChange={onChange}
			placeholder="Search todos…"
			leftSection={<IconSearch size={16} />}
			rightSection={
				searchQuery ? <CloseButton size="sm" onClick={onClear} /> : undefined
			}
			size="sm"
		/>
	);
});

SearchInput.displayName = "SearchInput";

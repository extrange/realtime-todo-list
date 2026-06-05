import { Alert, Anchor, AppShell, Group, ScrollArea } from "@mantine/core";
import { useLocalStorage, useViewportSize } from "@mantine/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import {
	Profiler,
	type ProfilerOnRenderCallback,
	type SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";
import classes from "./App.module.css";
import { AppAside } from "./AppAside";
import { AppFooter } from "./AppFooter";
import { AppHeader } from "./AppHeader/AppHeader";
import { AppNavbar } from "./AppNavbar";
import { useSearchStore } from "./appStore/searchStore";
import { CURRENT_ROOM_LOCALSTORAGE_KEY } from "./constants";
import { EditTodoWrapper } from "./EditTodoWrapper/EditTodoWrapper";
import { SearchResults } from "./SearchResult/SearchResults";
import { TodoView } from "./TodoView/TodoView";
import { useIsReadOnly } from "./useIsReadOnly";

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 30;

export const App = () => {
	const [navOpen, setNavOpen] = useState(false);
	const [asideOpen, setAsideOpen] = useState(false);
	const { height } = useViewportSize();
	const { isReadOnly, nextRoomId } = useIsReadOnly();
	const [, setCurrentRoomId] = useLocalStorage({
		key: CURRENT_ROOM_LOCALSTORAGE_KEY,
	});
	const isSearchOpen = useSearchStore((s) => s.isSearchOpen);
	const openSearch = useSearchStore((s) => s.openSearch);
	const closeSearch = useSearchStore((s) => s.closeSearch);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "/" && !isSearchOpen) {
				const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
				const isEditable =
					tag === "input" ||
					tag === "textarea" ||
					tag === "select" ||
					(e.target as HTMLElement)?.getAttribute("contenteditable") === "true";

				if (!isEditable) {
					e.preventDefault();
					openSearch();
				}
			}

			if (e.key === "Escape" && isSearchOpen) {
				closeSearch();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [openSearch, closeSearch, isSearchOpen]);

	/* For AppHeader: Don't allow both the NavBar and Aside to be open */
	const _setNavOpen = useCallback((open: SetStateAction<boolean>) => {
		setNavOpen(open);
		open && setAsideOpen(false);
	}, []);

	const _setAsideOpen = useCallback((open: SetStateAction<boolean>) => {
		setAsideOpen(open);
		open && setNavOpen(false);
	}, []);

	const closeNav = useCallback(() => setNavOpen(false), []);

	const logRender: ProfilerOnRenderCallback = useCallback(
		(id, phase, duration) => duration > 10 && console.info(id, phase, duration),
		[],
	);

	const switchToNewRoom = useCallback(() => {
		if (nextRoomId) setCurrentRoomId(nextRoomId);
	}, [nextRoomId, setCurrentRoomId]);

	return (
		<AppShell
			navbar={{
				width: { sm: 200, lg: 300 },
				breakpoint: "sm",
			}}
			aside={{
				width: { sm: 200, lg: 300 },
				breakpoint: "sm",
			}}
			header={{ height: HEADER_HEIGHT }}
			footer={{ height: FOOTER_HEIGHT }}
		>
			<AppHeader
				navOpen={navOpen}
				setNavOpen={_setNavOpen}
				asideOpen={asideOpen}
				setAsideOpen={_setAsideOpen}
			/>
			<AppAside asideOpen={asideOpen} />
			<AppNavbar navOpen={navOpen} closeNav={closeNav} />
			<Profiler id={"AppFooter"} onRender={logRender}>
				<AppFooter />
			</Profiler>
			<AppShell.Main className={classes.main}>
				{isReadOnly && (
					<Alert
						variant="light"
						color="yellow"
						title="This room is read-only"
						icon={<IconAlertTriangle />}
						mb="sm"
					>
						<Group justify="space-between" align="center">
							Data has been exported for migration.{" "}
							<Anchor
								component="button"
								onClick={switchToNewRoom}
								fw={700}
								underline="always"
							>
								Switch to the new room
							</Anchor>{" "}
							and import the downloaded file.
						</Group>
					</Alert>
				)}
				<EditTodoWrapper />
				<ScrollArea h={height - HEADER_HEIGHT - FOOTER_HEIGHT}>
					{isSearchOpen ? (
						<SearchResults />
					) : (
						<Profiler
							id={"TodoView"}
							onRender={(id, phase, duration) =>
								duration > 15 && console.info(id, phase, duration)
							}
						>
							<TodoView />
						</Profiler>
					)}
				</ScrollArea>
			</AppShell.Main>
		</AppShell>
	);
};

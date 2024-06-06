interface HaomeProps {
	children: React.ReactNode;
}

export function Haome({ children }: HaomeProps) {
	return (
		<>
			<h1>Haome</h1>
			{children}
		</>
	);
}

import { ReactNode, useState } from "react";

type Props = {
	tabOptions: ReactNode[],
	startTab: number,
	bodies: ReactNode[]
}

export default function Tabs(props: Props) {
	const {
		tabOptions,
		startTab = 0,
		bodies
	} = props;

	const [currentTab, setCurrentTab] = useState<number>(startTab);

	return <div>
		<header>
			{tabOptions.map((tab, i) => <div onClick={() => setCurrentTab(i)}>
				{tab}
			</div>)}
		</header>
		<div>
			{bodies[currentTab]}
		</div>
	</div>
}

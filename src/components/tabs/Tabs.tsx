import { ComponentType, ReactNode, useState } from "react";
import defaultStyles from "./Tabs.module.css";

type TabProps = {
	isSelected: boolean
}

type Props = {
	styles?: {
		readonly [key: string]: string;
	},
	tabOptions: (ComponentType<TabProps> | ReactNode)[],
	bodies: ReactNode[]
	startTab?: number,
}

export default function Tabs(props: Props) {
	const {
		styles = defaultStyles,
		tabOptions,
		startTab = 0,
		bodies
	} = props;

	const [currentTab, setCurrentTab] = useState<number>(startTab);

	return <div className={styles.main}>
		<header className={styles.tabs}>
			{tabOptions.map((Tab, i) => {
				const isSelected = i === currentTab;
				return <div
					key={i}
					onClick={() => setCurrentTab(i)}
					className={styles.tab + (isSelected ? ' ' + styles.selected : '')}>
					{typeof Tab === 'function' ?
						<Tab isSelected={isSelected}/> :
						Tab
					}
				</div>;
			})}
		</header>
		<div>
			{bodies[currentTab]}
		</div>
	</div>
}

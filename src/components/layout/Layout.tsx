import "@/src/styles/globals.css";
import styles from "@/src/styles/layout.module.css";
import { UserInfo } from "./header/Header";
import { Nav } from "./Nav";
import Image from "next/image";
import { ReactNode } from "react";
import { StoreProvider } from "@/src/lib/store/StoreProvider";

export interface ComponentProps {
	readonly children: ReactNode;
}

export default function Layout({ children }: ComponentProps) {
	return <StoreProvider>
		<html lang="en">
			<body>
				<section className={styles.container}>

					<header className={styles.header}>
						<UserInfo/>
						<Nav />
						<Image
							src="/logo.svg"
							className={styles.logo}
							alt="logo"
							width={100}
							height={100}
						/>
					</header>

					<main className={styles.main}>{children}</main>

					{/* <footer className={styles.footer}> </footer> */}
				</section>
			</body>
		</html>
	</StoreProvider>;
}
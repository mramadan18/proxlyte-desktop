import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { Button } from "@heroui/react";

export default function HomePage() {
  return (
    <Fragment>
      <Head>
        <title>Home - Nextron (basic-lang-typescript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -<Link href="/next">Go to next page</Link>
        </p>
        <Image
          src="/images/logo.png"
          alt="Logo image"
          width={256}
          height={256}
        />
      </div>
      <Button>My Button</Button>
    </Fragment>
  );
}

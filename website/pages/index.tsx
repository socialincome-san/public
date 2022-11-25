import Layout from "../components/layout";
import Link from "next/link";

export default function Home() {
  return (
      <Layout title={"Home"}>
        <section>
          <p>Welcome to SocialIncome.org</p>
        </section>
          <section>
              <Link href="/transparency/finances">Current Finances</Link>
          </section>
      </Layout>
  )
}

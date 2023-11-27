import { Card, CardContent, Typography } from '@socialincome/ui';

export function Explainer() {
	return (
		<div>
			<Typography as="h1" size="3xl">
				Selecting Recipients
			</Typography>
			<p>
				Social Income, like any UBI project, has limited financial resources. Choosing who gets help and who doesn&#39;t
				is tough. We want everyone to understand how we select our recipients. Since November 2023, we’ve employed a new
				way to randomly select people from poor communities, thanks to our partnership with{' '}
				<a href="https://drand.love">drand</a>.
			</p>
			<br />
			<Typography as="h2" size="2xl">
				Our selection process in 3 steps:
			</Typography>
			<br />
			<Typography as="h2" size="xl">
				Step 1: Finding potential recipients
			</Typography>
			<p>
				We team up with a variety of international and local NGOs who support marginalized communities and are familiar
				with poverty at the local level. After visiting and positively assessing these NGOs – as well as the areas and
				communities they support – we may request that they provide us with a list of all potential recipients.
			</p>
			<p>
				Potential recipients are people living in poverty with whom they maintain direct contact. Depending on the
				communities supported, those lists can include anything from 100 to 1000 names.
			</p>

			<br />
			<Typography as="h2" size="xl">
				Step 2: Selecting at random and with utmost transparency
			</Typography>
			<p>
				The <a href="https://github.com/socialincome-san/public/tree/main/recipients_selection/lists">lists</a> we are
				working with during selection contain minimal information about potential recipients. They are subsequently
				anonymized (hashed) and uploaded to our{' '}
				<a href="https://github.com/socialincome-san/public">open-source repository</a>. With the help of a random
				number generated and published by <a href="https://drand.love/about/">drand</a>, a mechanism is set in place to
				select a predetermined number of individuals from the list. This process can be mathematically traced back and
				verified without compromising recipients’ data.
			</p>
			<Card>
				<CardContent>
					<br />
					<p>
						🔎 Upcoming: allowing everyone to easily verify for themselves whether or not they&#39;re on one of the
						NGOs&#39; lists or whether they have been chosen.
					</p>
				</CardContent>
			</Card>
			<br />
			<Typography as="h2" size="xl">
				Step 3: Communicating transparently
			</Typography>
			<p>
				After a draw, we reach out to both the NGO and the community directly to share the results. The beneficiaries
				who were selected – upon confirming their participation – then provide additional information and are onboarded
				for our 3-year program
			</p>
			<br />
			<Typography as="h2" size="2xl">
				Frequently asked questions
			</Typography>
			<br />
			<Typography as="h2" size="xl">
				Why do we select randomly out of a pool of qualified recipients?
			</Typography>
			<p>
				The purpose of employing this random selection method is to achieve several objectives. Firstly, it helps
				prevent bias in our recipient selection, ensuring that relatives or acquaintances of individuals involved in the
				process are not given preferential treatment. Secondly, it aims to avoid tensions between recipients and
				non-recipients, as well as any potential conflicts between recipients and our organization. Lastly, we strive to
				incorporate technology where it is feasible and beneficial to the process.
			</p>

			<br />
			<Typography as="h2" size="xl">
				Who can influence the draft?
			</Typography>
			<p>
				By relying on an unpredictable random value from drand, set to be emitted in the future, it&#39;s not possible
				for anyone to sway the results of the selection process. This inherent randomness can be utilized to confirm the
				integrity of the selection. To qualify for Social Income, an individual must first be on a list provided by an
				NGO. While this does present a preliminary condition, it aligns with our foundational principle: ensuring that
				Social Income reaches those most in need.
			</p>

			<br />
			<Typography as="h2" size="xl">
				How do we avoid bias and tensions?
			</Typography>
			<p>
				To ensure we don&#39;t inadvertently prioritize a specific ethnic group, gender, or occupation, we collaborate
				with diverse NGOs that have varied missions. In line with our &#39;do no harm&#39; policy, we strive to prevent
				tensions among recipients, non-recipients, communities, and the NGOs. Our random selection plays a pivotal role
				in achieving this. It ensures that those related to or acquainted with individuals in the process aren&#39;t
				shown favoritism, which could lead to conflicts.
			</p>

			<br />
			<Typography as="h2" size="xl">
				What is happening during the selection process?
			</Typography>
			<p>
				We utilize the random number provided by drand, which is publicly accessible, to pick a set number of
				individuals from our list. Here&#39;s how it&#39;s done: we first organize the hashed list of recipients. Then,
				using the randomness element from drand, we convert it into a position on the list through a{' '}
				<a href="https://en.wikipedia.org/wiki/Key_derivation_function">key derivation function</a>. For those keen on
				the technical details, the function and its associated processes are documented in our{' '}
				<a href="https://github.com/drand/draw-action">Github repository</a>.
			</p>

			<br />
			<Typography as="h2" size="xl">
				What is drand and who is behind it?
			</Typography>
			<p>
				The drand project generates random numbers that everyone can trust. It can be applied to create truly random and
				verifiable drafts. Initiated in 2017 at EPFL by Nicolas Gailly, drand received support from Philipp Jovanovic
				and was guided by Bryan Ford.
			</p>
			<p>
				It has since become independently managed and maintains a network called the{' '}
				<a href="https://www.cloudflare.com/leagueofentropy/">League of Entropy</a> with EPFL, UCL, Cloudflare, Kudelski
				Security, the University of Chile, and Protocol Labs. Current core maintainers of the open source project are
				the CEO, CSO and CTO of Randamu, respectively{' '}
				<a href="https://www.linkedin.com/in/erick-watson/">Erick Watson</a>,{' '}
				<a href="https://www.linkedin.com/in/anomalroil/">Yolan Romailler</a>, and{' '}
				<a href="https://www.linkedin.com/in/patrickmcclurg/">Patrick McClurg</a>.
			</p>
			<br />
		</div>
	);
}

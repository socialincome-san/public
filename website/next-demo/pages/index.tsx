import Counter from '../components/Counter'

export default function Home() {
    const someProps = {
        count: 0,
    };
    return (
        <main>
            <Counter {...someProps}>
                <h1>Hello, React!</h1>
            </Counter>
        </main>
    )
}

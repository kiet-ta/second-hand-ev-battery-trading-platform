export default function Error500()
{
    return (
    <Result
    status="500"
    title="500"
    subTitle="Sorry, something went wrong."
    extra={<Button type="primary" key="home" href="/">Back Home</Button>}
    />
    )
}
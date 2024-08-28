import AuthOverview from "./_components/AuthOverview";
import ExampleList from "./_components/ExampleList";

const Page = async () => {
  return (
    <article className="container">
      <AuthOverview />
      <br />
      <ExampleList />
    </article>
  );
};

export default Page;

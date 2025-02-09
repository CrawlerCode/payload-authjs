import config from "@payload-config";
import { getPayload } from "payload";
import { getPayloadSession } from "payload-authjs";

const payload = await getPayload({ config });

const ExampleList = async () => {
  const session = await getPayloadSession();

  if (!session) {
    return <p>Sign in to see examples</p>;
  }

  let examples;
  try {
    examples = await payload.find({
      collection: "examples",
      // Use the current user's access level
      overrideAccess: false,
      user: session.user,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return <p>Failed to load examples: {error.message}</p>;
  }

  return (
    <section>
      <h1 className="text-xl font-bold">Examples</h1>
      <ul className="list-disc pl-7">
        {examples.docs.map(example => (
          <li key={example.id}>
            <p>{JSON.stringify(example)}</p>
          </li>
        ))}
        {examples.docs.length === 0 && <p>No examples found</p>}
      </ul>
    </section>
  );
};

export default ExampleList;

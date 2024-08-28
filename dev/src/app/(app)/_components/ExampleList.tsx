import config from "@payload-config";
import { getPayloadHMR } from "@payloadcms/next/utilities";

const payload = await getPayloadHMR({ config });

const ExampleList = async () => {
  let examples;
  try {
    examples = await payload.find({
      collection: "examples",
    });
  } catch (error: any) {
    return <p>Failed to load examples: {error.message}</p>;
  }

  return (
    <div>
      <h1>Examples</h1>
      <ul>
        {examples.docs.map(example => (
          <li key={example.id}>
            <p>{JSON.stringify(example)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExampleList;

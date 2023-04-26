import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
delete configuration.baseOptions.headers["User-Agent"];

const openai = new OpenAIApi(configuration);

export const call = async (
  prompt: string,
  onData: (data: string, isFinished?: boolean) => void
) => {
  await openai.createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    },
    {
      responseType: "stream",
      onDownloadProgress: (progressEvent) => {
        const isFinished =
          progressEvent.target.responseText.split("data: ").slice(-1)[0] ===
          "[DONE]\n\n";

        const regex = /"delta":{"content":"(.*)"},/g;
        const array = [...progressEvent.target.responseText.matchAll(regex)];

        const text = array.map((a) => a[1]);
        onData(text.slice(-1).join(), isFinished);
      },
    }
  );
};

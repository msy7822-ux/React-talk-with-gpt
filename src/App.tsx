import { useEffect, useState } from "react";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { call } from "./lib/api/openai";

const App = () => {
  const [trigger, setTrigger] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const [disabled, setDisabled] = useState(false);
  const [finishMessage, setFinishMessage] = useState(false);
  const [messageText, setMessageText] = useState<string>("");

  const onData = (data: string, isFinished?: boolean) => {
    setResponse(data);
    setFinishMessage(isFinished ?? false);
  };

  const callApi = async () => {
    await call(messageText, onData);
    setIsLoading(false);
    setTrigger(false);
    setDisabled(false);
  };

  const { startRecognition, stopRecognition, text } = useSpeechRecognition({
    enabled: true,
    lang: "ja",
    continuous: true,
    interimResults: true,
  });

  useEffect(() => {
    setMessageText(text);
  }, [text]);

  useEffect(() => {
    if (trigger) callApi();
  }, [trigger]);

  useEffect(() => {
    if (response.length > 0) setIsLoading(false);

    if (finishMessage) {
      const uttr = new SpeechSynthesisUtterance(
        response
          .replace(/\r?\n?/, "")
          .replace(/\n\n/, "")
          .replace(/\n\n\n/, "")
      );
      window.speechSynthesis.speak(uttr);
      uttr.onend = () => {
        setFinishMessage(false);
        setResponse("");
      };
    }
  }, [response, finishMessage]);

  return (
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        disabled={disabled}
        onClick={() => {
          stopRecognition();
          setTrigger(true);
          setIsLoading(true);
          setDisabled(true);
        }}
      >
        送信
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        onClick={() => {
          startRecognition();
        }}
      >
        音声入力
      </button>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
        onClick={() => {
          stopRecognition();
          window.location.reload();
        }}
      >
        音声入力stop
      </button>

      <div>Q: {messageText}</div>
      <div className="text-left">
        A:{" "}
        {isLoading ? (
          <p>送信中...</p>
        ) : (
          <>
            {response
              .replace(/\r?\n?/, "")
              .replace(/\n\n/, "")
              .replace(/\n\n\n/, "")}
          </>
        )}
      </div>
    </div>
  );
};

export default App;

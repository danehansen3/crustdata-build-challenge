"use client"
import Image from "next/image"
import logo from "./assets/logo.png"
import { useChat } from "ai/react"
import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {

    const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat()

    const noMessages = !messages || messages.length === 0 

    const handlePrompt = ( promptText ) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText, 
            role: "user",
        }
        append(msg)
    }

    return (
        <main>
            <Image src={ logo } width="650" alt="CrustData Logo"/>
            <section className={noMessages ? "" : "populated "}>
                {noMessages ? (
                    <>
                        <p className = "starter-text">
                        Explore CrustData's APIs with ease! Have questions about CrustData's APIs? Our chatbot is here to help! Ask anything and get instant answers straight from our API documentation. Start chatting now!
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={ handlePrompt }/>
                    </>
                ) : (
                    <>
                    {messages.map((message, index) => (
                      <Bubble key={`message-${index}`} message={message} />
                    ))}
                    {isLoading && <LoadingBubble />}
                  </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input
                    className="question-box"
                    onChange={handleInputChange}
                    value={input}
                    placeholder="Ask me ..."
                />
                <input type="submit" />
            </form>
        </main>
    );
};

export default Home